"""
Dependencias do FastAPI para protecao de rotas.

Uma "dependency" no FastAPI e uma funcao que roda ANTES do codigo da rota,
e cujo retorno fica disponivel dentro da funcao da rota. Aqui usamos isso
para extrair e validar o token JWT do header Authorization.

Uso tipico em um router:

    from app.dependencies import exigir_usuario

    @router.get("/carros/meus")
    def listar_meus_carros(usuario: dict = Depends(exigir_usuario)):
        cpf_logado = usuario["cpf"]
        ...
"""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from app.auth import decodificar_token

# Declara para o FastAPI/Swagger que estas rotas usam autenticacao do tipo "Bearer Token".

security_scheme = HTTPBearer()

"""
    Dependency para rotas que exigem qualquer pessoa logada (usuario ou
    admin).

    Retorna um dict: {"cpf": ..., "nome": ..., "tipo": "USUARIO" ou "ADMIN"}
"""
def obter_usuario_logado(
    credenciais: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    
    token = credenciais.credentials  # o HTTPBearer ja extrai so o token, sem o prefixo "Bearer "

    try:
        payload = decodificar_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado. Faca login novamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalido.")

    return payload

 """
    Dependency para rotas que exigem um token gerado pelo
    login de USUARIO (ex: /carros, /anuncios, /vendas).

    Bloqueia com 403 se o token for de um ADMIN.
"""
def exigir_usuario(
    credenciais: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
   
    payload = obter_usuario_logado(credenciais)

    if payload.get("tipo") != "USUARIO":
        raise HTTPException(status_code=403, detail="Esta rota e exclusiva para usuarios.")

    return payload


"""
    Dependency para rotas que exigem especificamente um token gerado pelo
    login de ADMINISTRADOR (ex: /admin/usuarios, /admin/anuncios).

    Bloqueia com 403 se o token for de um USUARIO.
"""
def exigir_admin(
    credenciais: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    
    payload = obter_usuario_logado(credenciais)

    if payload.get("tipo") != "ADMIN":
        raise HTTPException(status_code=403, detail="Esta rota e exclusiva para administradores.")

    return payload