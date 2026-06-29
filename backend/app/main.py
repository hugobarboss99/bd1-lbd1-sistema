"""
Para rodar (a partir da pasta backend):
    uvicorn app.main:app --reload --port 8000

Documentação:
    http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AutoTroca API")

# CORS: se não dá erro com o frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def raiz():
    # End point para ver se esta no ar
    return {"mensagem": "AutoTroca API rodando."}


from app.routers import auth_router, carros_router, anuncios_router, vendas_router, admin_router
app.include_router(auth_router.router)
app.include_router(carros_router.router)
app.include_router(anuncios_router.router)
app.include_router(vendas_router.router)
app.include_router(admin_router.router)