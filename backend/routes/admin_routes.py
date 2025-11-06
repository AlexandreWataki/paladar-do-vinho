# backend/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.models.wine import Wine, WineRecommendation, WineCreate
from backend.models.user import User
from backend.models.database import get_db
from backend.recommender import WineRecommender
from backend.security import verificar_admin  # ✅ controle de acesso de administrador

# ✅ Cria o roteador (deve vir antes de qualquer rota)
router = APIRouter(prefix="/admin/vinhos", tags=["Administração"])

# Instância global do recomendador (para recarregar os dados após alterações)
wine_recommender_instance = WineRecommender()


# ---------------------------
# LISTAR VINHOS
# ---------------------------
@router.get("/", response_model=List[WineRecommendation])
async def listar_vinhos_admin(
    db: Session = Depends(get_db),
    user: User = Depends(verificar_admin)
):
    vinhos = db.query(Wine).all()
    if not vinhos:
        raise HTTPException(status_code=404, detail="Nenhum vinho encontrado.")
    return [WineRecommendation.model_validate(v.__dict__) for v in vinhos]


# ---------------------------
# CRIAR VINHO
# ---------------------------
@router.post("/", response_model=WineRecommendation, status_code=status.HTTP_201_CREATED)
async def criar_vinho_admin(
    dados_vinho: WineCreate,
    db: Session = Depends(get_db),
    user: User = Depends(verificar_admin)
):
    novo_vinho = Wine(**dados_vinho.model_dump())
    db.add(novo_vinho)
    db.commit()
    db.refresh(novo_vinho)

    # Recarrega o recomendador global (mantém o sistema atualizado)
    global wine_recommender_instance
    wine_recommender_instance = WineRecommender()

    return WineRecommendation.model_validate(novo_vinho.__dict__)


# ---------------------------
# ATUALIZAR VINHO
# ---------------------------
@router.put("/{vinho_id}", response_model=WineRecommendation)
async def atualizar_vinho_admin(
    vinho_id: int,
    dados_vinho: WineCreate,
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

    return WineRecommendation.model_validate(vinho.__dict__)


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
