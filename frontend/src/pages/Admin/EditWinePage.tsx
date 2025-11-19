import React from "react";
import WineForm from "./WineForm";

const EditWinePage: React.FC = () => {
  return (
    <div
      className="admin-container"
      style={{
        overflowY: "auto",
        alignItems: "flex-start",
        padding: "20px",
      }}
    >

      {/* 🔵 Cabeçalho igual ao Painel Administrativo */}
      <div
        style={{
          background: "linear-gradient(90deg, #6a1b9a, #8e24aa, #ba68c8)",
          padding: "1.4rem 2rem",
          borderRadius: "12px",
          color: "white",
          textAlign: "center",
          fontSize: "1.8rem",
          fontWeight: 700,
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(149, 70, 184, 0.25)",
        }}
      >
        Editar Vinho
      </div>

      {/* Formulário original */}
      <WineForm />
    </div>
  );
};

export default EditWinePage;
