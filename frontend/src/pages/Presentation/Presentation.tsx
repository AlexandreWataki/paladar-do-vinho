import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Presentation.css';
import logo from '../../assets/logo.png';
import frase from '../../assets/frase.png';
import NeonButton from '../../components/NeonButton';

const Presentation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="presentation-container">
      {/* removi a header-divider */}

      <img src={logo} alt="Paladar de Vinho" className="logo-img" />
      <img
        src={frase}
        alt="Descubra vinhos ideais para seu gosto e ocasião"
        className="phrase-img"
      />

      <div className="button-group">
        <NeonButton onClick={() => navigate('/login')}>
          Entrar como Usuário
        </NeonButton>
        <NeonButton onClick={() => navigate('/admin-login')}>
          Administrador
        </NeonButton>
      </div>
    </div>
  );
};

export default Presentation;
