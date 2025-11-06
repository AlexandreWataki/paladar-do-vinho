# backend/routes/recommendation_routes.py

from fastapi import APIRouter, HTTPException, status
from typing import List

from backend.models.wine import WineQuestionnaire, WineRecommendation
from backend.recommender import WineRecommender

# -------------------------------------------------------------
# CONFIGURAÇÃO INICIAL
# -------------------------------------------------------------
router = APIRouter(prefix="/recommendations", tags=["Recomendação"])

# Inicializa o recomendador globalmente
try:
    wine_recommender_instance = WineRecommender()
    print("✅ WineRecommender inicializado com sucesso.")
except Exception as e:
    print(f"❌ ERRO: Falha ao inicializar WineRecommender: {e}")
    wine_recommender_instance = None


# -------------------------------------------------------------
# ENDPOINT: RECOMENDAÇÃO DE VINHOS
# -------------------------------------------------------------
@router.post("/", response_model=List[WineRecommendation], status_code=status.HTTP_200_OK)
async def get_wine_recommendations(questionnaire: WineQuestionnaire):
    """
    Retorna uma lista de vinhos recomendados com base nas respostas do usuário.
    """
    # 1️⃣ Verifica se o recomendador está disponível
    if wine_recommender_instance is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de recomendação indisponível no momento."
        )

    # 2️⃣ Processa as respostas do questionário do usuário
    try:
        user_profile = wine_recommender_instance.process_user_answers(questionnaire.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao processar respostas do questionário: {e}"
        )

    # 3️⃣ Obtém as recomendações de vinhos
    try:
        recs = wine_recommender_instance.get_recommendations_from_profile(
            user_profile,
            num_recommendations=5
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar recomendações: {e}"
        )

    # 4️⃣ Verifica se há resultados
    if not recs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma recomendação encontrada para o perfil informado."
        )

    # 5️⃣ Retorna as recomendações formatadas
    return recs
