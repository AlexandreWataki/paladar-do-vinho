import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/base.css';

const Presentation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <h1>🍷 Paladar de Vinho</h1>
      <p>Descubra vinhos ideais para seu gosto e ocasião.</p>

      <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
        <button onClick={() => navigate('/login')}>Entrar como Usuário</button>
        <button onClick={() => navigate('/admin-login')}>Administrador</button>
      </div>
    </div>
  );
};

export default Presentation;
