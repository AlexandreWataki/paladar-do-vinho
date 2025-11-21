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
    """Motor de recomendação com Distância Euclidiana + Regras de Negócio Rígidas."""

    def __init__(self):
        print("🚨 RECOMMENDER ATIVO: VERSÃO FILTRAGEM RÍGIDA ✔")
        print("🍷 Carregando dados da tabela 'vinhos'...")

        self.df = self._load_wines_from_db()

        print(f"✅ {len(self.df)} vinhos carregados.")
        if not self.df.empty:
            print(f"📊 Colunas carregadas: {list(self.df.columns)}")
            # print(self.df.head(2)) # Descomente se quiser ver exemplos no log

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

            for col in WEIGHTS.keys():
                if col in df.columns:
                    df[col] = (
                        df[col].apply(                                    
                            lambda x: int(float(str(x).strip())) if str(x).strip().replace('.', '', 1).isdigit() else 0
                        )
                        .fillna(0)
                        .astype(int)
                    )
                else:
                    # Se a coluna não existir, cria com zeros (fallback)
                    df[col] = 0

            # Cria vetor numérico do vinho
            df["wine_vector"] = df.apply(
                lambda w: tuple(w[col] for col in WEIGHTS.keys()), axis=1
            )

            # Normalização de textos para facilitar buscas
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

        # Ajusta pesos dinamicamente dependendo do tipo de vinho
        if "tinto" in wine_type:
            weights[1] = 3.0 # Tanino importa mais em tintos
            weights[2] = 2.0
        elif "branco" in wine_type or "espumante" in wine_type:
            weights[1] = 0.1 # Tanino importa pouco em brancos
            weights[2] = 3.0 # Acidez importa muito
        elif "rosé" in wine_type or "rose" in wine_type:
            weights[1] = 1.0
            weights[2] = 2.5

        distance = np.sqrt(np.sum(weights * ((user_vals - wine_vals) ** 2)))
        return 1 / (1 + distance)

    # ------------------------------------------------
    # 5️⃣ RECOMENDAÇÃO FINAL (LÓGICA RÍGIDA)
    # ------------------------------------------------
    def get_recommendations_from_profile(self, user_profile, num_recommendations=5):

        if self.df.empty:
            return []

        df = self.df.copy()
        
        # Logs de Debug
        print(f"\n--- Nova Recomendação ---")
        print(f"👤 Usuário pediu: {user_profile['preferencia_vinho']}")
        print(f"🍽️ Comida: {user_profile['harmonizacao']}")

        # --- 1. DEFINIÇÃO DO TIPO DE VINHO (Lógica de Sobrescrita) ---
        
        wine_type_to_filter = user_profile["preferencia_vinho"]
        aviso_troca = False

        # REGRA DE OURO: Carne Vermelha exige Tinto
        # Se o prato for carne vermelha, forçamos Tinto, ignorando a preferência anterior.
        if "carne" in user_profile["harmonizacao"] and "vermelha" in user_profile["harmonizacao"]:
            if "tinto" not in wine_type_to_filter:
                print("⚠️ Regra de Carne Vermelha ativada: Forçando alteração para Tinto.")
                wine_type_to_filter = "tinto"
                aviso_troca = True

        # --- 2. FILTRAGEM ABSOLUTA (O CORTE) ---
        
        # Se a preferência não for "todos", removemos tudo que não for do tipo exato.
        if wine_type_to_filter and wine_type_to_filter not in ["todos", ""]:
            filtro = wine_type_to_filter.lower()
            
            # Tratamento especial para Rosé (acentos)
            if "rose" in filtro or "rosé" in filtro:
                df = df[df["tipo"].str.contains("rosé|rose", case=False, regex=True, na=False)]
            elif "espumante" in filtro:
                df = df[df["tipo"].str.contains("espumante", case=False, na=False)]
            elif "branco" in filtro:
                df = df[df["tipo"].str.contains("branco", case=False, na=False)]
            elif "tinto" in filtro:
                df = df[df["tipo"].str.contains("tinto", case=False, na=False)]
            else:
                # Fallback genérico
                df = df[df["tipo"].str.contains(filtro, case=False, na=False)]

        print(f"✅ Vinhos restantes após filtro de tipo: {len(df)}")

        # SE NÃO SOBROU NADA, RETORNA LISTA VAZIA (Não preenche com outros tipos)
        if df.empty:
            print("❌ Nenhum vinho encontrado com esse critério rígido.")
            return []

        # --- 3. CÁLCULO DE SIMILARIDADE (Apenas nos sobreviventes) ---
        
        df["harmonizacao"] = df["harmonizacao_original"]
        df["user_pairing"] = user_profile["harmonizacao"]

        user_vector = user_profile["user_vector"]

        df["similarity"] = df.apply(
            lambda w: self._calculate_similarity(user_vector, w["wine_vector"], w["tipo"]),
            axis=1,
        )
        
        # Bônus leve se a harmonização bater (apenas melhora o ranking, não filtra)
        df["similarity"] += df["harmonizacao_clean"].apply(
            lambda h: 0.15 if user_profile["harmonizacao"] in h else 0
        )

        df["similarity"] = df["similarity"].clip(0, 1)
        df["compatibilidade"] = (df["similarity"] * 100).round(1)

        # Ordena e pega os top N (pode ser menos que 5 se o filtro foi rigoroso)
        top = df.sort_values(by="similarity", ascending=False).head(num_recommendations)

        # Seleciona colunas para retorno
        cols = [
            "id", "titulo", "tipo", "pais", "uva", "preco_medio",
            "rotulo_url", "descricao", "harmonizacao", "user_pairing", "compatibilidade",
        ]
        
        records = top[cols].to_dict(orient="records")
        
        # Adiciona aviso nos metadados de cada vinho se houve troca forçada
        if aviso_troca:
            for record in records:
                record['aviso_regra'] = "Alteramos sua recomendação para Vinho Tinto para harmonizar perfeitamente com Carne Vermelha."

        return records


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