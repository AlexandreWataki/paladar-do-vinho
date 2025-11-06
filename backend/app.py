# backend/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- MODELS / DATABASE ---
from backend.models.database import Base, engine

# --- ROUTES ---
from backend.routes import auth_routes, recommendation_routes
from backend.routes.admin_routes import router as admin_router

# -------------------------------
# 1️⃣ CONFIGURAÇÃO INICIAL
# -------------------------------
# Cria as tabelas no banco de dados (caso não existam)
Base.metadata.create_all(bind=engine)

# ✅ Instancia o aplicativo FastAPI com debug ativado
app = FastAPI(
    title="Paladar de Vinho API",
    debug=True  # Exibe erros detalhados no navegador e terminal
)

# -------------------------------
# 2️⃣ CONFIGURAÇÃO DO CORS
# -------------------------------
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# 3️⃣ REGISTRO DAS ROTAS
# -------------------------------
# Autenticação de usuários e admins
app.include_router(auth_routes.router)             # /auth/...

# Rotas do administrador (CRUD de vinhos)
app.include_router(admin_router)                   # /admin/vinhos/...

# Recomendação de vinhos para usuários
app.include_router(recommendation_routes.router)   # /recommendations/...

# -------------------------------
# 4️⃣ ENDPOINT RAIZ (teste)
# -------------------------------
@app.get("/")
def root():
    return {
        "message": "🍷 API do Paladar de Vinho está ativa!",
        "endpoints": [
            "/auth/login",
            "/admin/vinhos",
            "/recommendations",
        ],
    }

# -------------------------------
# 5️⃣ EXECUÇÃO LOCAL
# -------------------------------
if __name__ == "__main__":
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
