import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NeonGlassCard from "./NeonGlassCard";
import "./neon.css";

export interface WineCardData {
  id?: number | string;
  titulo: string;
  tipo: string;
  pais?: string;
  uva?: string;
  preco_medio?: number | string;
  rotulo_url?: string;
  descricao?: string;
  similarity?: number; // 0..1
  harmonizacao?: string;
}

interface Props {
  wine: WineCardData;
  defaultOpen?: boolean;
}

const typeColors: Record<string, string> = {
  tinto: "#7b2d26",
  branco: "#d4a017",
  rosé: "#e89cae",
  rose: "#e89cae",
  espumante: "#f0c674",
};

const getEmoji = (tipo?: string) => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("tinto")) return "🍷";
  if (t.includes("branco")) return "🥂";
  if (t.includes("ros")) return "🌸";
  if (t.includes("espum")) return "✨";
  return "🍇";
};

const WineCard: React.FC<Props> = ({ wine, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  const color = typeColors[wine.tipo?.toLowerCase()] || "#bbb";
  const emoji = getEmoji(wine.tipo);
  const precoFmt =
    typeof wine.preco_medio === "number"
      ? `R$ ${wine.preco_medio.toFixed(2)}`
      : wine.preco_medio ?? "";

  return (
    <NeonGlassCard
      className="wine-card"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{emoji}</span> {wine.titulo}
        </div>
      }
      right={
        <div className="wine-toggle-btn">
          <button className="btn-neon btn-large" onClick={() => setOpen((v) => !v)}>
            {open ? "🔻 Ocultar Detalhes" : "🔍 Ver Detalhes"}
          </button>
        </div>
      }
    >
      {/* faixa colorida pelo tipo */}
      <div
        className="wine-sep"
        style={{ background: color }}
      />

      {/* conteúdo principal */}
      <div className="wine-inner">
        {/* imagem */}
        {wine.rotulo_url ? (
          <motion.img
            src={wine.rotulo_url}
            alt={wine.titulo}
            className="wine-thumb"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="wine-thumb placeholder">Sem imagem</div>
        )}

        {/* detalhes animados */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="glass-body details-wrap">
                <div className="glass-row">
                  <span className="glass-label">Tipo:</span>
                  <span className="glass-value">{wine.tipo}</span>
                </div>

                {wine.pais && (
                  <div className="glass-row">
                    <span className="glass-label">Origem:</span>
                    <span className="glass-value">{wine.pais}</span>
                  </div>
                )}

                {wine.uva && (
                  <div className="glass-row">
                    <span className="glass-label">Uva:</span>
                    <span className="glass-value">{wine.uva}</span>
                  </div>
                )}

                {typeof wine.similarity === "number" && (
                  <div className="glass-row">
                    <span className="glass-label">Compatibilidade:</span>
                    <span className="glass-value">
                      {(wine.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                )}

                {wine.harmonizacao && (
                  <div className="glass-row">
                    <span className="glass-label">Ideal para:</span>
                    <span className="glass-value">🍽️ {wine.harmonizacao}</span>
                  </div>
                )}

                {wine.preco_medio && (
                  <div className="glass-row">
                    <span className="glass-label">Preço médio:</span>
                    <span className="glass-value">💰 {precoFmt}</span>
                  </div>
                )}

                {wine.descricao && (
                  <p className="glass-value justified">{wine.descricao}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NeonGlassCard>
  );
};

export default WineCard;
