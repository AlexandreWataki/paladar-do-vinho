// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 🎨 Estilos globais
import 'primeflex/primeflex.css'; // ✅ IMPORTANTE: garante que as classes flex funcionem
import 'primereact/resources/themes/lara-light-purple/theme.css'; // tema moderno e leve
import 'primereact/resources/primereact.min.css';                 // componentes base
import 'primeicons/primeicons.css';                               // ✅ ícones (setas, lixeiras, etc.)
import './styles/base.css';                                       // seu CSS personalizado

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
