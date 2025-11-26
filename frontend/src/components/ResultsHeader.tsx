import React from "react";
import "./ResultsHeader.css";

interface Props {
  onRestart: () => void;
}

const ResultsHeader: React.FC<Props> = ({ onRestart }) => {
  return (
    <div className="results-header-container">
      <div className="results-header">
        {/* título + botão lado a lado */}
        <div className="results-header-left">
          <h2 className="results-header-title">Recomendações</h2>
          <button className="btn-neon results-btn" onClick={onRestart}>
            Refazer Questionário
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader;
