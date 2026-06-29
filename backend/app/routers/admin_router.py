"""
Router de Administracao

Endpoints (todos exclusivos para administradores):
    GET    /admin/usuarios                      - lista usuarios
    PUT    /admin/usuarios/{cpf}/status         - bloqueia ou reativa um usuario
    DELETE /admin/usuarios/{cpf}                - exclui um usuario
    GET    /admin/anuncios                      - lista todos os anuncios
    DELETE /admin/anuncios/{id_anuncio}         - remove um anuncio irregular
"""

from fastapi import APIRouter, Depends, HTTPException
import oracledb

from app.database import get_connection
from app.dependencies import exigir_admin
from app.models import (
    UsuarioAdminResponse,
    StatusContaRequest, StatusContaResponse,
    AnuncioAdminResponse, PessoaResumo,
)

router = APIRouter(prefix="/admin", tags=["Administracao"])


@router.get("/usuarios", response_model=list[UsuarioAdminResponse])
def listar_usuarios(admin: dict = Depends(exigir_admin)):
    """Lista todos os usuarios cadastrados na plataforma."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT p.cpf, p.nome, p.login, u.status_conta, u.data_cadastro
            FROM PESSOA p
            JOIN USUARIO u ON u.cpf_pessoa = p.cpf
            ORDER BY p.nome
            """
        )
        linhas = cursor.fetchall()

    return [
        UsuarioAdminResponse(cpf=cpf, nome=nome, login=login, status_conta=status, data_cadastro=data)
        for cpf, nome, login, status, data in linhas
    ]


@router.put("/usuarios/{cpf}/status", response_model=StatusContaResponse)
def alterar_status_usuario(cpf: str, dados: StatusContaRequest, admin: dict = Depends(exigir_admin)):
    """
    Bloqueia ou reativa a conta de um usuario (RN11 passa a se aplicar
    automaticamente a partir desta mudanca, via triggers de ANUNCIO/VENDA).
    """
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM USUARIO WHERE cpf_pessoa = :cpf", {"cpf": cpf})
        (existe,) = cursor.fetchone()

        if not existe:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado.")

        cursor.execute(
            "UPDATE USUARIO SET status_conta = :status WHERE cpf_pessoa = :cpf",
            {"status": dados.status_conta, "cpf": cpf},
        )
        conn.commit()

    return StatusContaResponse(cpf=cpf, status_conta=dados.status_conta)


@router.delete("/usuarios/{cpf}", status_code=204)
def excluir_usuario(cpf: str, admin: dict = Depends(exigir_admin)):
    """
    Exclui um usuario. O trigger trg_bloqueia_exclusao_usuario (RN10)
    impede a exclusao se o usuario possuir anuncios ativos ou pagamentos
    pendentes.
    """
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM USUARIO WHERE cpf_pessoa = :cpf", {"cpf": cpf})
        (existe,) = cursor.fetchone()

        if not existe:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado.")

        try:
            # A FK USUARIO.cpf_pessoa -> PESSOA tem ON DELETE CASCADE, mas o
            # trigger BEFORE DELETE ON USUARIO dispara antes de qualquer
            # exclusao em cascata, entao basta excluir aqui em USUARIO.
            cursor.execute("DELETE FROM USUARIO WHERE cpf_pessoa = :cpf", {"cpf": cpf})

            # Se o usuario nao for tambem administrador, remove o registro
            # de PESSOA por completo. Se for, mantem (pois ainda e admin).
            cursor.execute("SELECT COUNT(*) FROM ADMINISTRADOR WHERE cpf_pessoa = :cpf", {"cpf": cpf})
            (eh_tambem_admin,) = cursor.fetchone()

            if not eh_tambem_admin:
                cursor.execute("DELETE FROM PESSOA WHERE cpf = :cpf", {"cpf": cpf})

            conn.commit()

        except oracledb.DatabaseError as erro:
            conn.rollback()
            mensagem_erro = str(erro)

            # RN10 - trg_bloqueia_exclusao_usuario
            if "ORA-20005" in mensagem_erro:
                raise HTTPException(status_code=409, detail="Usuario possui anuncios ativos e nao pode ser excluido.")
            if "ORA-20006" in mensagem_erro:
                raise HTTPException(status_code=409, detail="Usuario possui pagamentos pendentes e nao pode ser excluido.")

            raise HTTPException(status_code=400, detail="Nao foi possivel excluir o usuario.")

    return None


@router.get("/anuncios", response_model=list[AnuncioAdminResponse])
def listar_todos_anuncios(admin: dict = Depends(exigir_admin)):
    """Lista todos os anuncios da plataforma, incluindo vendidos/encerrados."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT a.id_anuncio, a.valor_anunciado, a.status, p.cpf, p.nome
            FROM ANUNCIO a
            JOIN PESSOA p ON p.cpf = a.cpf_anunciante
            ORDER BY a.id_anuncio DESC
            """
        )
        linhas = cursor.fetchall()

    return [
        AnuncioAdminResponse(
            id_anuncio=id_anuncio,
            valor_anunciado=valor,
            status=status,
            anunciante=PessoaResumo(cpf=cpf_anunciante, nome=nome_anunciante),
        )
        for id_anuncio, valor, status, cpf_anunciante, nome_anunciante in linhas
    ]


@router.delete("/anuncios/{id_anuncio}", status_code=204)
def remover_anuncio_irregular(id_anuncio: int, admin: dict = Depends(exigir_admin)):
    """Remove (encerra) um anuncio considerado irregular pela moderacao."""
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM ANUNCIO WHERE id_anuncio = :id", {"id": id_anuncio})
        (existe,) = cursor.fetchone()

        if not existe:
            raise HTTPException(status_code=404, detail="Anuncio nao encontrado.")

        cursor.execute(
            "UPDATE ANUNCIO SET status = 'ENCERRADO' WHERE id_anuncio = :id",
            {"id": id_anuncio},
        )
        conn.commit()

    return None