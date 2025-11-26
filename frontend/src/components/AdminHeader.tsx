import React from "react";
import "./AdminHeader.css";

interface Props {
  onAddWine: () => void;
}

const AdminHeader: React.FC<Props> = ({ onAddWine }) => {
  return (
    <div className="admin-header-container">
      <div className="admin-header">
        {/* título + botão lado a lado */}
        <div className="admin-header-left">
          <h2 className="admin-header-title">Painel de Vinhos</h2>
          <button className="btn-neon admin-btn" onClick={onAddWine}>
            Adicionar Vinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
