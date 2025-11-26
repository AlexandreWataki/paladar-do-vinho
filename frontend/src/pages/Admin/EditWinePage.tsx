// src/pages/Admin/EditWinePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import WineForm from "./WineForm";
import "./AdminPage.css";   // estilos de layout do painel
import "./CrudPage.css";    // estilos complementares

const EditWinePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="admin-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="admin-card">

        {/* TOPO PADRÃO IGUAL AO CRUD E ADMIN */}
        <div className="admin-header">
          <button
            className="admin-btn-top crud-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>

          <h2 className="admin-title">Editar Vinho</h2>

          {/* espaçador */}
          <span style={{ width: 90 }} />
        </div>

        {/* FORMULÁRIO */}
        <div className="crud-body" style={{ width: "100%", paddingTop: 20 }}>
          <WineForm />
        </div>

      </div>
    </motion.div>
  );
};

export default EditWinePage;
