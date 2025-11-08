# backend/routes/recommendation_routes.py

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from backend.models.wine import WineQuestionnaire, WineRecommendation
from backend.recommender import WineRecommender
# Assumindo que sua função de autenticação está em auth_routes.py
from backend.routes.auth_routes import get_current_user

# -------------------------------------------------------------
# CONFIGURAÇÃO INICIAL
# -------------------------------------------------------------
router = APIRouter(prefix="/recommendations", tags=["Recomendação"])

# ✨ NOVO: Mapa para converter o ID da ocasião em um texto descritivo.
#    Ajuste os textos para que correspondam às suas opções no frontend.
OCCASION_MAP = {
    1: "Jantar Especial",
    2: "Evento Social",
    3: "Relaxar em Casa",
    4: "Presente",
    # Adicione mais mapeamentos se necessário
}

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
@router.post(
    "/",
    response_model=List[WineRecommendation],
    status_code=status.HTTP_200_OK,
    # ✨ ADICIONADO: Garante que o endpoint só pode ser acessado por usuários logados.
    dependencies=[Depends(get_current_user)]
)
async def get_wine_recommendations(questionnaire: WineQuestionnaire):
    """
    Retorna uma lista de vinhos recomendados com base nas respostas do usuário.
    """
    if wine_recommender_instance is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de recomendação indisponível no momento."
        )

    try:
        user_profile = wine_recommender_instance.process_user_answers(questionnaire.model_dump())
        recs = wine_recommender_instance.get_recommendations_from_profile(
            user_profile,
            num_recommendations=5
        )
        print(f"DEBUG RECS: {len(recs)} vinhos encontrados.")
    except Exception as e:
        print(f"❌ Erro interno ao gerar recomendações: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar recomendações: {e}"
        )

    if not recs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma recomendação encontrada para o perfil informado."
        )

    # ✨ CORRIGIDO: Loop final para montar a resposta corretamente.
    formatted_recs = []
    for r in recs:
        # 'r' é o dicionário/objeto retornado pelo seu recomendador
        wine_data = {
            "id": r.get("id"),
            "titulo": r.get("titulo", "Vinho Desconhecido"),
            "tipo": r.get("tipo", "N/A"),
            "pais": r.get("pais", "N/A"),
            "uva": r.get("uva", "N/A"),
            "preco_medio": r.get("preco_medio", 0.0),
            "rotulo_url": r.get("rotulo_url"),
            "descricao": r.get("descricao", ""),
            "nivel_docura": r.get("nivel_docura", 0),
            "nivel_tanino": r.get("nivel_tanino", 0),
            "nivel_acidez": r.get("nivel_acidez", 0),
            "nivel_frutado": r.get("nivel_frutado", 0),
            "score": r.get("score", 0.0),
            # ✨ CORREÇÃO PRINCIPAL: Converte o número da ocasião para texto.
            "user_occasion": OCCASION_MAP.get(questionnaire.ocasiao, "Não especificada"),
            "user_pairing": questionnaire.harmonizacao
        }
        formatted_recs.append(wine_data)

    return formatted_recs
