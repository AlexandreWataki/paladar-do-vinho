import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/Admin/AdminPage';
import WineForm from '../pages/Admin/WineForm';

const AdminRoute: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/novo" element={<WineForm mode="create" />} />
      <Route path="/editar/:id" element={<WineForm mode="edit" />} />
    </Routes>
  );
};

export default AdminRoute;
