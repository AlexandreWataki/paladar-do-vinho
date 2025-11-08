import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../../api/wines";
import "../../styles/base.css";

const Questionary: React.FC = () => {
  const navigate = useNavigate();

  // Estados dos campos
  const [preferencia, setPreferencia] = useState("");
  const [ocasiao, setOcasiao] = useState("");
  const [harmonizacao, setHarmonizacao] = useState("");
  const [docura, setDocura] = useState(3);
  const [tanino, setTanino] = useState(3);
  const [acidez, setAcidez] = useState(3);
  const [frutado, setFrutado] = useState(3);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Dados auxiliares
  const tiposVinho = ["Tinto", "Branco", "Rosé", "Espumante"];
  const ocasioes = [
    { id: 1, nome: "Dia a Dia / Leve" },
    { id: 2, nome: "Social / Encontro" },
    { id: 3, nome: "Especial / Celebração" },
  ];
  const pratos = [
    "Carne Vermelha",
    "Peixes e Frutos do Mar",
    "Aves",
    "Massas e Pizzas",
    "Queijos",
    "Sem Comida (Apenas Social)",
  ];

  // Contextos de cada atributo (descrições)
  const contexts: Record<string, any> = {
    sweetness: {
      1: { label: "Seco", desc: "Sem dulçor residual perceptível." },
      2: { label: "Meio-Seco", desc: "Um toque sutil de doçura, para equilíbrio." },
      3: { label: "Semi-doce / Suave", desc: "Doçura presente, mas ainda discreta." },
      4: { label: "Doce", desc: "Claramente doce, ideal para sobremesas leves." },
      5: { label: "Muito Doce / Licoroso", desc: "Alto teor de açúcar, vinhos de sobremesa intensos." },
    },
    tannin: {
      1: { label: "Leve", desc: "Pouca adstringência (ex: Pinot Noir, Gamay)." },
      2: { label: "Médio-Baixo", desc: "Taninos macios e aveludados." },
      3: { label: "Médio", desc: "Taninos presentes, mas equilibrados." },
      4: { label: "Médio-Alto", desc: "Taninos firmes e estruturados." },
      5: { label: "Intenso", desc: "Muita adstringência, vinhos robustos (ex: Cabernet Sauvignon, Tannat)." },
    },
    acidity: {
      1: { label: "Suave", desc: "Redonda e cremosa, menos salivar." },
      2: { label: "Média-Baixa", desc: "Acidez discreta, para equilíbrio." },
      3: { label: "Média / Fresca", desc: "Acidez bem equilibrada e vibrante." },
      4: { label: "Média-Alta", desc: "Acidez evidente e refrescante." },
      5: { label: "Alta", desc: "Acidez que faz salivar bastante (ex: Sauvignon Blanc, Riesling)." },
    },
    fruitiness: {
      1: { label: "Mineral / Terroso", desc: "Foco em notas não-frutadas (solo, pedra, especiarias)." },
      2: { label: "Fruta Discreta", desc: "Notas de fruta sutis, em segundo plano." },
      3: { label: "Fruta Média", desc: "Fruta evidente e equilibrada." },
      4: { label: "Fruta Viva / Madura", desc: "Aromas de frutas frescas, dominantes." },
      5: { label: "Fruta Intensa / Geléia", desc: "Sabor de fruta muito concentrado, maduro (Novo Mundo)." },
    },
    occasion: {
      1: "Vinhos acessíveis, para consumo casual e cotidiano.",
      2: "Vinhos com bom custo-benefício, para jantares informais e happy hours.",
      3: "Vinhos de guarda, mais caros ou complexos, para datas e eventos importantes.",
    },
  };

  // Atualiza contexto da ocasião
  const getOcasionContext = (value: string) => {
    const num = parseInt(value);
    return contexts.occasion[num] || "";
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!preferencia || !ocasiao || !harmonizacao) {
      setErro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const questionnaireData = {
        preferencia_vinho: preferencia,
        harmonizacao: harmonizacao,
        ocasiao: Number(ocasiao),
        nivel_docura: docura,
        nivel_tanino: tanino,
        nivel_acidez: acidez,
        nivel_frutado: frutado,
      };

      const recs = await getRecommendations(questionnaireData);
      localStorage.setItem("wine_recommendations", JSON.stringify(recs));
      navigate("/resultados");
    } catch (error) {
      console.error("Erro ao buscar recomendações:", error);
      setErro("Erro ao buscar recomendações. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="wine-profile-container">
        <h2>Monte seu perfil de paladar 🍇</h2>

        <form onSubmit={handleSubmit}>
          {/* Tipo de vinho */}
          <div className="form-group">
            <label>Qual tipo de vinho você prefere?</label>
            <select
              value={preferencia}
              onChange={(e) => setPreferencia(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {tiposVinho.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Ocasião */}
          <div className="form-group">
            <label>Para qual ocasião?</label>
            <select
              value={ocasiao}
              onChange={(e) => setOcasiao(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {ocasioes.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
            <div className="context-text">{getOcasionContext(ocasiao)}</div>
          </div>

          {/* Harmonização */}
          <div className="form-group">
            <label>Com qual tipo de prato quer harmonizar?</label>
            <select
              value={harmonizacao}
              onChange={(e) => setHarmonizacao(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {pratos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders de perfil sensorial */}
          <h3>Seu Perfil de Sensações (1 a 5)</h3>
          <p className="help-text">
            1 = Menos intenso / 5 = Mais intenso. Arraste para selecionar.
          </p>

          <div className="form-group slider-group">
            <label>Nível de Doçura</label>
            <input
              type="range"
              min="1"
              max="5"
              value={docura}
              onChange={(e) => setDocura(Number(e.target.value))}
            />
            <div className="slider-value">
              {docura} ({contexts.sweetness[docura].label})
            </div>
            <div className="context-text">{contexts.sweetness[docura].desc}</div>
          </div>

          <div className="form-group slider-group">
            <label>Nível de Tanino</label>
            <input
              type="range"
              min="1"
              max="5"
              value={tanino}
              onChange={(e) => setTanino(Number(e.target.value))}
            />
            <div className="slider-value">
              {tanino} ({contexts.tannin[tanino].label})
            </div>
            <div className="context-text">{contexts.tannin[tanino].desc}</div>
          </div>

          <div className="form-group slider-group">
            <label>Nível de Acidez</label>
            <input
              type="range"
              min="1"
              max="5"
              value={acidez}
              onChange={(e) => setAcidez(Number(e.target.value))}
            />
            <div className="slider-value">
              {acidez} ({contexts.acidity[acidez].label})
            </div>
            <div className="context-text">{contexts.acidity[acidez].desc}</div>
          </div>

          <div className="form-group slider-group">
            <label>Nível de Frutado</label>
            <input
              type="range"
              min="1"
              max="5"
              value={frutado}
              onChange={(e) => setFrutado(Number(e.target.value))}
            />
            <div className="slider-value">
              {frutado} ({contexts.fruitiness[frutado].label})
            </div>
            <div className="context-text">{contexts.fruitiness[frutado].desc}</div>
          </div>

          <button
            type="submit"
            className="recommend-btn"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Buscar Recomendações"}
          </button>

          {erro && <p className="error">{erro}</p>}
        </form>
      </div>
    </div>
  );
};

export default Questionary;
