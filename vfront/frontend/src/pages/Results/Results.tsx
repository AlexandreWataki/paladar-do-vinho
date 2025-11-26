import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import WineCard from "../../components/WineCard";
import ResultsHeader from "../../components/ResultsHeader";
import "../../components/neon.css";
import "./Results.css";

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const wines = (state?.wines || []) as any[];

  const handleRestart = () => navigate("/questionary");
  const handleBack = () => navigate(-1);

  if (!wines || wines.length === 0) {
    return (
      <motion.div
        className="results-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="glass-card" style={{ maxWidth: 680, textAlign: "center" }}>
          <h2 className="results-title">🍇 Nenhuma recomendação encontrada</h2>
          <p className="glass-value" style={{ marginBottom: 14 }}>
            Tente ajustar suas preferências e responder novamente o questionário.
          </p>
          <div className="results-buttons">
            <button className="btn-neon" onClick={handleRestart}>
              Refazer Questionário
            </button>
            <button className="btn-neon" onClick={handleBack}>
              Voltar
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="results-page"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ResultsHeader onRestart={handleRestart} onBack={handleBack} />

      {/* 🧱 grade com uma “caixa” para cada vinho */}
      <div className="results-grid">
        {wines.map((wine: any, i: number) => (
          <motion.div
            key={wine.id ?? i}
            className="wine-box" // 🆕 adicionamos a classe para dar a caixa individual
            layout="position"
            whileHover={{ scale: 1.02 }}
          >
            <WineCard
              wine={{
                id: wine.id,
                titulo: wine.titulo,
                tipo: wine.tipo,
                pais: wine.pais,
                uva: wine.uva,
                preco_medio: wine.preco_medio,
                rotulo_url: wine.rotulo_url,
                descricao: wine.descricao,
                similarity: wine.similarity,
                harmonizacao: wine.harmonizacao,
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Results;
