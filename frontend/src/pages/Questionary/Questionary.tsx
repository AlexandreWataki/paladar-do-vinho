// src/pages/Questionary/Questionary.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../../api/wines";
import "../../styles/base.css";
import "./Questionary.css";

const Questionary: React.FC = () => {
  const navigate = useNavigate();

  const [preferencia, setPreferencia] = useState("");
  const [ocasiao, setOcasiao] = useState("");
  const [harmonizacao, setHarmonizacao] = useState("");
  const [docura, setDocura] = useState(3);
  const [tanino, setTanino] = useState(3);
  const isTinto = preferencia.toLowerCase() === "tinto";
  const [acidez, setAcidez] = useState(3);
  const [frutado, setFrutado] = useState(3);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

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

  const getOcasionContext = (value: string) => {
    const num = parseInt(value);
    return contexts.occasion[num] || "";
  };

  useEffect(() => {
    if (harmonizacao.toLowerCase().includes("carne vermelha")) {
      setPreferencia("Tinto");
    }
  }, [harmonizacao]);

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

      if (!recs || recs.length === 0) {
        setErro("Nenhum vinho foi encontrado para o seu perfil.");
        return;
      }

      localStorage.setItem("wine_recommendations", JSON.stringify(recs));
      navigate("/resultados");
    } catch (error: any) {
      setErro("Erro ao buscar recomendações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="questionary-container">
      <div className="questionary-card">
        <div className="questionary-header">
          <h2 className="questionary-title">
            <span className="questionary-word">Monte seu perfil de paladar</span>
          </h2>

          <button
            type="button"
            className="questionary-back"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="questionary-form">
          <div className="q-field">
            <label className="q-label">Qual tipo de vinho você prefere?</label>
            <select
              value={preferencia}
              onChange={(e) => setPreferencia(e.target.value)}
              required
              className="q-select"
            >
              <option value="">Selecione</option>
              {tiposVinho.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="q-field">
            <label className="q-label">Para qual ocasião?</label>
            <select
              value={ocasiao}
              onChange={(e) => setOcasiao(e.target.value)}
              required
              className="q-select"
            >
              <option value="">Selecione</option>
              {ocasioes.map((o) => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
            {ocasiao && <div className="q-hint">{getOcasionContext(ocasiao)}</div>}
          </div>

          <div className="q-field">
            <label className="q-label">Com qual tipo de prato quer harmonizar?</label>
            <select
              value={harmonizacao}
              onChange={(e) => setHarmonizacao(e.target.value)}
              required
              className="q-select"
            >
              <option value="">Selecione</option>
              {pratos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {harmonizacao && (
              <div className="q-hint" style={{ marginTop: 6 }}>
                {harmonizacao.toLowerCase().includes("carne vermelha") && (
                  <>🍖 Harmoniza bem com vinhos <strong>tintos encorpados</strong>.</>
                )}
                {harmonizacao.toLowerCase().includes("aves") && (
                  <>🍗 Combina com <strong>brancos</strong> ou <strong>tintos leves</strong>.</>
                )}
                {harmonizacao.toLowerCase().includes("peixes") && (
                  <>🐟 Ideal com <strong>brancos</strong> ou <strong>rosés</strong>.</>
                )}
                {harmonizacao.toLowerCase().includes("queijos") && (
                  <>🧀 Vai bem com <strong>tintos</strong> ou <strong>espumantes</strong>.</>
                )}
              </div>
            )}
          </div>

          <div className="q-field">
            <label className="q-label">Seu Perfil de Sensações (1 a 5)</label>
            <div className="q-hint">1 = fraco / 5 = intenso</div>
          </div>

          <div className="q-field">
            <label className="q-label">Nível de Doçura</label>
            <input
              type="range"
              min="1"
              max="5"
              value={docura}
              onChange={(e) => setDocura(Number(e.target.value))}
              className="q-range"
            />
            <div className="q-range-value">
              {docura} ({contexts.sweetness[docura].label})
            </div>
          </div>

          <div className="q-field">
            <label className="q-label">Nível de Tanino</label>
            <input
              type="range"
              min="1"
              max="5"
              value={tanino}
              onChange={(e) => setTanino(Number(e.target.value))}
              className="q-range"
              disabled={!isTinto}
              style={{ opacity: isTinto ? 1 : 0.5 }}
            />
            <div className="q-range-value">
              {isTinto ? `${tanino} (${contexts.tannin[tanino].label})` : "—"}
            </div>
          </div>

          <div className="q-field">
            <label className="q-label">Nível de Acidez</label>
            <input
              type="range"
              min="1"
              max="5"
              value={acidez}
              onChange={(e) => setAcidez(Number(e.target.value))}
              className="q-range"
            />
            <div className="q-range-value">
              {acidez} ({contexts.acidity[acidez].label})
            </div>
          </div>

          <div className="q-field">
            <label className="q-label">Nível de Frutado</label>
            <input
              type="range"
              min="1"
              max="5"
              value={frutado}
              onChange={(e) => setFrutado(Number(e.target.value))}
              className="q-range"
            />
            <div className="q-range-value">
              {frutado} ({contexts.fruitiness[frutado].label})
            </div>
          </div>

          <button type="submit" className="q-submit" disabled={loading}>
            {loading ? "Carregando..." : "Buscar Recomendações"}
          </button>

          {erro && <p className="q-error">{erro}</p>}
        </form>
      </div>
    </div>
  );
};

export default Questionary;
