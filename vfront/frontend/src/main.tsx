import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

// Páginas
import Presentation from './pages/Presentation/Presentation';
import Login from './pages/Login/Login';
import AdminLogin from './pages/Admin/AdminLogin';
import Questionary from './pages/Questionary/Questionary';
import Results from './pages/Results/Results';
import AdminPage from './pages/Admin/AdminPage';
import UsuarioPage from './pages/Usuario/UsuarioPage';

// 🌈 Importa apenas o estilo global
import "./components/base.css"; // ✅ agora dentro de /components

// Configuração das rotas
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Presentation /> },
      { path: 'login', element: <Login /> },
      { path: 'admin-login', element: <AdminLogin /> },
      { path: 'questionary', element: <Questionary /> },
      { path: 'results', element: <Results /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'usuario', element: <UsuarioPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
