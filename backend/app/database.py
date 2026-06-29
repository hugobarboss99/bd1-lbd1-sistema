"""
Modulo responsavel pela conexao com o banco de dados Oracle.

Usa um POOL de conexoes (em vez de abrir/fechar uma conexao nova a cada
requisicao), o que e mais eficiente e e a pratica recomendada pelo proprio
driver python-oracledb.
"""

import os
import oracledb
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_DSN = os.getenv("DB_DSN")
WALLET_PASSWORD = os.getenv("WALLET_PASSWORD")
WALLET_DIR = os.path.join(os.path.dirname(__file__), "..", "wallet")

# Pool de conexoes - criado uma unica vez, quando o backend inicia
pool = oracledb.create_pool(
    user=DB_USER,
    password=DB_PASSWORD,
    dsn=DB_DSN,
    config_dir=WALLET_DIR,
    wallet_location=WALLET_DIR,
    wallet_password=WALLET_PASSWORD,
    min=2,       # numero minimo de conexoes mantidas abertas
    max=10,      # numero maximo de conexoes simultaneas
    increment=1,
)


def get_connection():
    """
    Retorna uma conexao do pool. Deve ser usada com 'with' para garantir
    que a conexao volte ao pool automaticamente ao final do uso:

        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM DUAL")
    """
    return pool.acquire()


def fetch_as_dict(cursor):
    """
    Funcao auxiliar: converte o resultado de um cursor.fetchall() em uma
    lista de dicionarios, usando os nomes das colunas retornadas pela
    consulta. Isso facilita a serializacao para JSON pelo FastAPI.

    Exemplo:
        cursor.execute("SELECT cpf, nome FROM PESSOA")
        resultado = fetch_as_dict(cursor)
        # resultado = [{"CPF": "123...", "NOME": "Maria"}, ...]
    """
    colunas = [col[0] for col in cursor.description]
    return [dict(zip(colunas, linha)) for linha in cursor.fetchall()]