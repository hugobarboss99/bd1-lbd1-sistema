"""
Router de Anuncios

Endpoints:
    GET    /anuncios              - lista anuncios ativos (vitrine, publico)
    GET    /anuncios/{id}         - detalhes de um anuncio (publico)
    POST   /anuncios              - cria um novo anuncio
    PUT    /anuncios/{id}         - edita o valor de um anuncio (so o dono)
    DELETE /anuncios/{id}         - remove/encerra um anuncio (so o dono)
"""

from fastapi import APIRouter, Depends, HTTPException
import oracledb

from app.database import get_connection
from app.dependencies import exigir_usuario
from app.models import (
    AnuncioListaResponse, CarroResumo,
    AnuncioDetalheResponse, PessoaResumo, CarroDetalhe, ManutencaoResumo,
    AnuncioCreateRequest, AnuncioCreateResponse,
    AnuncioUpdateRequest, AnuncioUpdateResponse,
)

router = APIRouter(prefix="/anuncios", tags=["Anuncios"])


@router.get("", response_model=list[AnuncioListaResponse])
def listar_anuncios(marca: str = None, valor_min: float = None, valor_max: float = None, ano_min: int = None):
    """
    Lista os anuncios com status ATIVO (vitrine). Aceita filtros opcionais
    via query string, conforme o contrato.
    """
    filtros_sql = ["a.status = 'ATIVO'"]
    parametros = {}

    if marca:
        filtros_sql.append("UPPER(c.marca) = UPPER(:marca)")
        parametros["marca"] = marca
    if valor_min is not None:
        filtros_sql.append("a.valor_anunciado >= :valor_min")
        parametros["valor_min"] = valor_min
    if valor_max is not None:
        filtros_sql.append("a.valor_anunciado <= :valor_max")
        parametros["valor_max"] = valor_max
    if ano_min is not None:
        filtros_sql.append("c.ano >= :ano_min")
        parametros["ano_min"] = ano_min

    where_clause = " AND ".join(filtros_sql)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"""
            SELECT a.id_anuncio, a.valor_anunciado, a.data_publicacao,
                   c.chassi, c.marca, c.modelo, c.ano, c.km_rodados
            FROM ANUNCIO a
            JOIN CARRO c ON c.chassi = a.chassi_carro
            WHERE {where_clause}
            ORDER BY a.data_publicacao DESC
            """,
            parametros,
        )
        linhas = cursor.fetchall()

        resultado = []
        for id_anuncio, valor_anunciado, data_publicacao, chassi, marca_carro, modelo, ano, km_rodados in linhas:
            cursor.execute(
                """
                SELECT url_foto FROM FOTO_CARRO
                WHERE chassi_carro = :chassi AND sequencia_foto = 1
                """,
                {"chassi": chassi},
            )
            foto_row = cursor.fetchone()
            foto_capa = foto_row[0] if foto_row else None

            resultado.append(
                AnuncioListaResponse(
                    id_anuncio=id_anuncio,
                    valor_anunciado=valor_anunciado,
                    data_publicacao=data_publicacao,
                    foto_capa=foto_capa,
                    carro=CarroResumo(marca=marca_carro, modelo=modelo, ano=ano, km_rodados=km_rodados),
                )
            )

    return resultado


@router.get("/{id_anuncio}", response_model=AnuncioDetalheResponse)
def detalhes_anuncio(id_anuncio: int):
    """
    Retorna os detalhes completos de um anuncio: dados do carro , dados do anunciante, e historico de manutencoes do veiculo.
    """
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT a.id_anuncio, a.valor_anunciado, a.data_publicacao, a.status,
                   p.cpf, p.nome,
                   c.chassi, c.marca, c.modelo, c.ano, c.km_rodados, c.placa, c.cor
            FROM ANUNCIO a
            JOIN CARRO c ON c.chassi = a.chassi_carro
            JOIN PESSOA p ON p.cpf = a.cpf_anunciante
            WHERE a.id_anuncio = :id
            """,
            {"id": id_anuncio},
        )
        linha = cursor.fetchone()

        if linha is None:
            raise HTTPException(status_code=404, detail="Anuncio nao encontrado.")

        (id_anuncio, valor_anunciado, data_publicacao, status,
         cpf_anunciante, nome_anunciante,
         chassi, marca, modelo, ano, km_rodados, placa, cor) = linha

        cursor.execute(
            "SELECT url_foto FROM FOTO_CARRO WHERE chassi_carro = :chassi ORDER BY sequencia_foto",
            {"chassi": chassi},
        )
        fotos = [l[0] for l in cursor.fetchall()]

        cursor.execute(
            """
            SELECT descricao, custo, data_manutencao
            FROM MANUTENCAO
            WHERE chassi_carro = :chassi
            ORDER BY sequencia_manutencao
            """,
            {"chassi": chassi},
        )
        manutencoes = [
            ManutencaoResumo(descricao=desc, custo=custo, data_manutencao=data)
            for desc, custo, data in cursor.fetchall()
        ]

    return AnuncioDetalheResponse(
        id_anuncio=id_anuncio,
        valor_anunciado=valor_anunciado,
        data_publicacao=data_publicacao,
        status=status,
        anunciante=PessoaResumo(cpf=cpf_anunciante, nome=nome_anunciante),
        carro=CarroDetalhe(
            chassi=chassi, marca=marca, modelo=modelo, ano=ano,
            km_rodados=km_rodados, placa=placa, cor=cor, fotos=fotos,
        ),
        manutencoes=manutencoes,
    )


@router.post("", response_model=AnuncioCreateResponse, status_code=201)
def criar_anuncio(dados: AnuncioCreateRequest, usuario: dict = Depends(exigir_usuario)):
    """
    Cria um novo anuncio para um carro do usuario logado.

    Triggers:
        - RN03: nao pode haver 2 anuncios ATIVOS para o mesmo carro
        - RN11: usuario com conta BLOQUEADA nao pode criar anuncio
    """
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT cpf_dono FROM CARRO WHERE chassi = :chassi", {"chassi": dados.chassi_carro})
        resultado = cursor.fetchone()

        if resultado is None:
            raise HTTPException(status_code=404, detail="Carro nao encontrado.")

        (cpf_dono,) = resultado
        if cpf_dono != cpf_logado:
            raise HTTPException(status_code=403, detail="Voce nao tem permissao para anunciar este carro.")

        try:
            cursor.execute(
                """
                INSERT INTO ANUNCIO (chassi_carro, cpf_anunciante, valor_anunciado)
                VALUES (:chassi, :cpf, :valor)
                """,
                {"chassi": dados.chassi_carro, "cpf": cpf_logado, "valor": dados.valor_anunciado},
            )

            # Recupera o id gerado pela sequence para devolver na resposta
            cursor.execute(
                """
                SELECT id_anuncio, status FROM ANUNCIO
                WHERE chassi_carro = :chassi AND cpf_anunciante = :cpf
                ORDER BY id_anuncio DESC FETCH FIRST 1 ROW ONLY
                """,
                {"chassi": dados.chassi_carro, "cpf": cpf_logado},
            )
            id_gerado, status_gerado = cursor.fetchone()

            conn.commit()

        except oracledb.DatabaseError as erro:
            conn.rollback()
            mensagem_erro = str(erro)

            # RN03 - trg_unico_anuncio_ativo
            if "ORA-20001" in mensagem_erro:
                raise HTTPException(status_code=400, detail="Este veiculo ja possui um anuncio ativo.")

            # RN11 - trg_bloqueia_usuario_bloqueado
            if "ORA-20007" in mensagem_erro:
                raise HTTPException(status_code=403, detail="Usuario bloqueado nao pode criar anuncios.")

            # Erro inesperado - repassa como erro generico de servidor
            raise HTTPException(status_code=400, detail="Nao foi possivel criar o anuncio.")

    return AnuncioCreateResponse(id_anuncio=id_gerado, status=status_gerado)


@router.put("/{id_anuncio}", response_model=AnuncioUpdateResponse)
def editar_anuncio(id_anuncio: int, dados: AnuncioUpdateRequest, usuario: dict = Depends(exigir_usuario)):
    """
    Edita o valor anunciado de um anuncio. Apenas o proprio anunciante
    pode editar.
    """
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT cpf_anunciante FROM ANUNCIO WHERE id_anuncio = :id", {"id": id_anuncio})
        resultado = cursor.fetchone()

        if resultado is None:
            raise HTTPException(status_code=404, detail="Anuncio nao encontrado.")

        (cpf_anunciante,) = resultado
        if cpf_anunciante != cpf_logado:
            raise HTTPException(status_code=403, detail="Voce nao tem permissao para editar este anuncio.")

        cursor.execute(
            "UPDATE ANUNCIO SET valor_anunciado = :valor WHERE id_anuncio = :id",
            {"valor": dados.valor_anunciado, "id": id_anuncio},
        )
        conn.commit()

    return AnuncioUpdateResponse(id_anuncio=id_anuncio, valor_anunciado=dados.valor_anunciado)


@router.delete("/{id_anuncio}", status_code=204)
def remover_anuncio(id_anuncio: int, usuario: dict = Depends(exigir_usuario)):
    """
    Remove/encerra um anuncio. Apenas o proprio anunciante pode remover.
    Em vez de excluir a linha (o que apagaria o historico), o anuncio e
    marcado como ENCERRADO.
    """
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT cpf_anunciante FROM ANUNCIO WHERE id_anuncio = :id", {"id": id_anuncio})
        resultado = cursor.fetchone()

        if resultado is None:
            raise HTTPException(status_code=404, detail="Anuncio nao encontrado.")

        (cpf_anunciante,) = resultado
        if cpf_anunciante != cpf_logado:
            raise HTTPException(status_code=403, detail="Voce nao tem permissao para remover este anuncio.")

        cursor.execute(
            "UPDATE ANUNCIO SET status = 'ENCERRADO' WHERE id_anuncio = :id",
            {"id": id_anuncio},
        )
        conn.commit()

    return None