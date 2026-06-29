"""
Faz:
1. Hash de senha
2. Geracao de token JWT
3. Validacao de token JWT
"""

import os
import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRA_EM_HORAS = 8

# Contexto do passlib para hash de senha usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Transforma uma senha em texto puro em um hash:
def gerar_hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


# Compara uma senha em texto puro com o hash salvo no banco. Retorna boolean.
def verificar_senha(senha_texto_puro: str, hash_armazenado: str) -> bool:
    return pwd_context.verify(senha_texto_puro, hash_armazenado)

"""
    Gera um token JWT apos um login bem-sucedido.

    cpf
    nome
    tipo: "USUARIO" ou "ADMIN"

    Retorna a string do token, que o front-end vai
    reenviar no header Authorization de requisicoes futuras.
    """
def gerar_token(cpf: str, nome: str, tipo: str) -> str:
    payload = {
        "cpf": cpf,
        "nome": nome,
        "tipo": tipo,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRA_EM_HORAS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

"""
    Valida e decodifica um token JWT, retornando o payload (cpf, nome, tipo).

    Lanca jwt.ExpiredSignatureError se o token expirou, ou
    jwt.InvalidTokenError se o token for invalido por qualquer outro motivo.
"""

def decodificar_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])