"""
Router de Vendas e Pagamentos:

Endpoints:
    POST /vendas                           - confirma a compra de um anuncio
    POST /vendas/{id_venda}/pagamentos     - registra uma parcela de pagamento
    GET  /vendas/minhas-compras            - historico de compras do usuario logado
    GET  /vendas/minhas-vendas             - historico de vendas do usuario logado
"""

from fastapi import APIRouter, Depends, HTTPException
import oracledb

from app.database import get_connection
from app.dependencies import exigir_usuario
from app.models import (
    VendaCreateRequest, VendaCreateResponse,
    PagamentoRequest, PagamentoResponse,
    MinhaCompraResponse, CarroResumoVenda, PagamentoResumo,
    MinhaVendaResponse, CompradorResumo,
)

router = APIRouter(prefix="/vendas", tags=["Vendas"])

# quando você clica em comprar:
@router.post("", response_model=VendaCreateResponse, status_code=201)
def confirmar_compra(dados: VendaCreateRequest, usuario: dict = Depends(exigir_usuario)):
    """
    Registra a compra de um anuncio pelo usuario logado.

    Ao inserir em VENDA -> triggers disparam automaticamente:
        - RN04 (trg_bloqueia_compra_propria): bloqueia comprar o proprio anuncio
        - RN07 (trg_bloqueia_venda_anuncio_inativo): exige anuncio ATIVO
        - RN11 (trg_bloqueia_compra_usuario_bloqueado): bloqueia usuario BLOQUEADO
        - RN05 (trg_encerra_anuncio_vendido): muda o anuncio para VENDIDO
        - fluxo de propriedade (trg_transfere_dono_carro): atualiza CARRO.cpf_dono
    """
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT valor_anunciado FROM ANUNCIO WHERE id_anuncio = :id",
            {"id": dados.id_anuncio},
        )
        resultado = cursor.fetchone()

        if resultado is None:
            raise HTTPException(status_code=404, detail="Anuncio nao encontrado.")

        (valor_anuncio,) = resultado

        try:
            cursor.execute(
                """
                INSERT INTO VENDA (id_anuncio, cpf_comprador, valor)
                VALUES (:id_anuncio, :cpf_comprador, :valor)
                """,
                {"id_anuncio": dados.id_anuncio, "cpf_comprador": cpf_logado, "valor": valor_anuncio},
            )

            cursor.execute(
                """
                SELECT id_venda, data_venda FROM VENDA
                WHERE id_anuncio = :id_anuncio
                ORDER BY id_venda DESC FETCH FIRST 1 ROW ONLY
                """,
                {"id_anuncio": dados.id_anuncio},
            )
            id_venda_gerado, data_venda_gerada = cursor.fetchone()

            conn.commit()

        except oracledb.DatabaseError as erro:
            conn.rollback()
            mensagem_erro = str(erro)

            # RN04 - trg_bloqueia_compra_propria
            if "ORA-20002" in mensagem_erro:
                raise HTTPException(status_code=400, detail="Usuario nao pode comprar o proprio anuncio.")

            # RN07 - trg_bloqueia_venda_anuncio_inativo
            if "ORA-20003" in mensagem_erro:
                raise HTTPException(status_code=409, detail="Anuncio nao esta ativo.")

            # RN11 - trg_bloqueia_compra_usuario_bloqueado
            if "ORA-20008" in mensagem_erro:
                raise HTTPException(status_code=403, detail="Usuario bloqueado nao pode realizar compras.")

            raise HTTPException(status_code=400, detail="Nao foi possivel concluir a compra.")

    return VendaCreateResponse(
        id_venda=id_venda_gerado,
        id_anuncio=dados.id_anuncio,
        valor=valor_anuncio,
        data_venda=data_venda_gerada,
    )


@router.post("/{id_venda}/pagamentos", response_model=PagamentoResponse, status_code=201)
def registrar_pagamento(id_venda: int, dados: PagamentoRequest, usuario: dict = Depends(exigir_usuario)):
    """
    Registra uma parcela de pagamento para uma venda. Apenas o comprador
    da venda pode registrar pagamentos para ela.

    A coluna 'parcela' e calculada automaticamente pelo trigger
    trg_numera_parcela. O trigger trg_valida_soma_pagamento (RN08) garante
    que a soma das parcelas nao excede o valor da venda.
    """
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT cpf_comprador FROM VENDA WHERE id_venda = :id", {"id": id_venda})
        resultado = cursor.fetchone()

        if resultado is None:
            raise HTTPException(status_code=404, detail="Venda nao encontrada.")

        (cpf_comprador,) = resultado
        if cpf_comprador != cpf_logado:
            raise HTTPException(status_code=403, detail="Voce nao tem permissao para pagar esta venda.")

        try:
            cursor.execute(
                """
                INSERT INTO PAGAMENTO (id_venda, valor, tipo_pagamento)
                VALUES (:id_venda, :valor, :tipo)
                """,
                {"id_venda": id_venda, "valor": dados.valor, "tipo": dados.tipo_pagamento},
            )

            cursor.execute(
                """
                SELECT parcela, status_pagamento FROM PAGAMENTO
                WHERE id_venda = :id_venda
                ORDER BY parcela DESC FETCH FIRST 1 ROW ONLY
                """,
                {"id_venda": id_venda},
            )
            parcela_gerada, status_gerado = cursor.fetchone()

            conn.commit()

        except oracledb.DatabaseError as erro:
            conn.rollback()
            mensagem_erro = str(erro)

            # RN08 - trg_valida_soma_pagamento
            if "ORA-20004" in mensagem_erro:
                raise HTTPException(status_code=400, detail="Soma dos pagamentos excede o valor da venda.")

            raise HTTPException(status_code=400, detail="Nao foi possivel registrar o pagamento.")

    return PagamentoResponse(
        id_venda=id_venda,
        parcela=parcela_gerada,
        valor=dados.valor,
        status_pagamento=status_gerado,
    )


@router.get("/minhas-compras", response_model=list[MinhaCompraResponse])
def minhas_compras(usuario: dict = Depends(exigir_usuario)):
    """Lista o historico de compras do usuario logado, com seus pagamentos."""
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT v.id_venda, v.valor, v.data_venda, c.marca, c.modelo, c.placa
            FROM VENDA v
            JOIN ANUNCIO a ON a.id_anuncio = v.id_anuncio
            JOIN CARRO c ON c.chassi = a.chassi_carro
            WHERE v.cpf_comprador = :cpf
            ORDER BY v.data_venda DESC
            """,
            {"cpf": cpf_logado},
        )
        linhas = cursor.fetchall()

        resultado = []
        for id_venda, valor, data_venda, marca, modelo, placa in linhas:
            cursor.execute(
                """
                SELECT parcela, valor, status_pagamento
                FROM PAGAMENTO
                WHERE id_venda = :id_venda
                ORDER BY parcela
                """,
                {"id_venda": id_venda},
            )
            pagamentos = [
                PagamentoResumo(parcela=p, valor=v, status_pagamento=s)
                for p, v, s in cursor.fetchall()
            ]

            resultado.append(
                MinhaCompraResponse(
                    id_venda=id_venda,
                    valor=valor,
                    data_venda=data_venda,
                    carro=CarroResumoVenda(marca=marca, modelo=modelo, placa=placa),
                    pagamentos=pagamentos,
                )
            )

    return resultado


@router.get("/minhas-vendas", response_model=list[MinhaVendaResponse])
def minhas_vendas(usuario: dict = Depends(exigir_usuario)):
    """Lista os anuncios do usuario logado que foram vendidos."""
    cpf_logado = usuario["cpf"]

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT v.id_venda, v.id_anuncio, v.valor, v.data_venda, p.nome
            FROM VENDA v
            JOIN ANUNCIO a ON a.id_anuncio = v.id_anuncio
            JOIN PESSOA p ON p.cpf = v.cpf_comprador
            WHERE a.cpf_anunciante = :cpf
            ORDER BY v.data_venda DESC
            """,
            {"cpf": cpf_logado},
        )
        linhas = cursor.fetchall()

    return [
        MinhaVendaResponse(
            id_venda=id_venda,
            id_anuncio=id_anuncio,
            valor=valor,
            data_venda=data_venda,
            comprador=CompradorResumo(nome=nome_comprador),
        )
        for id_venda, id_anuncio, valor, data_venda, nome_comprador in linhas
    ]