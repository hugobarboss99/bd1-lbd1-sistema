"""
Router de autenticacao e cadastro.

Endpoints:
    POST /auth/cadastro     - cadastra uma nova pessoa como USUARIO
    POST /auth/login        - login de usuario comum
    POST /auth/login/admin  - login de administrador
"""

from fastapi import APIRouter, HTTPException
import oracledb

from app.database import get_connection
from app.auth import gerar_hash_senha, verificar_senha, gerar_token
from app.models import (
    CadastroRequest, CadastroResponse,
    LoginRequest, LoginResponse,
)

router = APIRouter(prefix="/auth", tags=["Autenticacao"])


@router.post("/cadastro", response_model=CadastroResponse, status_code=201)
def cadastrar(dados: CadastroRequest):
    """
    Cadastra uma nova pessoa no sistema, criando o registro em PESSOA e
    em USUARIO (toda pessoa cadastrada por aqui nasce como usuario comum;
    administradores sao cadastrados separadamente, fora do escopo publico).
    """
    senha_hash = gerar_hash_senha(dados.senha)

    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO PESSOA (cpf, nome, telefone, login, senha)
                VALUES (:cpf, :nome, :telefone, :login, :senha)
                """,
                {
                    "cpf": dados.cpf,
                    "nome": dados.nome,
                    "telefone": dados.telefone,
                    "login": dados.login,
                    "senha": senha_hash,
                },
            )

            cursor.execute(
                "INSERT INTO USUARIO (cpf_pessoa) VALUES (:cpf)",
                {"cpf": dados.cpf},
            )

            conn.commit()

        except oracledb.IntegrityError:
            conn.rollback()
            raise HTTPException(status_code=409, detail="CPF ou login ja cadastrado.")

    return CadastroResponse(cpf=dados.cpf, nome=dados.nome, login=dados.login)


@router.post("/login", response_model=LoginResponse)
def login_usuario(dados: LoginRequest):
    """
    Autentica um USUARIO (busca apenas na tabela USUARIO, atraves do JOIN
    com PESSOA). Retorna um token JWT com tipo="USUARIO".
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT p.cpf, p.nome, p.senha
            FROM PESSOA p
            JOIN USUARIO u ON u.cpf_pessoa = p.cpf
            WHERE p.login = :login
            """,
            {"login": dados.login},
        )
        resultado = cursor.fetchone()

    if resultado is None:
        raise HTTPException(status_code=401, detail="Login ou senha invalidos.")

    cpf, nome, senha_hash = resultado

    if not verificar_senha(dados.senha, senha_hash):
        raise HTTPException(status_code=401, detail="Login ou senha invalidos.")

    token = gerar_token(cpf=cpf, nome=nome, tipo="USUARIO")

    return LoginResponse(token=token, cpf=cpf, nome=nome)


@router.post("/login/admin", response_model=LoginResponse)
def login_admin(dados: LoginRequest):
    """
    Autentica um ADMINISTRADOR (busca apenas na tabela ADMINISTRADOR,
    atraves do JOIN com PESSOA). Retorna um token JWT com tipo="ADMIN".
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT p.cpf, p.nome, p.senha
            FROM PESSOA p
            JOIN ADMINISTRADOR a ON a.cpf_pessoa = p.cpf
            WHERE p.login = :login
            """,
            {"login": dados.login},
        )
        resultado = cursor.fetchone()

    if resultado is None:
        raise HTTPException(status_code=401, detail="Login ou senha invalidos.")

    cpf, nome, senha_hash = resultado

    if not verificar_senha(dados.senha, senha_hash):
        raise HTTPException(status_code=401, detail="Login ou senha invalidos.")

    token = gerar_token(cpf=cpf, nome=nome, tipo="ADMIN")

    return LoginResponse(token=token, cpf=cpf, nome=nome)