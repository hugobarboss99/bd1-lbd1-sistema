"""
Router de Carros (Tela 5 - Meus Carros).

Endpoints:
    POST /carros                       - cadastra novo carro (com fotos opcionais)
    GET  /carros/meus                  - lista os carros do usuario logado
    POST /carros/{chassi}/fotos        - adiciona uma foto a um carro existente
    POST /carros/{chassi}/manutencoes  - registra uma manutencao no carro
"""

from fastapi import APIRouter, Depends, HTTPException
import oracledb

from app.database import get_connection
from app.dependencies import exigir_usuario
from app.models import (
    CarroCreateRequest, CarroCreateResponse,
    CarroMeuResponse,
    AdicionarFotoRequest, AdicionarFotoResponse,
    ManutencaoRequest, ManutencaoResponse,
    ManutencaoResumo,
)

router = APIRouter(prefix="/carros", tags=["Carros"])


@router.post("", response_model=CarroCreateResponse, status_code=201)
def cadastrar_carro(dados: CarroCreateRequest, usuario: dict = Depends(exigir_usuario)):
    """
    Cadastra um novo carro em nome do usuario logado. Se vier 'fotos' no
    JSON, cada URL e tambem inserida em FOTO_CARRO (a numeracao da
    sequencia_foto e automatica, via trigger no banco).
    """
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO CARRO (chassi, cpf_dono, marca, modelo, ano, km_rodados, placa, cor)
                VALUES (:chassi, :cpf_dono, :marca, :modelo, :ano, :km_rodados, :placa, :cor)
                """,
                {
                    "chassi": dados.chassi,
                    "cpf_dono": cpf_logado,
                    "marca": dados.marca,
                    "modelo": dados.modelo,
                    "ano": dados.ano,
                    "km_rodados": dados.km_rodados,
                    "placa": dados.placa,
                    "cor": dados.cor,
                },
            )

            fotos_cadastradas = 0
            for url in (dados.fotos or []):
                # sequencia_foto tem DEFAULT 0 e e recalculada pelo trigger
                cursor.execute(
                    "INSERT INTO FOTO_CARRO (chassi_carro, url_foto) VALUES (:chassi, :url)",
                    {"chassi": dados.chassi, "url": url},
                )
                fotos_cadastradas += 1

            conn.commit()

        except oracledb.IntegrityError:
            conn.rollback()
            raise HTTPException(status_code=409, detail="Chassi ou placa ja cadastrados.")

    return CarroCreateResponse(chassi=dados.chassi, fotos_cadastradas=fotos_cadastradas)


@router.get("/meus", response_model=list[CarroMeuResponse])
def listar_meus_carros(usuario: dict = Depends(exigir_usuario)):
    """
    Lista todos os carros do usuario logado, incluindo suas fotos e se
    possuem (ou nao) um anuncio ativo no momento.
    """
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT chassi, marca, modelo, ano, km_rodados, placa, cor
            FROM CARRO
            WHERE cpf_dono = :cpf
            ORDER BY chassi
            """,
            {"cpf": cpf_logado},
        )
        carros = cursor.fetchall()

        resultado = []
        for chassi, marca, modelo, ano, km_rodados, placa, cor in carros:
            # Verifica se ha algum anuncio ATIVO para este carro (RN03 garante no maximo 1)
            cursor.execute(
                "SELECT COUNT(*) FROM ANUNCIO WHERE chassi_carro = :chassi AND status = 'ATIVO'",
                {"chassi": chassi},
            )
            (tem_anuncio_ativo,) = cursor.fetchone()

            cursor.execute(
                """
                SELECT url_foto FROM FOTO_CARRO
                WHERE chassi_carro = :chassi
                ORDER BY sequencia_foto
                """,
                {"chassi": chassi},
            )
            fotos = [linha[0] for linha in cursor.fetchall()]

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

            resultado.append(
                CarroMeuResponse(
                    chassi=chassi,
                    marca=marca,
                    modelo=modelo,
                    ano=ano,
                    km_rodados=km_rodados,
                    placa=placa,
                    cor=cor,
                    tem_anuncio_ativo=bool(tem_anuncio_ativo),
                    fotos=fotos,
                    manutencoes=manutencoes,
                )
            )

    return resultado


@router.post("/{chassi}/fotos", response_model=AdicionarFotoResponse, status_code=201)
def adicionar_foto(chassi: str, dados: AdicionarFotoRequest, usuario: dict = Depends(exigir_usuario)):
    """
    Adiciona uma foto a um carro ja existente. Apenas o dono do carro pode
    adicionar fotos a ele.
    """
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT cpf_dono FROM CARRO WHERE chassi = :chassi", {"chassi": chassi})
        resultado = cursor.fetchone()

        if resultado is None:
            raise HTTPException(status_code=404, detail="Carro nao encontrado.")

        (cpf_dono,) = resultado
        if cpf_dono != cpf_logado:
            raise HTTPException(status_code=403, detail="Voce nao tem permissao para editar este carro.")

        # sequencia_foto e calculada automaticamente pelo trigger trg_numera_foto
        cursor.execute(
            """
            INSERT INTO FOTO_CARRO (chassi_carro, url_foto)
            VALUES (:chassi, :url)
            """,
            {"chassi": chassi, "url": dados.url_foto},
        )

        # Recupera a sequencia que o trigger gerou, para devolver na resposta
        cursor.execute(
            """
            SELECT MAX(sequencia_foto) FROM FOTO_CARRO WHERE chassi_carro = :chassi
            """,
            {"chassi": chassi},
        )
        (sequencia_gerada,) = cursor.fetchone()

        conn.commit()

    return AdicionarFotoResponse(chassi_carro=chassi, sequencia_foto=sequencia_gerada)


@router.post("/{chassi}/manutencoes", response_model=ManutencaoResponse, status_code=201)
def registrar_manutencao(chassi: str, dados: ManutencaoRequest, usuario: dict = Depends(exigir_usuario)):
    
    # Registra uma manutencao no historico do carro. 
    
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT cpf_dono FROM CARRO WHERE chassi = :chassi", {"chassi": chassi})
        resultado = cursor.fetchone()

        if resultado is None:
            raise HTTPException(status_code=404, detail="Carro nao encontrado.")

        (cpf_dono,) = resultado
        if cpf_dono != cpf_logado:
            raise HTTPException(status_code=403, detail="Voce nao tem permissao para editar este carro.")

        # tem trigger de numeracao automatica.

        cursor.execute(
            """
            INSERT INTO MANUTENCAO (chassi_carro, descricao, custo)
            VALUES (:chassi, :descricao, :custo)
            """,
            {
                "chassi": chassi,
                "descricao": dados.descricao,
                "custo": dados.custo,
            },
        )

        # Recupera a sequencia que o trigger gerou, para devolver na resposta
        cursor.execute(
            """
            SELECT MAX(sequencia_manutencao) FROM MANUTENCAO WHERE chassi_carro = :chassi
            """,
            {"chassi": chassi},
        )
        (sequencia_gerada,) = cursor.fetchone()

        conn.commit()

    return ManutencaoResponse(chassi_carro=chassi, sequencia_manutencao=sequencia_gerada)