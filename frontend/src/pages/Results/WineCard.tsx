import React from 'react';
import '../../styles/base.css';
import type { WineRecommendation } from '../../types/Wine';

interface Props {
  wine: WineRecommendation;
}

const WineCard: React.FC<Props> = ({ wine }) => {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#fff',
        textAlign: 'left',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
      }}
    >
      <h3 style={{ color: '#4a148c', marginBottom: 8 }}>
        {wine.titulo || "Vinho sem título"}
      </h3>

      <p><strong>Tipo:</strong> {wine.tipo}</p>

      <p><strong>Uva:</strong> {wine.uva}</p>

      <p>
        <strong>Harmonização:</strong>{" "}
        {wine.user_pairing && wine.user_pairing.trim() !== ""
          ? wine.user_pairing
          : (wine.harmonizacao && wine.harmonizacao.trim() !== ""
              ? wine.harmonizacao
              : "Não informada")}
      </p>


      <p><strong>Preço Médio:</strong> {wine.preco_medio}</p>
    </div>
  );
};

export default WineCard;
