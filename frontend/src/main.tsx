// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 💡 IMPORTANTE: Importa o provedor de autenticação
import { AuthProvider } from './context/AuthContext'; 

// 🎨 Estilos globais
import 'primeflex/primeflex.css'; 
import 'primereact/resources/themes/lara-light-purple/theme.css'; 
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css'; 
import './styles/base.css'; 

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* ✅ CORREÇÃO: Envolve a aplicação com o AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);