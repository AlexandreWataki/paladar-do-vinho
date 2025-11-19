# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
import uvicorn

from backend.models.database import Base, engine

# rotas
from backend.routes import auth_routes, recommendation_routes
from backend.routes.admin_routes import router as admin_router


print("🚀 Inicializando FastAPI...")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Paladar de Vinho API",
    description="API de recomendação de vinhos",
    version="1.0.0",
)


# -------------------------------
# CORS
# -------------------------------
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1",
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
# OpenAPI personalizado
# -------------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # ADICIONA SUPORTE AUTENTICAÇÃO BEARER NO SWAGGER ⚠️
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # aplica Bearer como padrão em TODAS rotas protegidas
    for path in schema["paths"].values():
        for method in path.values():
            if "security" not in method:
                method["security"] = [{"BearerAuth": []}]

    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi


# -------------------------------
# Registro das rotas
# -------------------------------
app.include_router(auth_routes.router)
app.include_router(admin_router)
app.include_router(recommendation_routes.router)


# -------------------------------
# Teste
# -------------------------------
@app.get("/")
def root():
    return {"message": "API ativa!"}


if __name__ == "__main__":
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
