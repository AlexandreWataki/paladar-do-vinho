import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { http } from '../../api/http';
import '../../styles/base.css';
import QuestionStep from './QuestionStep';
import SubmitButton from './SubmitButton';

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await http.post('/recomendar', {
        preferencia,
        ocasiao,
        harmonizacao,
        nivel_docura: docura,
        nivel_tanino: tanino,
        nivel_acidez: acidez,
        nivel_frutado: frutado,
      });

      navigate('/results', {
        state: { wines: response.data, userProfile: { preferencia, ocasiao, harmonizacao } },
      });
    } catch (error) {
      alert('Erro ao buscar recomendações. Verifique o servidor e tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <h2 style={{ color: '#7b1fa2', marginBottom: '1.5rem' }}>🍇 Monte seu perfil de paladar</h2>

      {/* Etapas do questionário */}
      <div className="grid p-fluid">
        <QuestionStep
          label="Qual tipo de vinho você prefere?"
          value={preferencia}
          onChange={setPreferencia}
          options={[
            { label: 'Tinto', value: 'tinto' },
            { label: 'Branco', value: 'branco' },
            { label: 'Rosé', value: 'rose' },
            { label: 'Espumante', value: 'espumante' },
          ]}
        />

        <QuestionStep
          label="Para qual ocasião?"
          value={ocasiao}
          onChange={setOcasiao}
          options={[
            { label: 'Casual', value: 1 },
            { label: 'Jantar', value: 2 },
            { label: 'Presente', value: 3 },
            { label: 'Celebração', value: 4 },
          ]}
        />

        <QuestionStep
          label="Com qual tipo de prato você quer harmonizar?"
          value={harmonizacao}
          onChange={setHarmonizacao}
          options={[
            { label: 'Carnes vermelhas', value: 'carnes vermelhas' },
            { label: 'Massas', value: 'massas' },
            { label: 'Peixes', value: 'peixes' },
            { label: 'Sobremesas', value: 'sobremesas' },
          ]}
        />

        <QuestionStep label="Nível de doçura (1 a 5)" type="number" value={docura} onChange={setDocura} />
        <QuestionStep label="Nível de tanino (1 a 5)" type="number" value={tanino} onChange={setTanino} />
        <QuestionStep label="Nível de acidez (1 a 5)" type="number" value={acidez} onChange={setAcidez} />
        <QuestionStep label="Nível de frutado (1 a 5)" type="number" value={frutado} onChange={setFrutado} />
      </div>

      <SubmitButton label="Ver recomendações" loading={loading} onClick={handleSubmit} />
    </motion.div>
  );
};

export default Questionary;
