from backend.models.database import SessionLocal
from backend.models.wine import Wine

def harmonizacao_por_uva(uva: str) -> str:
    if not uva:
        return ""

    uva = uva.lower()

    tabela = {
        "cabernet": "Carnes vermelhas, cordeiro, churrasco e pratos intensos",
        "merlot": "Carnes brancas, massas, pizzas e queijos médios",
        "malbec": "Carnes grelhadas, churrasco argentino, empanadas e cordeiro",
        "syrah": "Churrasco, carne de porco, cordeiro e pratos condimentados",
        "shiraz": "Churrasco, carne de porco, cordeiro e pratos condimentados",
        "pinot noir": "Aves, cogumelos, salmão e massas leves",
        "tempranillo": "Tapas espanholas, paella, cordeiro e presunto cru",
        "sangiovese": "Massas com molho vermelho, pizzas e queijos italianos",
        "chardonnay": "Frango, risotos, peixe branco ou massas cremosas",
        "sauvignon": "Saladas, peixes cítricos, frutos do mar e queijo de cabra",
        "riesling": "Comida asiática, pratos apimentados e doce/salgado",
        "pinot grigio": "Peixes leves, massas claras e saladas",
        "torrontés": "Ceviche e frutos do mar aromáticos",
        "moscatel": "Sobremesas, tortas e frutas",
    }

    for key, valor in tabela.items():
        if key in uva:
            return valor

    return ""

def harmonizacao_por_tipo(tipo: str) -> str:
    tipo = tipo.lower()

    if "tinto" in tipo:
        return "Carnes vermelhas, massas encorpadas e queijos curados"
    if "branco" in tipo:
        return "Peixes, frutos do mar, frango e saladas"
    if "rosé" in tipo or "rose" in tipo:
        return "Aves, pratos leves e petiscos"
    if "espumante" in tipo:
        return "Queijos, entradas e sobremesas leves"

    return "Harmonização versátil para vários pratos"

def ajustar_por_niveis(v: Wine, base: str) -> str:
    # Tanino alto → carne
    if v.nivel_tanino and v.nivel_tanino >= 4:
        return base + ", churrasco ou cordeiro"

    # Acidez alta → peixe + salada
    if v.nivel_acidez and v.nivel_acidez >= 4:
        return base + ", peixes cítricos e saladas"

    # Frutado alto → comida condimentada
    if v.nivel_frutado and v.nivel_frutado >= 4:
        return base + ", comidas condimentadas ou asiáticas"

    return base

def ajustar_por_pais(pais: str, base: str) -> str:
    pais = pais.lower()
    if "frança" in pais or "italia" in pais or "espanha" in pais:
        return base + ", pratos tradicionais da culinária europeia"
    if "argentina" in pais or "chile" in pais:
        return base + ", churrasco ou carnes assadas"
    if "brasil" in pais:
        return base + ", queijos e pratos brasileiros"

    return base

def gerar_harmonizacao(v: Wine) -> str:
    # 1 — Tenta pela uva
    h = harmonizacao_por_uva(v.uva)
    if h:
        return ajustar_por_niveis(v, ajustar_por_pais(v.pais, h))

    # 2 — Tenta pelo tipo
    h = harmonizacao_por_tipo(v.tipo)
    h = ajustar_por_niveis(v, h)
    h = ajustar_por_pais(v.pais, h)

    return h

def popular_harmonizacao_avancada():
    db = SessionLocal()
    try:
        vinhos = db.query(Wine).all()
        print(f"🍷 {len(vinhos)} vinhos encontrados.")

        atualizados = 0

        for v in vinhos:
            if not v.harmonizacao or v.harmonizacao.strip() == "":
                v.harmonizacao = gerar_harmonizacao(v)
                atualizados += 1

        db.commit()
        print(f"✅ {atualizados} harmonizações preenchidas automaticamente!")
    finally:
        db.close()

if __name__ == "__main__":
    popular_harmonizacao_avancada()
