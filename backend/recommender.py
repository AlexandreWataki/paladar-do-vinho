import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from backend.models.database import SessionLocal
from backend.models.wine import Wine

# -------------------------------
# 1️⃣ PESOS DOS ATRIBUTOS
# -------------------------------
WEIGHTS = {
    "nivel_docura": 3.0,
    "nivel_tanino": 3.0,
    "nivel_acidez": 2.0,
    "nivel_frutado": 2.0,
    "ocasiao": 1.0,
}
WEIGHT_VECTOR = np.array(list(WEIGHTS.values()))


class WineRecommender:
    """Motor de recomendação com Distância Euclidiana + Regras."""

    def __init__(self):
        print("🚨 RECOMMENDER ATIVO: VERSÃO COM HARMONIZAÇÃO ✔")
        print("🍷 Carregando dados da tabela 'vinhos'...")

        self.df = self._load_wines_from_db()

        print(f"✅ {len(self.df)} vinhos carregados.")
        if not self.df.empty:
            print(f"📊 Colunas carregadas: {list(self.df.columns)}")
            print(self.df.head(2))

    # ------------------------------------------------
    # 2️⃣ CARREGAMENTO DOS VINHOS
    # ------------------------------------------------
    def _load_wines_from_db(self) -> pd.DataFrame:
        db = SessionLocal()
        try:
            wines = db.query(Wine).all()
            if not wines:
                return pd.DataFrame()

            df = pd.DataFrame([wine.__dict__ for wine in wines])
            df.drop(columns=["_sa_instance_state"], errors="ignore", inplace=True)

            # Converte campos numéricos
            for col in WEIGHTS.keys():
                df[col] = pd.to_numeric(df.get(col, 0), errors="coerce").fillna(0).astype(int)

            # Cria vetor
            df["wine_vector"] = df.apply(
                lambda w: tuple(w[col] for col in WEIGHTS.keys()), axis=1
            )

            df["tipo"] = df["tipo"].fillna("").str.lower().str.strip()
            df["harmonizacao_original"] = df["harmonizacao"].fillna("").astype(str)
            df["harmonizacao_clean"] = df["harmonizacao_original"].str.lower().str.strip()
            df["harmonizacao"] = df["harmonizacao_original"]

            return df

        finally:
            db.close()

    # ------------------------------------------------
    # 3️⃣ PROCESSA PERFIL DO USUÁRIO
    # ------------------------------------------------
    def process_user_answers(self, answers: Dict[str, Any]) -> Dict[str, Any]:
        profile = {
            "preferencia_vinho": str(answers.get("preferencia_vinho", "")).lower().strip(),
            "harmonizacao": str(answers.get("harmonizacao", "")).lower().strip(),
            "nivel_docura": answers.get("nivel_docura", 3),
            "nivel_tanino": answers.get("nivel_tanino", 3),
            "nivel_acidez": answers.get("nivel_acidez", 3),
            "nivel_frutado": answers.get("nivel_frutado", 3),
            "ocasiao": answers.get("ocasiao", 2),
        }

        profile["user_vector"] = tuple(profile[col] for col in WEIGHTS.keys())
        return profile

    # ------------------------------------------------
    # 4️⃣ SIMILARIDADE
    # ------------------------------------------------
    def _calculate_similarity(self, user_vector, wine_vector, wine_type):
        user_vals = np.array(user_vector)
        wine_vals = np.array(wine_vector)

        weights = WEIGHT_VECTOR.copy()

        if "tinto" in wine_type:
            weights[1] = 3.0
            weights[2] = 2.0
        elif "branco" in wine_type or "espumante" in wine_type:
            weights[1] = 0.1
            weights[2] = 3.0
        elif "rosé" in wine_type or "rose" in wine_type:
            weights[1] = 1.0
            weights[2] = 2.5

        distance = np.sqrt(np.sum(weights * ((user_vals - wine_vals) ** 2)))
        return 1 / (1 + distance)

    # ------------------------------------------------
    # 5️⃣ REGRAS DE NEGÓCIO
    # ------------------------------------------------
    def _apply_business_rules(self, df, user_profile):
        harm = user_profile["harmonizacao"]

        if not harm or "sem" in harm:
            return df

        if "carne" in harm and "vermelha" in harm:
            return df[df["tipo"].str.contains("tinto")]

        if any(x in harm for x in ["ave", "frango", "porco"]):
            return df[df["tipo"].str.contains("tinto|branco")]

        if any(x in harm for x in ["peixe", "fruto", "mar"]):
            return df[df["tipo"].str.contains("branco|rosé|rose|espumante")]

        if any(x in harm for x in ["massa", "pizza"]):
            return df[df["tipo"].str.contains("tinto|branco")]

        if any(x in harm for x in ["queijo", "frios"]):
            return df[df["tipo"].str.contains("tinto|branco|espumante")]

        return df

    # ------------------------------------------------
    # 6️⃣ RECOMENDAÇÃO FINAL
    # ------------------------------------------------
    def get_recommendations_from_profile(self, user_profile, num_recommendations=5):

        if self.df.empty:
            return []

        df = self.df.copy()
        df = self._apply_business_rules(df, user_profile)

        df["harmonizacao"] = df["harmonizacao_original"]

        # Adiciona a harmonização do usuário na resposta
        df["user_pairing"] = user_profile["harmonizacao"]

        wine_type = user_profile["preferencia_vinho"]

        if wine_type and "carne vermelha" not in user_profile["harmonizacao"]:
            df = df[df["tipo"].str.contains(wine_type, case=False)]

        user_vector = user_profile["user_vector"]

        df["similarity"] = df.apply(
            lambda w: self._calculate_similarity(user_vector, w["wine_vector"], w["tipo"]),
            axis=1,
        )

        df["similarity"] += df["harmonizacao_clean"].apply(
            lambda h: 0.1 if user_profile["harmonizacao"] in h else 0
        )

        df["similarity"] = df["similarity"].clip(0, 1)
        df["compatibilidade"] = (df["similarity"] * 100).round(1)

        top = df.sort_values(by="similarity", ascending=False).head(num_recommendations)

        cols = [
            "id",
            "titulo",
            "tipo",
            "pais",
            "uva",
            "preco_medio",
            "rotulo_url",
            "descricao",
            "harmonizacao",
            "user_pairing",
            "compatibilidade",
        ]

        return top[cols].to_dict(orient="records")


# -------------------------------
# INSTÂNCIA GLOBAL
# -------------------------------
_RECOMMENDER = None

def get_recommender():
    global _RECOMMENDER
    if _RECOMMENDER is None:
        _RECOMMENDER = WineRecommender()
    return _RECOMMENDER

def recommend_wines(user_answers):
    r = get_recommender()
    profile = r.process_user_answers(user_answers)
    return r.get_recommendations_from_profile(profile)
