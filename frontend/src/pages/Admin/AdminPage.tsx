// src/pages/Admin/AdminPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { motion } from "framer-motion";

import { fetchWines, deleteWine } from "../../api/adminWines";
import "./AdminPage.css";

interface WineData {
  id: number;
  titulo: string;
  tipo: string;
  pais: string;
  uva: string;
  preco_medio: number;
  rotulo_url?: string | null;
  descricao?: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [wines, setWines] = useState<WineData[]>([]);
  const [loading, setLoading] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // 🔹 quantidade de linhas que cabem na tela
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const loadWines = async () => {
    setLoading(true);
    try {
      const data = await fetchWines();
      setWines(Array.isArray(data) ? data : [data]);
    } catch {
      alert("Erro ao carregar lista de vinhos.");
      setWines([]);
    } finally {
      setLoading(false);
    }
  };

  // Carrega lista
  useEffect(() => {
    loadWines();
  }, []);

  // 🔹 Calcula automaticamente quantas linhas cabem na altura da tela
  useEffect(() => {
    const calcRows = () => {
      const vh = window.innerHeight;

      // Altura aproximada ocupada por:
      // header do card + bordas + paginador
      const reservedHeight = 230; // ajuste fino se precisar
      const rowHeight = 48; // altura aproximada de cada linha

      const available = vh - reservedHeight;
      const rows = Math.max(5, Math.floor(available / rowHeight)); // mínimo 5

      setRowsPerPage(rows);
    };

    calcRows(); // calcula na primeira carga
    window.addEventListener("resize", calcRows);
    return () => window.removeEventListener("resize", calcRows);
  }, []);

  const handleOpenImage = (wine: WineData) => {
    const raw = String(wine.rotulo_url);
    const file = raw.split("/").pop();
    setSelectedImage(`/rotulos/${file}`);
    setLightboxOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este vinho?")) return;
    try {
      await deleteWine(id);
      alert("Vinho excluído!");
      loadWines();
    } catch (err) {
      console.error(err);
    }
  };

  // estilo base das células – centralizado
  const cellStyle = { padding: "10px 0", textAlign: "center" as const };

  return (
    <>
      <motion.div
        className="admin-container"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="admin-card">
          {/* TOPO */}
          <div className="admin-header">
            <Button
              label="Novo"
              icon="pi pi-plus"
              className="admin-btn-top"
              onClick={() => navigate("/admin/novo")}
            />

            <h2 className="admin-title">Painel Administrativo – Vinhos</h2>

            <Button
              label="Sair"
              icon="pi pi-sign-out"
              className="admin-btn-top"
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("role");
                navigate("/admin-login");
              }}
            />
          </div>

          {/* TABELA */}
          <div className="admin-table-wrapper">
            <DataTable
              value={wines}
              paginator
              rows={rowsPerPage}          // 👈 agora é dinâmico
              rowsPerPageOptions={[]}      // sem dropdown 10/25/50
              dataKey="id"
              stripedRows
              loading={loading}
              emptyMessage="Nenhum vinho cadastrado."
              scrollable
              scrollHeight="flex"
            >
              {/* ORDEM: ID | TÍTULO | TIPO | PAÍS | UVA | PREÇO | AÇÕES (3 ícones) */}

              <Column
                field="id"
                header="ID"
                sortable
                style={{ width: "60px", ...cellStyle }}
              />

              <Column
                field="titulo"
                header="Título"
                sortable
                body={(r) => r.titulo}
                style={{ minWidth: "120px", maxWidth: "140px", ...cellStyle }}
              />

              <Column
                field="tipo"
                header="Tipo"
                sortable
                style={{ width: "90px", ...cellStyle }}
              />

              <Column
                field="pais"
                header="País"
                sortable
                style={{ width: "100px", ...cellStyle }}
              />

              <Column
                field="uva"
                header="Uva"
                sortable
                style={{ minWidth: "120px", maxWidth: "140px", ...cellStyle }}
              />

              {/* PREÇO MÉDIO */}
              <Column
                field="preco_medio"
                header="Preço Médio"
                sortable
                body={(r) => (
                  <span className="admin-price">
                    {r.preco_medio != null
                      ? r.preco_medio.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 2,
                        })
                      : "—"}
                  </span>
                )}
                style={{ width: "120px", ...cellStyle }}
              />

              {/* AÇÕES – Rótulo + Editar + Excluir, todos na mesma coluna */}
              <Column
                header="Ações"
                style={{ width: "130px", ...cellStyle }}
                body={(r: WineData) => (
                  <div className="admin-actions">
                    {r.rotulo_url && (
                      <Button
                        icon="pi pi-image"
                        className="admin-icon-btn admin-btn-lightbox"
                        aria-label="Ver rótulo"
                        onClick={() => handleOpenImage(r)}
                      />
                    )}

                    <Button
                      icon="pi pi-pencil"
                      className="admin-icon-btn admin-btn-edit"
                      aria-label="Editar"
                      onClick={() => navigate(`/admin/editar/${r.id}`)}
                    />

                    <Button
                      icon="pi pi-trash"
                      className="admin-icon-btn admin-btn-delete"
                      aria-label="Excluir"
                      onClick={() => handleDelete(r.id)}
                    />
                  </div>
                )}
              />
            </DataTable>
          </div>
        </Card>
      </motion.div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="admin-lightbox" onClick={() => setLightboxOpen(false)}>
          <motion.img
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="admin-lightbox-img"
            src={selectedImage}
          />
        </div>
      )}
    </>
  );
};

export default AdminPage;
