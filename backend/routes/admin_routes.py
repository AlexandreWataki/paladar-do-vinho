# backend/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Importe WineRead aqui
from backend.models.wine import Wine, WineRecommendation, WineCreate, WineRead 
# ^ Certifique-se de que WineRead está nesta importação

from backend.models.user import User
from backend.models.database import get_db
from backend.recommender import WineRecommender
from backend.security import verificar_admin 

# ---------------------------
# 1. CRIAÇÃO DO ROUTER (CORREÇÃO DA ORDEM)
# ---------------------------
# ✅ CORREÇÃO: Deve ser a primeira coisa no arquivo para evitar NameError
router = APIRouter(prefix="/admin/vinhos", tags=["Administração"]) 

# Instância global do recomendador
wine_recommender_instance = WineRecommender()


# ---------------------------
# LISTAR VINHOS
# ---------------------------
@router.get("/", response_model=List[WineRead]) 
async def listar_vinhos_admin(
    db: Session = Depends(get_db),
    user: User = Depends(verificar_admin)
):
    vinhos = db.query(Wine).all()
    if not vinhos:
        # Nota: Retornar uma lista vazia ([]) é comum, mas o 404 está OK se a lista for nula
        raise HTTPException(status_code=404, detail="Nenhum vinho encontrado.")
        
    # ✅ CORREÇÃO: Usa WineRead, que mapeia os tipos INT do banco, resolvendo o Erro 500
    return [WineRead.model_validate(v.__dict__) for v in vinhos]


# ---------------------------
# CRIAR VINHO
# ---------------------------
# 🛑 CORREÇÃO: Retorna WineRead (o objeto lido do DB) em vez de WineCreate (schema de input)
@router.post("/", response_model=WineRead, status_code=status.HTTP_201_CREATED) 
async def criar_vinho_admin(
    dados_vinho: WineCreate,
    db: Session = Depends(get_db),
    user: User = Depends(verificar_admin)
):
    # Cria o objeto Wine (ORM) a partir do input (WineCreate)
    novo_vinho = Wine(**dados_vinho.model_dump())
    db.add(novo_vinho)
    db.commit()
    db.refresh(novo_vinho)

    # Recarrega o recomendador global (mantém o sistema atualizado)
    global wine_recommender_instance
    wine_recommender_instance = WineRecommender()

    # ✅ Retorna o objeto recém-criado, validado com o schema de leitura
    return WineRead.model_validate(novo_vinho.__dict__)


# ---------------------------
# ATUALIZAR VINHO
# ---------------------------
# 🛑 CORREÇÃO: Retorna WineRead (o objeto lido do DB) em vez de WineCreate (schema de input)
@router.put("/{vinho_id}", response_model=WineRead) 
async def atualizar_vinho_admin(
    vinho_id: int,
    dados_vinho: WineCreate, # Usa WineCreate para receber o INPUT
    db: Session = Depends(get_db),
    user: User = Depends(verificar_admin)
):
    vinho = db.query(Wine).filter(Wine.id == vinho_id).first()
    if not vinho:
        raise HTTPException(status_code=404, detail="Vinho não encontrado.")

    for k, v in dados_vinho.model_dump(exclude_unset=True).items():
        setattr(vinho, k, v)
    db.commit()
    db.refresh(vinho)

    # Atualiza recomendador global
    global wine_recommender_instance
    wine_recommender_instance = WineRecommender()

    # ✅ Retorna o objeto atualizado, validado com o schema de leitura
    return WineRead.model_validate(vinho.__dict__)


# ---------------------------
# DELETAR VINHO
# ---------------------------
@router.delete("/{vinho_id}")
async def deletar_vinho_admin(
    vinho_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(verificar_admin)
):
    vinho = db.query(Wine).filter(Wine.id == vinho_id).first()
    if not vinho:
        raise HTTPException(status_code=404, detail="Vinho não encontrado.")

    db.delete(vinho)
    db.commit()

    global wine_recommender_instance
    wine_recommender_instance = WineRecommender()

    return {"message": f"Vinho ID {vinho_id} deletado com sucesso."}


# ---------------------------
# RESETAR BANCO DE VINHOS
# ---------------------------
@router.delete("/reset")
async def resetar_banco_vinhos_admin(
    db: Session = Depends(get_db),
    user: User = Depends(verificar_admin)
):
    num_deletados = db.query(Wine).delete()
    db.commit()

    global wine_recommender_instance
    wine_recommender_instance = WineRecommender()

    return {"message": f"{num_deletados} vinhos foram deletados e o banco foi resetado."}