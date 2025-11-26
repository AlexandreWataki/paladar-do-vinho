// src/pages/Results/Results.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { WineRecommendation } from "../../types/Wine";
import "../../styles/base.css";
import "./Results.css";

interface SortedOption {
  label: string;
  value: "none" | "asc" | "desc";
}

const Results: React.FC = () => {
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<WineRecommendation[]>([]);
  const [sortOption, setSortOption] = useState<"none" | "asc" | "desc">("none");

  // Modal de zoom da imagem
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Carregar recomendações do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("wine_recommendations");
    if (stored) {
      setRecommendations(JSON.parse(stored));
    }
  }, []);

  // Ordenação por preço
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (sortOption === "asc") return (a.preco_medio ?? 0) - (b.preco_medio ?? 0);
    if (sortOption === "desc") return (b.preco_medio ?? 0) - (a.preco_medio ?? 0);
    return 0;
  });

  const sortOptions: SortedOption[] = [
    { label: "Sem ordenação", value: "none" },
    { label: "Preço: menor → maior", value: "asc" },
    { label: "Preço: maior → menor", value: "desc" },
  ];

  // Regra de harmonização igual ao WineCard
  const getHarmonizacaoTexto = (wine: WineRecommendation) => {
    if (wine.user_pairing && wine.user_pairing.trim() !== "") return wine.user_pairing;
    if (wine.harmonizacao && wine.harmonizacao.trim() !== "")
      return wine.harmonizacao;
    return "Não informada";
  };

  return (
    <div className="page-container" style={{ alignItems: "stretch" }}>
      {/* 🔝 BARRA: ORDENAR POR + VOLTAR */}
      <div className="results-toolbar">
        <div className="sort-container">
          <span className="sort-label">Ordenar por:</span>

          <select
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as "none" | "asc" | "desc")}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="results-back"
          onClick={() => navigate("/questionary")}
        >
          ← Voltar
        </button>
      </div>

      {/* ===== GRID DOS VINHOS ===== */}
      <div className="results-grid">
        {sortedRecommendations.length === 0 ? (
          <p style={{ textAlign: "center", color: "#ccc" }}>
            Nenhuma recomendação encontrada.
          </p>
        ) : (
          sortedRecommendations.map((wine) => (
            <div key={wine.id} className="wine-box">
              {/* IMAGEM – SEM CAIXA, COM HOVER VINHO */}
              {wine.rotulo_url ? (
                <img
                  src={wine.rotulo_url}
                  alt={wine.titulo}
                  className="wine-img"
                  onClick={() => setZoomImage(wine.rotulo_url ?? "")}
                />
              ) : (
                <div className="wine-img-empty">
                  📦 Sem imagem disponível
                </div>
              )}

              {/* TÍTULO */}
              <h3 className="wine-title">{wine.titulo || "Vinho sem título"}</h3>

              {/* INFORMAÇÕES */}
              <p className="wine-info">
                <strong>Tipo:</strong> {wine.tipo} {wine.pais && `• ${wine.pais}`}
              </p>

              <p className="wine-info">
                <strong>Uva:</strong> {wine.uva}
              </p>

              <p className="wine-info">
                <strong>Harmonização:</strong> {getHarmonizacaoTexto(wine)}
              </p>

              <p className="wine-info">
                <strong>Teor alcoólico:</strong>{" "}
                {wine.teor_alcoolico ? `${wine.teor_alcoolico}%` : "Não informado"}
              </p>

              {/* PREÇO COM ÍCONE */}
              <p className="wine-price">
                <span className="wine-price-icon">💰</span>
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

      {/* ZOOM DA IMAGEM */}
      {zoomImage && (
        <div
          className="zoom-overlay"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoom"
            className="zoom-img"
          />
        </div>
      )}
    </div>
  );
};

export default Results;
