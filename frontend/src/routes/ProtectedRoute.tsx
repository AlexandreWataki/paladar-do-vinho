// src/routes/ProtectedRoute.tsx
import React from 'react';
import AccessDenied from '../pages/System/AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Administrador' | 'Cliente';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <AccessDenied message="Você precisa estar logado para acessar esta página." />;
  }

  if (requiredRole && role !== requiredRole) {
    return <AccessDenied message="Esta área é restrita. Seu perfil não possui permissão de acesso." />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
