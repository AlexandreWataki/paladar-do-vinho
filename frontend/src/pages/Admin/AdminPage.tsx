// src/pages/Admin/AdminPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { fetchWines, deleteWine } from '../../api/adminWines';
import { motion } from 'framer-motion';

interface WineData {
  id: number;
  titulo: string;
  tipo: string;
  pais: string;
  uva: string;
  preco_medio: number;
  rotulo_url?: string;
  descricao?: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [wines, setWines] = useState<WineData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWines = async () => {
    setLoading(true);
    try {
      const data = await fetchWines();
      console.log("🍷 Dados recebidos do backend:", data);

      // ✅ Garantir que o retorno seja sempre um array válido
      if (Array.isArray(data)) {
        setWines(data);
      } else if (data && typeof data === "object") {
        setWines([data]);
      } else {
        setWines([]);
      }
    } catch (error) {
      console.error("Erro ao carregar vinhos:", error);
      alert("Erro ao carregar lista de vinhos.");
      setWines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWines();
  }, []);

  const handleNew = () => navigate('/admin/novo');
  const handleEdit = (id: number) => navigate(`/admin/editar/${id}`);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este vinho?')) {
      try {
        await deleteWine(id);
        alert('🗑️ Vinho excluído com sucesso!');
        loadWines();
      } catch (error) {
        console.error('Erro ao excluir vinho:', error);
        alert('Erro ao excluir vinho.');
      }
    }
  };

  const priceTemplate = (rowData: WineData) =>
    rowData.preco_medio?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }) ?? "—";

  const actionTemplate = (rowData: WineData) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <Button
        label="Editar"
        icon="pi pi-pencil"
        className="p-button-sm p-button-warning"
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.9rem',
        }}
        onClick={() => handleEdit(rowData.id)}
      />
      <Button
        label="Excluir"
        icon="pi pi-trash"
        className="p-button-sm p-button-danger"
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.9rem',
        }}
        onClick={() => handleDelete(rowData.id)}
      />
    </div>
  );

  return (
    <motion.div
      className="admin-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className="w-full shadow-3 border-round-2xl p-4"
        style={{
          overflow: 'visible',
          minHeight: '85vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ===================== TOPO ===================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(90deg, #6a1b9a, #8e24aa, #ba68c8)',
            padding: '1.3rem 2.5rem',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 4px 12px rgba(149, 70, 184, 0.25)',
            color: '#fff',
          }}
        >
          <Button
            label="Novo"
            icon="pi pi-plus"
            style={{
              backgroundColor: '#ffffff22',
              border: '1px solid #fff',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
              transition: '0.3s',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = '#ffffff44')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = '#ffffff22')
            }
            onClick={handleNew}
          />

          <h2
            style={{
              color: 'white',
              margin: 0,
              textAlign: 'center',
              fontWeight: 700,
              flex: 1,
              textShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          >
            Painel Administrativo – Vinhos Cadastrados
          </h2>

          <Button
            label="Sair"
            icon="pi pi-sign-out"
            style={{
              backgroundColor: '#ffffff22',
              border: '1px solid #fff',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
              transition: '0.3s',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = '#ffffff44')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = '#ffffff22')
            }
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('role');
              window.location.href = '/admin-login';
            }}
          />
        </div>

        {/* ===================== TABELA ===================== */}
        <div className="p-datatable-wrapper" style={{ flex: 1 }}>
          <DataTable
            value={wines}
            paginator
            rows={10}
            dataKey="id"
            stripedRows
            loading={loading}
            emptyMessage="Nenhum vinho cadastrado ainda."
            className="p-datatable-sm"
            responsiveLayout="scroll"
          >
            <Column
              field="id"
              header="ID"
              sortable
              style={{ width: '70px', textAlign: 'center' }}
              body={(rowData) => (
                <span style={{ display: 'block', textAlign: 'center' }}>
                  {rowData.id}
                </span>
              )}
            />
            <Column field="titulo" header="Título" sortable />
            <Column field="tipo" header="Tipo" sortable />
            <Column field="pais" header="País" sortable />
            <Column field="uva" header="Uva" sortable />
            <Column
              field="preco_medio"
              header="Preço Médio"
              body={priceTemplate}
              sortable
            />
            <Column
              header="Ações"
              body={actionTemplate}
              style={{
                width: '170px',
                textAlign: 'center',
                padding: '6px 0',
              }}
            />
          </DataTable>
        </div>

        {/* ===================== RODAPÉ ===================== */}
        <div
          style={{
            height: '2rem',
            backgroundColor: '#fff',
            borderRadius: '0 0 10px 10px',
          }}
        />
      </Card>
    </motion.div>
  );
};

export default AdminPage;
