import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from backend.models.database import SessionLocal
from backend.models.wine import Wine

# -------------------------------
# 1️⃣ PESOS DOS ATRIBUTOS
# -------------------------------
WEIGHTS = {
    'nivel_docura': 3.0,
    'nivel_tanino': 3.0,
    'nivel_acidez': 2.0,
    'nivel_frutado': 2.0,
    'ocasiao': 1.0
}
WEIGHT_VECTOR = np.array(list(WEIGHTS.values()))


class WineRecommender:
    """Gera recomendações baseadas em preferências do usuário,
    usando Distância Euclidiana Ponderada + Regras de Negócio de Harmonização e Ocasião.
    """

    def __init__(self):
        print("🍷 Carregando dados da tabela 'vinhos' do banco de dados...")
        self.df = self._load_wines_from_db()
        print(f"✅ {len(self.df)} vinhos carregados para recomendação.")
        if not self.df.empty:
            print(f"📊 Colunas carregadas: {list(self.df.columns)}")
            print(self.df.head(2))  # mostra as 2 primeiras linhas

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

            # Cria DataFrame e limpa campos auxiliares
            df = pd.DataFrame([wine.__dict__ for wine in wines])
            df.drop(columns=['_sa_instance_state'], errors='ignore', inplace=True)

            print(f"📥 Dados brutos carregados ({len(df)} linhas): colunas = {list(df.columns)}")

            # Converte campos numéricos
            numeric_cols = list(WEIGHTS.keys())
            for col in numeric_cols:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
                else:
                    print(f"⚠️ Coluna ausente no banco: {col}")
                    df[col] = 0  # cria coluna se não existir

            # Cria vetor numérico de atributos
            df['wine_vector'] = df.apply(
                lambda w: tuple(w[col] for col in numeric_cols),
                axis=1
            )

            # Normaliza strings
            if 'tipo' in df.columns:
                df['tipo'] = df['tipo'].fillna('').str.lower().str.strip()
            if 'harmonizacao' in df.columns:
                df['harmonizacao'] = df['harmonizacao'].fillna('').str.lower().str.strip()
            if 'titulo' not in df.columns:
                print("⚠️ Coluna 'titulo' não encontrada — verifique o modelo Wine.")

            return df

        except Exception as e:
            print(f"❌ Erro ao carregar vinhos: {e}")
            return pd.DataFrame()
        finally:
            db.close()

    # -------------------------------
    # 3️⃣ PROCESSA RESPOSTAS DO USUÁRIO
    # -------------------------------
    def process_user_answers(self, answers: Dict[str, Any]) -> Dict[str, Any]:
        profile = {
            'preferencia_vinho': str(answers.get('preferencia_vinho', '')).lower().strip(),
            'harmonizacao': str(answers.get('harmonizacao', '')).lower().strip(),
            'nivel_docura': answers.get('nivel_docura', 3),
            'nivel_tanino': answers.get('nivel_tanino', 3),
            'nivel_acidez': answers.get('nivel_acidez', 3),
            'nivel_frutado': answers.get('nivel_frutado', 3),
            'ocasiao': answers.get('ocasiao', 2)
        }
        profile['user_vector'] = tuple(profile[col] for col in WEIGHTS.keys())
        return profile

    # -------------------------------
    # 4️⃣ CÁLCULO DE SIMILARIDADE
    # -------------------------------
    def _calculate_similarity(self, user_vector: Tuple, wine_vector: Tuple, wine_type: str) -> float:
        user_vals = np.array(user_vector)
        wine_vals = np.array(wine_vector)
        weights = WEIGHT_VECTOR.copy()

        if 'tinto' in wine_type:
            weights[list(WEIGHTS.keys()).index('nivel_tanino')] = 3.0
            weights[list(WEIGHTS.keys()).index('nivel_acidez')] = 2.0
        elif 'branco' in wine_type or 'espumante' in wine_type:
            weights[list(WEIGHTS.keys()).index('nivel_tanino')] = 0.1
            weights[list(WEIGHTS.keys()).index('nivel_acidez')] = 3.0
        elif 'rosé' in wine_type or 'rose' in wine_type:
            weights[list(WEIGHTS.keys()).index('nivel_tanino')] = 1.0
            weights[list(WEIGHTS.keys()).index('nivel_acidez')] = 2.5
        else:
            weights[list(WEIGHTS.keys()).index('nivel_tanino')] = 2.0
            weights[list(WEIGHTS.keys()).index('nivel_acidez')] = 2.0

        squared_diff = (user_vals - wine_vals) ** 2
        weighted_sq = weights * squared_diff
        distance = np.sqrt(np.sum(weighted_sq))
        similarity = 1 / (1 + distance)
        return similarity

    # -------------------------------
    # 5️⃣ REGRAS DE NEGÓCIO
    # -------------------------------
    def _apply_business_rules(self, df: pd.DataFrame, user_profile: Dict[str, Any]) -> pd.DataFrame:
        harm = user_profile.get('harmonizacao', '').lower()
        if not harm or harm == 'sem comida':
            return df

        if 'carne' in harm and 'vermelha' in harm:
            df = df[df['tipo'].str.contains('tinto', case=False, na=False)]
        elif 'frango' in harm or 'porco' in harm:
            df = df[df['tipo'].str.contains('tinto|branco', case=False, na=False)]
        elif 'peixe' in harm or 'fruto' in harm:
            df = df[df['tipo'].str.contains('branco|rosé|espumante', case=False, na=False)]
        elif 'massas' in harm:
            df = df[df['tipo'].str.contains('tinto|branco', case=False, na=False)]
        elif 'vegetariano' in harm:
            df = df[df['tipo'].str.contains('tinto|branco|rosé', case=False, na=False)]
        elif 'queijos' in harm or 'frios' in harm:
            df = df[df['tipo'].str.contains('tinto|branco|espumante', case=False, na=False)]

        return df

    # -------------------------------
    # 6️⃣ RECOMENDAÇÃO FINAL
    # -------------------------------
    def get_recommendations_from_profile(self, user_profile: Dict[str, Any], num_recommendations: int = 5) -> List[Dict[str, Any]]:
        if self.df.empty:
            print("⚠️ DataFrame de vinhos está vazio.")
            return []

        df = self.df.copy()

        # 🔹 1. FILTRO PELO TIPO DE VINHO PREFERIDO
        wine_type = user_profile.get("preferencia_vinho", "").lower().strip()
        if wine_type:
            before_count = len(df)
            df = df[df["tipo"].str.contains(wine_type, case=False, na=False)]
            print(f"🍷 Filtro de tipo aplicado: '{wine_type}' → {len(df)} de {before_count} vinhos restantes.")

        # 🔹 2. APLICA REGRAS DE NEGÓCIO (HARMONIZAÇÃO)
        df = self._apply_business_rules(df, user_profile)
        if df.empty:
            print("⚠️ Nenhum vinho compatível com a harmonização selecionada.")
            return []

        # 🔹 3. Garante que as colunas necessárias existem
        required_cols = ["id", "titulo", "tipo", "harmonizacao"]
        for col in required_cols:
            if col not in df.columns:
                print(f"❌ Coluna ausente no DataFrame: {col}")
                return []

        user_vector = user_profile["user_vector"]

        print(f"\n🔍 Calculando similaridades para o perfil:")
        print(f"   Preferência: {user_profile['preferencia_vinho']}")
        print(f"   Harmonização: {user_profile['harmonizacao']}")
        print(f"   Ocasião: {user_profile['ocasiao']}")
        print(f"   Vetor: {user_vector}")

        # 🔹 4. CÁLCULO DE SIMILARIDADE
        try:
            df["similarity"] = df.apply(
                lambda w: self._calculate_similarity(user_vector, w["wine_vector"], w["tipo"]),
                axis=1
            )
        except Exception as e:
            print(f"❌ Erro ao calcular similaridade: {e}")
            return []

        # 🔹 5. BÔNUS se harmonização coincidir
        df["similarity"] = df.apply(
            lambda w: w["similarity"] + (
                0.1 if user_profile["harmonizacao"] in str(w.get("harmonizacao", "")).lower() else 0
            ),
            axis=1
        )

        # 🔹 6. Ajuste final da escala e conversão em percentual
        df["similarity"] = df["similarity"].clip(upper=1.0)
        df["compatibilidade"] = (df["similarity"] * 100).round(1)

        # 🔹 7. Retorna resultados compatíveis com o schema
        try:
            top = df.sort_values(by="similarity", ascending=False).head(num_recommendations)
            print(f"✅ {len(top)} vinhos recomendados após aplicar filtros e pesos de similaridade.")

            # ✅ Garante compatibilidade com o schema Pydantic
            cols = [
                "id", "titulo", "tipo", "pais", "uva", "preco_medio",
                "rotulo_url", "descricao", "harmonizacao", "compatibilidade"
            ]
            for c in cols:
                if c not in top.columns:
                    top[c] = ""

            return top[cols].to_dict(orient="records")

        except Exception as e:
            print(f"❌ Erro final ao gerar lista de recomendações: {e}")
            return []
