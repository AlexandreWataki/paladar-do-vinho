// src/pages/Results/Results.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { WineRecommendation } from "../../types/Wine";

interface SortedOption {
  label: string;
  value: "none" | "asc" | "desc";
}

const Results: React.FC = () => {
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<WineRecommendation[]>([]);
  const [sortOption, setSortOption] = useState<"none" | "asc" | "desc">("none");

  // 🔁 Carrega as recomendações salvas no localStorage
  useEffect(() => {
    const storedRecs = localStorage.getItem("wine_recommendations");
    if (storedRecs) {
      setRecommendations(JSON.parse(storedRecs));
    }
  }, []);

  // 🔄 Ordenação dinâmica conforme seleção
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (sortOption === "asc") return (a.preco_medio ?? 0) - (b.preco_medio ?? 0);
    if (sortOption === "desc") return (b.preco_medio ?? 0) - (a.preco_medio ?? 0);

    return 0;
  });

  // 🔠 Opções da caixa de ordenação
  const sortOptions: SortedOption[] = [
    { label: "🔹 Sem ordenação", value: "none" },
    { label: "⬆️ Preço: menor → maior", value: "asc" },
    { label: "⬇️ Preço: maior → menor", value: "desc" },
  ];

  return (
    <div className="page-container" style={{ alignItems: "stretch" }}>
      <h2 className="text-xl mb-3 text-primary">🍷 Resultados da sua recomendação</h2>

      {/* 🔽 Caixa de seleção de ordenação */}
      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <label htmlFor="sort" style={{ marginRight: "8px", fontWeight: 500 }}>
          Ordenar por:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as "none" | "asc" | "desc")}
          style={{
            padding: "6px 10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "0.95rem",
          }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 🔁 Renderização dos vinhos recomendados */}
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {sortedRecommendations.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>
            Nenhuma recomendação encontrada.
          </p>
        ) : (
          sortedRecommendations.map((wine) => (
            <div
              key={wine.id}
              className="shadow-3 border-round-2xl"
              style={{
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "16px",
                backgroundColor: "#fff",
                textAlign: "center",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
            >
              {/* 🖼️ Rótulo */}
              {wine.rotulo_url ? (
                <img
                  src={wine.rotulo_url}
                  alt={`Rótulo de ${wine.titulo}`}
                  style={{
                    width: "100%",
                    height: "320px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "320px",
                    borderRadius: "8px",
                    backgroundColor: "#f3f3f3",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#aaa",
                    marginBottom: "10px",
                  }}
                >
                  📦 Sem imagem disponível
                </div>
              )}

              {/* 🏷️ Informações do vinho */}
              <h3 style={{ marginBottom: "8px", color: "#4a148c" }}>{wine.titulo}</h3>
              <p style={{ margin: "4px 0", fontWeight: 500 }}>
                {wine.tipo} • {wine.pais}
              </p>
              <p style={{ margin: "4px 0", color: "#666" }}>
                Uva: {wine.uva} <br />
                Harmonização: {wine.harmonizacao}
              </p>

              {/* 💰 Preço formatado */}
              <p style={{ fontWeight: 600, color: "#7b2d26" }}>
                {wine.preco_medio
                  ? wine.preco_medio.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "Preço não informado"}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 🔙 Botão de voltar */}
      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button
          type="button"
          onClick={() => navigate('/questionary')} // ✅ redireciona corretamente
          style={{
            backgroundColor: "#7b1fa2",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#9c27b0")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#7b1fa2")}
        >
          Voltar ao questionário
        </button>
      </div>
    </div>
  );
};

export default Results;
