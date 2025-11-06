import React from 'react';
import { Button } from 'primereact/button';

interface SubmitButtonProps {
  label?: string;
  loading?: boolean;
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ label = 'Enviar', loading = false, onClick }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <Button
        label={loading ? 'Carregando...' : label}
        icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        disabled={loading}
        onClick={onClick}
        style={{
          backgroundColor: '#7b1fa2',
          border: 'none',
          padding: '10px 24px',
          fontSize: '1rem',
          borderRadius: '8px',
          fontWeight: 500,
        }}
      />
    </div>
  );
};

export default SubmitButton;
