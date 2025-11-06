// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from './api/auth';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';

// Páginas
import Presentation from './pages/Presentation/Presentation';
import Questionary from './pages/Questionary/Questionary';
import Results from './pages/Results/Results';
import Login from './pages/Login/Login';
import AdminLogin from './pages/Login/AdminLogin';

import './styles/base.css';

// ----------------------------------------
// Layout padrão com cabeçalho e navegação
// ----------------------------------------
const Layout: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px',
          marginBottom: '20px',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: '#7b2d26' }}>
          <h1 style={{ margin: 0, fontFamily: 'Georgia, serif' }}>🍷 Paladar de Vinho</h1>
        </Link>

        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!token && (
            <>
              <Link
                to="/login"
                style={{
                  backgroundColor: '#7b2d26',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Login
              </Link>
              <Link
                to="/admin-login"
                style={{
                  backgroundColor: '#d4a017',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Administrador
              </Link>
            </>
          )}

          {token && (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              Sair
            </button>
          )}
        </nav>
      </header>

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
          <Route path="/questionario" element={<Questionary />} />

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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
