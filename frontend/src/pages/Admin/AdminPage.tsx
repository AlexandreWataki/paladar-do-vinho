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
  rotulo_url?: string | null;
  descricao?: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [wines, setWines] = useState<WineData[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para o Lightbox (Imagem)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const loadWines = async () => {
    setLoading(true);
    try {
      const data = await fetchWines();
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
      }
    }
  };

  // Lógica para abrir a imagem
  const handleOpenImage = (wine: WineData) => {
    const rawString = String(wine.rotulo_url);
    const filename = rawString.split('/').pop();
    const finalPath = `/rotulos/${filename}`;
    setSelectedImage(finalPath);
    setLightboxOpen(true);
  };

  const priceTemplate = (rowData: WineData) =>
    rowData.preco_medio?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }) ?? "—";

  const actionTemplate = (rowData: WineData) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      <Button
        label="Editar"
        icon="pi pi-pencil"
        className="p-button-sm p-button-warning"
        onClick={() => handleEdit(rowData.id)}
        style={{ fontSize: '0.85rem' }} 
      />
      <Button
        label="Excluir"
        icon="pi pi-trash"
        className="p-button-sm p-button-danger"
        onClick={() => handleDelete(rowData.id)}
        style={{ fontSize: '0.85rem' }}
      />
    </div>
  );

  const imageButtonTemplate = (wine: WineData) => {
    if (!wine || !wine.rotulo_url) {
      return <span style={{ color: '#999', fontSize: '0.85rem' }}>Sem imagem</span>;
    }
    return (
      <Button
        label="Ver Rótulo"
        icon="pi pi-image"
        className="p-button-sm p-button-info"
        tooltip="Clique para ver"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleOpenImage(wine)} // Abre o nosso Lightbox customizado
        style={{ fontSize: '0.85rem' }}
      />
    );
  };

  const textTemplate = (rowData: WineData, field: keyof WineData) => {
    const content = String(rowData[field] || '');
    return (
      <div 
        title={content}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          display: 'block'
        }}
      >
        {content}
      </div>
    );
  };

  // 🔥 AJUSTE DE SEGURANÇA:
  // 0.6rem é o tamanho ideal para ficar bonito sem empurrar as setas para fora
  const cellStyle = { 
    paddingTop: '0.6rem', 
    paddingBottom: '0.6rem' 
  };

  return (
    <>
      <motion.div
        className="admin-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Card
          className="w-full shadow-3 border-round-2xl p-0"
          style={{
            minHeight: "90vh",
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* TOPO */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(90deg, #6a1b9a, #8e24aa, #ba68c8)',
              padding: '1.2rem 2rem',
              borderRadius: '12px 12px 0 0',
              color: '#fff',
              flexShrink: 0 
            }}
          >
            <Button label="Novo" icon="pi pi-plus" onClick={handleNew} style={{ backgroundColor: '#ffffff22', border: '1px solid #fff', color: 'white' }} />
            <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontWeight: 700, fontSize: '1.4rem' }}>Painel Administrativo – Vinhos</h2>
            <Button label="Sair" icon="pi pi-sign-out" onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('role'); window.location.href = '/admin-login'; }} style={{ backgroundColor: '#ffffff22', border: '1px solid #fff', color: 'white' }} />
          </div>

          {/* TABELA */}
          <div style={{ 
              flex: 1, 
              display: 'flex',
              flexDirection: 'column',
              padding: "0 2rem",
              overflow: "hidden",
              height: '100%' 
            }}>
            
            <DataTable
              value={wines}
              paginator
              rows={8} // 🔥 8 LINHAS PARA GARANTIR QUE AS SETAS APAREÇAM
              dataKey="id"
              stripedRows
              loading={loading}
              emptyMessage="Nenhum vinho cadastrado ainda."
              tableStyle={{ minWidth: '1200px' }}
              scrollable 
              scrollHeight="flex" 
              style={{ flex: 1 }}
            >
              <Column field="id" header="ID" sortable style={{ ...cellStyle, width: '60px', textAlign: 'center' }} />
              <Column field="titulo" header="Título" sortable body={(rowData) => textTemplate(rowData, 'titulo')} style={{ ...cellStyle, minWidth: '220px', maxWidth: '300px', fontWeight: '500' }} />
              <Column field="tipo" header="Tipo" sortable body={(rowData) => textTemplate(rowData, 'tipo')} style={{ ...cellStyle, minWidth: '100px', maxWidth: '120px' }} />
              <Column field="pais" header="País" sortable body={(rowData) => textTemplate(rowData, 'pais')} style={{ ...cellStyle, minWidth: '100px', maxWidth: '130px' }} />
              <Column field="uva" header="Uva" sortable body={(rowData) => textTemplate(rowData, 'uva')} style={{ ...cellStyle, minWidth: '180px', maxWidth: '250px' }} />
              <Column header="Rótulo" body={imageButtonTemplate} style={{ ...cellStyle, minWidth: '140px', textAlign: 'center' }}/>
              <Column field="preco_medio" header="Preço Médio" body={priceTemplate} sortable style={{ ...cellStyle, minWidth: '110px' }}/>
              <Column header="Ações" body={actionTemplate} style={{ ...cellStyle, minWidth: '180px', textAlign: 'center' }} />
            </DataTable>
          </div>
        </Card>
      </motion.div>

      {/* 🔥 LIGHTBOX MANUAL: Cobre a tela toda, clica e fecha */}
      {lightboxOpen && (
        <div 
          onClick={() => setLightboxOpen(false)} // FECHA AO CLICAR EM QUALQUER LUGAR
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999, // Fica na frente de tudo
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedImage}
            alt="Visualização do rótulo"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '8px',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      )}
    </>
  );
};

export default AdminPage;