import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/base.css';

const CrudPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  return (
    <div className="page-container">
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2>🍇 Painel do Administrador</h2>
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

      <p style={{ textAlign: 'center', color: '#555' }}>
        Aqui será implementado o painel de gerenciamento de vinhos (CRUD).  
        Você poderá adicionar, editar e excluir rótulos.
      </p>

      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          border: '1px dashed #ccc',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
          textAlign: 'center',
        }}
      >
        <p>🔧 Em breve: funcionalidade de CRUD em construção...</p>
      </div>
    </div>
  );
};

export default CrudPage;
