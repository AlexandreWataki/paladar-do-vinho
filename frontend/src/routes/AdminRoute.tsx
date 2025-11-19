// src/routes/AdminRoute.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/Admin/AdminPage';
import WineForm from '../pages/Admin/WineForm';

const AdminRoute: React.FC = () => {
  return (
    <Routes>
      {/* Página principal do painel admin */}
      <Route path="/" element={<AdminPage />} />

      {/* Cadastro de novo vinho */}
      <Route path="/novo" element={<WineForm />} />

      {/* Edição de vinho */}
      <Route path="editar/:id" element={<WineForm />} />
    </Routes>
  );
};

export default AdminRoute;
