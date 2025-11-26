import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { fetchWines, createWine, updateWine, deleteWine } from "../../api/adminWines";
import AdminHeader from "../../components/AdminHeader";
import "./AdminPage.css";

interface Wine {
  id?: number;
  titulo: string;
  tipo: string;
  pais: string;
  uva: string;
  preco_medio: number;
  harmonizacao: string;
  nivel_docura: number;
  nivel_tanino: number;
  nivel_acidez: number;
  nivel_frutado: number;
  ocasiao: number;
}

const AdminPage: React.FC = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      const data = await fetchWines();
      setWines(data);
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao carregar vinhos.",
      });
    }
  };

  const openDialog = (wine?: Wine) => {
    if (wine) {
      setSelectedWine(wine);
      setIsEditing(true);
    } else {
      setSelectedWine({
        titulo: "",
        tipo: "",
        pais: "",
        uva: "",
        preco_medio: 0,
        harmonizacao: "",
        nivel_docura: 3,
        nivel_tanino: 3,
        nivel_acidez: 3,
        nivel_frutado: 3,
        ocasiao: 2,
      });
      setIsEditing(false);
    }
    setVisible(true);
  };

  const saveWine = async () => {
    if (!selectedWine) return;
    try {
      if (isEditing && selectedWine.id) {
        await updateWine(selectedWine.id, selectedWine);
        toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Vinho atualizado!" });
      } else {
        await createWine(selectedWine);
        toast.current?.show({ severity: "success", summary: "Sucesso", detail: "Vinho adicionado!" });
      }
      setVisible(false);
      await loadWines();
    } catch {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao salvar vinho." });
    }
  };

  const removeWine = async (wine: Wine) => {
    if (!wine.id) return;
    if (window.confirm(`Deseja excluir o vinho "${wine.titulo}"?`)) {
      try {
        await deleteWine(wine.id);
        toast.current?.show({ severity: "info", summary: "Removido", detail: "Vinho excluído." });
        await loadWines();
      } catch {
        toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao excluir vinho." });
      }
    }
  };

  const actionBodyTemplate = (wine: Wine) => (
    <div className="action-buttons">
      <Button label="Alterar" className="p-button-sm p-button-warning" onClick={() => openDialog(wine)} />
      <Button label="Excluir" className="p-button-sm p-button-danger" onClick={() => removeWine(wine)} />
    </div>
  );

  return (
    <div className="admin-page">
      <Toast ref={toast} />

      {/* topo igual ao padrão de "Recomendações" */}
      <AdminHeader onAddWine={() => openDialog()} />

      {/* planilha em cartão vidro */}
      <div className="admin-table">
        <DataTable
          value={wines}
          paginator
          rows={10}
          stripedRows
          dataKey="id"
          responsiveLayout="scroll"
          className="p-datatable-sm"
        >
          <Column field="titulo" header="Título" sortable />
          <Column field="tipo" header="Tipo" />
          <Column field="pais" header="País" />
          <Column field="uva" header="Uva" />
          <Column field="preco_medio" header="Preço (R$)" />
          <Column field="harmonizacao" header="Harmonização" />
          <Column header="Ações" body={actionBodyTemplate} />
        </DataTable>
      </div>

      {/* Modal no padrão do Questionary: sem header do Dialog, com card interno e botões "Salvar" e "Voltar" */}
      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        closable={false}
        dismissableMask
        className="admin-dialog-root"
        contentClassName="admin-dialog-content"
        style={{ width: "44rem", maxWidth: "94vw" }}
      >
        <div className="admin-modal-card">
          <div className="admin-modal-top">
            <h3 className="admin-modal-title">
              {isEditing ? "Editar Vinho" : "Novo Vinho"}
            </h3>
            
          </div>

          <div className="admin-modal-body">
            <div className="admin-grid-2">
              <label className="q-field">
                <span className="q-label">Título</span>
                <InputText
                  className="q-input"
                  value={selectedWine?.titulo || ""}
                  onChange={(e) => setSelectedWine({ ...selectedWine!, titulo: e.target.value })}
                />
              </label>

              <label className="q-field">
                <span className="q-label">Tipo (tinto, branco, rosé...)</span>
                <InputText
                  className="q-input"
                  value={selectedWine?.tipo || ""}
                  onChange={(e) => setSelectedWine({ ...selectedWine!, tipo: e.target.value })}
                />
              </label>

              <label className="q-field">
                <span className="q-label">País</span>
                <InputText
                  className="q-input"
                  value={selectedWine?.pais || ""}
                  onChange={(e) => setSelectedWine({ ...selectedWine!, pais: e.target.value })}
                />
              </label>

              <label className="q-field">
                <span className="q-label">Uva</span>
                <InputText
                  className="q-input"
                  value={selectedWine?.uva || ""}
                  onChange={(e) => setSelectedWine({ ...selectedWine!, uva: e.target.value })}
                />
              </label>

              <label className="q-field">
                <span className="q-label">Preço (R$)</span>
                <InputNumber
                  className="q-input"
                  value={selectedWine?.preco_medio ?? 0}
                  onValueChange={(e) => setSelectedWine({ ...selectedWine!, preco_medio: e.value ?? 0 })}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                />
              </label>

              <label className="q-field">
                <span className="q-label">Harmonização</span>
                <InputText
                  className="q-input"
                  value={selectedWine?.harmonizacao || ""}
                  onChange={(e) => setSelectedWine({ ...selectedWine!, harmonizacao: e.target.value })}
                />
              </label>
            </div>

            {/* sliders no mesmo estilo do Questionary */}
            <div className="slider-grid">
              {[
                { key: "nivel_docura", label: "Doçura", max: 5 },
                { key: "nivel_tanino", label: "Tanino", max: 5 },
                { key: "nivel_acidez", label: "Acidez", max: 5 },
                { key: "nivel_frutado", label: "Frutado", max: 5 },
                { key: "ocasiao", label: "Ocasião", max: 3 },
              ].map(({ key, label, max }) => {
                const k = key as keyof Wine;
                const val = (selectedWine?.[k] as number) ?? (k === "ocasiao" ? 2 : 3);
                return (
                  <label className="q-field" key={key}>
                    <span className="q-label">{label}: <strong>{val}</strong></span>
                    <div className="q-range-wrap">
                      <input
                        className="q-range"
                        type="range"
                        min={1}
                        max={max}
                        value={val}
                        onChange={(e) =>
                          setSelectedWine({ ...selectedWine!, [k]: parseInt(e.target.value, 10) } as Wine)
                        }
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* repetimos os botões no rodapé para usabilidade */}
          <div className="admin-modal-footer">
            <button className="btn-neon admin-btn" onClick={saveWine}>Salvar</button>
            <button className="btn-ghost" onClick={() => setVisible(false)}>Voltar</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminPage;
