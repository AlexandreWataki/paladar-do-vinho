// src/pages/System/AccessDenied.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react'; // ✅ ícone elegante da biblioteca lucide-react

interface AccessDeniedProps {
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ message }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      style={{
        textAlign: 'center',
        marginTop: '120px',
        color: '#4a2c2a',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* 🔒 Ícone animado de cadeado */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
        transition={{
          duration: 1,
          ease: 'easeInOut',
          repeat: 1,
        }}
        style={{ display: 'inline-block', marginBottom: '12px' }}
      >
        <Lock size={72} color="#7b2d26" strokeWidth={1.5} />
      </motion.div>

      <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>🚫 Acesso Negado</h1>

      <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '24px' }}>
        {message || 'Você precisa estar logado para acessar esta página.'}
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: '#7b2d26',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Ir para Login
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: '#d4a017',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Voltar
        </button>
      </div>
    </motion.div>
  );
};

export default AccessDenied;
