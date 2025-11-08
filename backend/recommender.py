# backend/recommender.py

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

OCASIAO_MAP = {
    1: "Dia a Dia / Leve",
    2: "Social / Encontro",
    3: "Especial / Celebração",
}


class WineRecommender:
    """Gera recomendações com distância euclidiana ponderada + regras de negócio."""

    def __init__(self):
        print("🍷 Carregando dados da tabela 'vinhos' do banco de dados...")
        self.df = self._load_wines_from_db()
        print(f"✅ {len(self.df)} vinhos carregados para recomendação.")
        if not self.df.empty:
            print(f"📊 Colunas carregadas: {list(self.df.columns)}")

    # -------------------------------
    # 2️⃣ CARREGAMENTO DOS VINHOS
    # -------------------------------
    def _load_wines_from_db(self) -> pd.DataFrame:
        db = SessionLocal()
        try:
            wines = db.query(Wine).all()
            if not wines:
                print("⚠️ Nenhum vinho encontrado no banco.")
                return pd.DataFrame()

            df = pd.DataFrame([w.__dict__ for w in wines])
            df.drop(columns=["_sa_instance_state"], errors="ignore", inplace=True)

            # Normaliza/corrige tipos numéricos usados no cálculo
            numeric_cols = list(WEIGHTS.keys())
            for col in numeric_cols:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)
                else:
                    print(f"⚠️ Coluna ausente no banco: {col}")
                    df[col] = 0

            # Vetor do vinho
            df["wine_vector"] = df.apply(lambda r: tuple(r[c] for c in numeric_cols), axis=1)

            # Normaliza strings
            for c in ("tipo", "harmonizacao", "pais", "uva", "titulo"):
                if c in df.columns:
                    df[c] = df[c].fillna("").astype(str).str.strip()

            # Preços como float
            if "preco_medio" in df.columns:
                df["preco_medio"] = pd.to_numeric(df["preco_medio"], errors="coerce").fillna(0.0)
            else:
                df["preco_medio"] = 0.0

            return df
        except Exception as e:
            print(f"❌ Erro ao carregar vinhos: {e}")
            return pd.DataFrame()
        finally:
            db.close()

    # -------------------------------
    # 3️⃣ PROCESSA QUESTIONÁRIO
    # -------------------------------
    def process_user_answers(self, answers: Dict[str, Any]) -> Dict[str, Any]:
        ocasiao_num = int(answers.get("occasion", 2))
        profile = {
            "preferencia_vinho": str(answers.get("wine_type", "")).lower().strip(),
            "harmonizacao": str(answers.get("pairing", "")).lower().strip(),
            "ocasiao": ocasiao_num,
            "nivel_docura": int(answers.get("sweetness", 3)),
            "nivel_tanino": int(answers.get("tannin", 3)),
            "nivel_acidez": int(answers.get("acidity", 3)),
            "nivel_frutado": int(answers.get("fruitiness", 3)),
            "user_occasion_label": OCASIAO_MAP.get(ocasiao_num, "Social / Encontro"),
        }
        profile["user_vector"] = tuple(profile[c] for c in WEIGHTS.keys())
        print(f"DEBUG: Vetor numérico do usuário: {profile['user_vector']}")
        return profile

    # -------------------------------
    # 4️⃣ SIMILARIDADE PONDERADA
    # -------------------------------
    def _calculate_similarity(self, user_vector: Tuple, wine_vector: Tuple, wine_type: str) -> float:
        user_vals = np.array(user_vector)
        wine_vals = np.array(wine_vector)
        weights = WEIGHT_VECTOR.copy()

        tan_idx = list(WEIGHTS.keys()).index("nivel_tanino")
        aci_idx = list(WEIGHTS.keys()).index("nivel_acidez")

        wt = (wine_type or "").lower()
        if "tinto" in wt:
            weights[tan_idx] = 3.0
            weights[aci_idx] = 2.0
        elif "branco" in wt or "espumante" in wt:
            weights[tan_idx] = 0.1
            weights[aci_idx] = 3.5
        elif "rosé" in wt or "rose" in wt:
            weights[tan_idx] = 1.0
            weights[aci_idx] = 2.5

        distance = np.sqrt(np.sum(weights * (user_vals - wine_vals) ** 2))
        return 1.0 / (1.0 + distance)

    # -------------------------------
    # 5️⃣ REGRAS DE NEGÓCIO
    # -------------------------------
    def _apply_business_rules(self, df: pd.DataFrame, user_profile: Dict[str, Any]) -> pd.DataFrame:
        harm = user_profile.get("harmonizacao", "")
        if harm == "carne_vermelha":
            df = df[df["tipo"].str.contains("tinto", case=False, na=False)]
        elif harm == "frutos_do_mar":
            df = df[df["tipo"].str.contains("branco|rosé|rose|espumante", case=False, na=False)]
        elif harm == "aves":
            df = df[df["tipo"].str.contains("tinto|branco|rosé|rose", case=False, na=False)]
        elif harm == "massas":
            df = df[df["tipo"].str.contains("tinto|branco", case=False, na=False)]
        elif harm == "queijos":
            df = df[df["tipo"].str.contains("tinto|branco|espumante", case=False, na=False)]
        # "sem_comida" → não restringe
        return df

    # -------------------------------
    # 6️⃣ RECOMENDAÇÕES
    # -------------------------------
    def get_recommendations_from_profile(
        self, user_profile: Dict[str, Any], num_recommendations: int = 5
    ) -> List[Dict[str, Any]]:
        if self.df.empty:
            print("⚠️ DataFrame de vinhos está vazio.")
            return []

        df = self.df.copy()

        # Filtro por tipo preferido (se houver)
        wine_type = user_profile.get("preferencia_vinho", "")
        if wine_type:
            df = df[df["tipo"].str.contains(wine_type, case=False, na=False)]
            print(f"🍷 Filtro de tipo aplicado: '{wine_type}' → {len(df)} vinhos restantes.")

        # Regras de harmonização
        df = self._apply_business_rules(df, user_profile)
        if df.empty:
            return []

        # Similaridade
        user_vector = user_profile["user_vector"]
        df["similarity"] = df.apply(
            lambda r: self._calculate_similarity(user_vector, r["wine_vector"], r.get("tipo", "")),
            axis=1,
        )

        top = df.sort_values(by="similarity", ascending=False).head(num_recommendations)

        # Monta na FORMA ESPERADA PELO Pydantic WineRecommendation
        results: List[Dict[str, Any]] = []
        for _, row in top.iterrows():
            # score em 0–100 (pode ajustar se quiser outra escala)
            compat = round(float(row["similarity"]) * 100.0, 1)

            results.append(
                {
                    "id": int(row.get("id", 0)),
                    "titulo": row.get("titulo", "") or "Vinho sem Título",
                    "tipo": row.get("tipo", "") or "N/A",
                    "pais": row.get("pais", "") or "N/A",
                    "uva": row.get("uva", "") or "Blend",
                    "preco_medio": float(row.get("preco_medio", 0.0) or 0.0),
                    "rotulo_url": (row.get("rotulo_url") or None),
                    "descricao": (row.get("descricao") or None),
                    "score": compat,
                    "user_occasion": user_profile["user_occasion_label"],
                    "user_pairing": user_profile.get("harmonizacao", "").replace("_", " ").title(),
                }
            )

        print(f"✅ {len(results)} vinhos recomendados após aplicar filtros e similaridade.")
        return results


# -------------------------------
# 7️⃣ PONTO DE ENTRADA PÚBLICO
# -------------------------------
try:
    _RECOMMENDER_INSTANCE = WineRecommender()
except Exception as e:
    print(f"ERRO CRÍTICO ao inicializar WineRecommender: {e}")
    _RECOMMENDER_INSTANCE = None


def recommend_wines(user_answers: Dict[str, Any]) -> List[Dict[str, Any]]:
    if _RECOMMENDER_INSTANCE is None:
        return []
    try:
        profile = _RECOMMENDER_INSTANCE.process_user_answers(user_answers)
        return _RECOMMENDER_INSTANCE.get_recommendations_from_profile(profile)
    except Exception as e:
        print(f"❌ Erro ao executar recomendação: {e}")
        return []
