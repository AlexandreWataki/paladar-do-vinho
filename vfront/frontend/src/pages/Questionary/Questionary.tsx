import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { http } from '../../api/http';
import "../../components/base.css"; // caminho relativo correto
import "./Questionary.css";


interface WineRecommendation {
  id: number;
  titulo: string;
  tipo: string;
  pais: string;
  uva: string;
  preco_medio: number;
  rotulo_url?: string;
  descricao?: string;
  similarity?: number;
}

const Questionary: React.FC = () => {
  const navigate = useNavigate();

  const [preferencia, setPreferencia] = useState('');
  const [ocasiao, setOcasiao] = useState(1);
  const [harmonizacao, setHarmonizacao] = useState('');
  const [docura, setDocura] = useState(3);
  const [tanino, setTanino] = useState(3);
  const [acidez, setAcidez] = useState(3);
  const [frutado, setFrutado] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => navigate(-1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userProfile = {
        preferencia_vinho: preferencia,
        ocasiao,
        harmonizacao: harmonizacao || null,
        nivel_docura: docura,
        nivel_tanino: tanino,
        nivel_acidez: acidez,
        nivel_frutado: frutado,
      };

      const response = await http<WineRecommendation[]>('/recommendations', {
        method: 'POST',
        body: JSON.stringify(userProfile),
      });

      navigate('/results', {
        state: { wines: response, userProfile },
      });
    } catch (err: any) {
      console.error('Erro ao gerar recomendações:', err);
      setError('Erro ao gerar recomendações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Loading (mesmo padrão visual)
  if (loading) {
    return (
      <motion.div
        className="questionary-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="questionary-card">
          <div className="questionary-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="questionary-emoji"
            >
              🍷
            </motion.div>
            <h2 className="questionary-loading-title">Gerando suas recomendações de vinhos...</h2>
            <p className="questionary-loading-sub">Um momento, estamos analisando o seu paladar…</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="questionary-container">
      <div className="questionary-card">
        <header className="questionary-header">
          <h1 className="questionary-title">
            <span className="questionary-word">Questionário</span>
          </h1>

          <button type="button" onClick={handleBack} className="questionary-back">
            ← Voltar
          </button>
        </header>

        <form onSubmit={handleSubmit} className="questionary-form">
          <label className="q-field">
            <span className="q-label">Tipo de vinho preferido</span>
            <select
              className="q-input q-select"
              value={preferencia}
              onChange={(e) => setPreferencia(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="tinto">Tinto</option>
              <option value="branco">Branco</option>
              <option value="rosé">Rosé</option>
              <option value="espumante">Espumante</option>
            </select>
          </label>

          {preferencia && (
            <p className="q-hint">
              {preferencia === 'tinto' && '🍷 Vinhos tintos têm taninos e corpo mais marcantes.'}
              {preferencia === 'branco' && '🥂 Vinhos brancos são leves e ácidos, com poucos taninos.'}
              {preferencia === 'rosé' && '🌸 Rosés possuem taninos leves e frescor agradável.'}
              {preferencia === 'espumante' && '✨ Espumantes são leves e refrescantes, com acidez destacada.'}
            </p>
          )}

          <label className="q-field">
            <span className="q-label">Ocasião de consumo</span>
            <select
              className="q-input q-select"
              value={ocasiao}
              onChange={(e) => setOcasiao(Number(e.target.value))}
              required
            >
              <option value={1}>Ocasião casual e relaxante</option>
              <option value={2}>Jantar com amigos ou família</option>
              <option value={3}>Acompanhamento para uma refeição</option>
              <option value={4}>Comemoração especial</option>
            </select>
          </label>

          <label className="q-field">
            <span className="q-label">Com qual prato você irá harmonizar o vinho?</span>
            <select
              className="q-input q-select"
              value={harmonizacao}
              onChange={(e) => setHarmonizacao(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="carne vermelha">Carne vermelha</option>
              <option value="frango ou carne de porco">Frango ou carne de porco</option>
              <option value="peixes e frutos do mar">Peixes e frutos do mar</option>
              <option value="massas">Massas</option>
              <option value="vegetariano">Vegetariano</option>
              <option value="queijos e frios">Queijos e frios</option>
              <option value="sem comida">Vou degustar o vinho sem acompanhamento</option>
            </select>
          </label>

          <label className="q-field">
            <span className="q-label">Nível de doçura (1 = seco / 5 = doce)</span>
            <div className="q-range-wrap">
              <input
                className="q-range"
                type="range"
                min="1"
                max="5"
                value={docura}
                onChange={(e) => setDocura(Number(e.target.value))}
              />
              <span className="q-range-value">{docura}</span>
            </div>
          </label>

          {(preferencia === 'tinto' || preferencia === 'rosé') && (
            <label className="q-field">
              <span className="q-label">Nível de tanino (1 = leve / 5 = intenso)</span>
              <div className="q-range-wrap">
                <input
                  className="q-range"
                  type="range"
                  min="1"
                  max="5"
                  value={tanino}
                  onChange={(e) => setTanino(Number(e.target.value))}
                />
                <span className="q-range-value">{tanino}</span>
              </div>
            </label>
          )}

          <label className="q-field">
            <span className="q-label">Nível de acidez (1 = suave / 5 = ácido)</span>
            <div className="q-range-wrap">
              <input
                className="q-range"
                type="range"
                min="1"
                max="5"
                value={acidez}
                onChange={(e) => setAcidez(Number(e.target.value))}
              />
              <span className="q-range-value">{acidez}</span>
            </div>
          </label>

          <label className="q-field">
            <span className="q-label">Nível de frutado (1 = leve / 5 = intenso)</span>
            <div className="q-range-wrap">
              <input
                className="q-range"
                type="range"
                min="1"
                max="5"
                value={frutado}
                onChange={(e) => setFrutado(Number(e.target.value))}
              />
              <span className="q-range-value">{frutado}</span>
            </div>
          </label>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="q-error"
            >
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={loading} className="q-submit">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Questionary;
