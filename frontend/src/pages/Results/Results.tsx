import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/base.css';
import WineCard from './WineCard';
import type { WineRecommendation } from '../../types/Wine';
import { Dropdown } from 'primereact/dropdown';

const typeColors: Record<string, string> = {
  tinto: '#7b2d26',
  branco: '#d4a017',
  rosé: '#e89cae',
  rose: '#e89cae',
  espumante: '#f0c674',
};

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wines = (location.state?.wines || []) as WineRecommendation[];
  const userProfile = location.state?.userProfile || {};

  const [sortOrder, setSortOrder] = useState<string>('none');

  const sortOptions = [
    { label: 'Sem ordenação', value: 'none' },
    { label: 'Preço: menor para maior', value: 'asc' },
    { label: 'Preço: maior para menor', value: 'desc' },
  ];

  const sortedWines = [...wines].sort((a, b) => {
    if (sortOrder === 'asc') return (a.preco_medio ?? 0) - (b.preco_medio ?? 0);
    if (sortOrder === 'desc') return (b.preco_medio ?? 0) - (a.preco_medio ?? 0);
    return 0;
  });

  const handleRestart = () => navigate('/questionary');
  const handleBack = () => navigate(-1);

  if (!wines || wines.length === 0) {
    return (
      <motion.div
        className="page-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center' }}
      >
        <h2>🍇 Nenhuma recomendação encontrada</h2>
        <p>Tente ajustar suas preferências e responder novamente o questionário.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={handleRestart}>Refazer Questionário</button>
          <button onClick={handleBack}>Voltar</button>
        </div>
      </motion.div>
    );
  }

  const tipoVinho = wines[0]?.tipo?.toLowerCase() || userProfile.preferencia_vinho || '';
  const harmonizacao = wines[0]?.harmonizacao || userProfile.harmonizacao || '';
  const tipoFormatado = tipoVinho.charAt(0).toUpperCase() + tipoVinho.slice(1).toLowerCase();
  const corTipo = typeColors[tipoVinho] || '#7b2d26';
  const tituloDinamico = harmonizacao
    ? `🍷 Recomendações para vinhos ${tipoFormatado}s — harmonização com ${harmonizacao}`
    : `🍷 Recomendações para vinhos ${tipoFormatado}s`;

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Cabeçalho */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ color: corTipo }}>{tituloDinamico}</h2>
        <button
          onClick={handleBack}
          style={{
            backgroundColor: '#ddd',
            color: '#333',
            padding: '6px 10px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Voltar
        </button>
      </header>

      {/* Seletor de ordenação */}
      <div className="flex justify-content-end mb-3" style={{ marginBottom: '1.5rem' }}>
        <Dropdown
          value={sortOrder}
          options={sortOptions}
          onChange={(e) => setSortOrder(e.value)}
          placeholder="Ordenar por"
          className="w-20rem"
        />
      </div>

      {/* Lista de vinhos */}
      <motion.div
        layout
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          marginTop: '20px',
        }}
      >
        {sortedWines.map((wine) => {
          const tipo = wine.tipo?.toLowerCase?.() || '';
          const color = typeColors[tipo] || '#ccc';
          const emoji =
            wine.tipo?.toLowerCase().includes('tinto') ? '🍷' :
            wine.tipo?.toLowerCase().includes('branco') ? '🥂' :
            wine.tipo?.toLowerCase().includes('ros') ? '🌸' :
            '✨';

          return (
            <motion.div
              key={wine.id}
              layout
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                borderRadius: '12px',
                backgroundColor: '#fafafa',
                boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '8px', backgroundColor: color }} />
              <div style={{ padding: '16px' }}>
                {wine.rotulo_url ? (
                  <motion.img
                    src={wine.rotulo_url}
                    alt={wine.titulo}
                    style={{
                      width: '100%',
                      height: '240px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '240px',
                      backgroundColor: '#eee',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '8px',
                      color: '#999',
                      fontStyle: 'italic',
                    }}
                  >
                    Sem imagem
                  </div>
                )}

                <h3 style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{emoji}</span> {wine.titulo}
                </h3>

                <p style={{ margin: '4px 0', color: '#555' }}>
                  <strong>Tipo:</strong> {wine.tipo} <br />
                  <strong>Origem:</strong> {wine.pais} <br />
                  <strong>Uva:</strong> {wine.uva}
                </p>

                {wine.similarity && (
                  <p style={{ color: '#b22222', fontWeight: 'bold' }}>
                    Compatibilidade: {(wine.similarity * 100).toFixed(1)}%
                  </p>
                )}

                <p style={{ margin: '4px 0', color: '#444' }}>
                  {wine.harmonizacao && (
                    <>
                      🍽️ <strong>Ideal para:</strong> {wine.harmonizacao}
                      <br />
                    </>
                  )}
                  💰 <strong>Preço médio:</strong>{' '}
                  {wine.preco_medio?.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>

                {wine.descricao && (
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '0.9em',
                      color: '#555',
                      textAlign: 'justify',
                    }}
                  >
                    {wine.descricao}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Botões inferiores */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button onClick={handleRestart} style={{ marginRight: '12px' }}>
          Refazer Questionário
        </button>
        <button onClick={handleBack}>Voltar</button>
      </div>
    </motion.div>
  );
};

export default Results;
