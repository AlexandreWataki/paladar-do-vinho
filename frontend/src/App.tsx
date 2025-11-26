// src/App.tsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';

import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';

// Páginas
import Presentation from './pages/Presentation/Presentation';
import Questionary from './pages/Questionary/Questionary';
import Results from './pages/Results/Results';
import Login from './pages/Login/Login';
import AdminLogin from './pages/Login/AdminLogin';
import AccessDenied from './pages/AccessDenied/AccessDenied';

// Estilos globais
import './styles/base.css';

// ✅ Header novo (com frase2 + Login / Administrador)
import Header from './components/Header';

// ----------------------------------------
// Layout padrão com cabeçalho e navegação
// ----------------------------------------
const Layout: React.FC = () => {
  return (
    <div className="app-shell">
      {/* Header global (frase + botões Login / Administrador) */}
      <Header />

      {/* Conteúdo das páginas */}
      <main style={{ marginTop: 24 }}>
        <Outlet />
      </main>
    </div>
  );
};

// ----------------------------------------
// Roteamento principal do app
// ----------------------------------------
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout base com cabeçalho */}
        <Route element={<Layout />}>
          {/* Rotas públicas */}
          <Route path="/" element={<Presentation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/questionary" element={<Questionary />} />

          {/* Resultados (rota protegida para cliente logado) */}
          <Route
            path="/resultados"
            element={
              <ProtectedRoute requiredRole="Cliente">
                <Results />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Rotas administrativas (com CRUD) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="Administrador">
              <AdminRoute />
            </ProtectedRoute>
          }
        />

        {/* 🚨 Rota para acesso negado */}
        <Route path="/acesso-negado" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
