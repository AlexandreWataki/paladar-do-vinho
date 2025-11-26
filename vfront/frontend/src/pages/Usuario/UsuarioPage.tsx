import React, { useEffect, useRef, useState } from "react";
import { DataTable, DataTableRowEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";

import { fetchWines } from "../../api/wines";
import "./UsuarioPage.css";

interface Wine {
  id?: number;
  titulo?: string;   // alguns endpoints podem retornar "titulo"
  nome?: string;     // fallback caso venha "nome"
  tipo?: string;
  pais?: string;
  uva?: string;
  preco_medio?: number;
  harmonizacao?: string;
  nivel_docura?: number;
  nivel_tanino?: number;
  nivel_acidez?: number;
  nivel_frutado?: number;
  ocasiao?: number;
}

const UsuarioPage: React.FC = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWines();
        setWines(data || []);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os vinhos.");
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao carregar vinhos.",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openDetails = (wine: Wine) => {
    setSelectedWine(wine);
    setDialogVisible(true);
  };

  const header = (
    <div className="usuario-table-header">
      <h3 className="usuario-title">Vinhos Disponíveis</h3>
      <span className="p-input-icon-left usuario-search">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar por título, uva, país..."
        />
      </span>
    </div>
  );

  const nameBody = (row: Wine) => (
    <div className="cell-title" title={row.titulo || row.nome}>
      {row.titulo || row.nome}
    </div>
  );

  const tipoBody = (row: Wine) => (
    <Tag value={row.tipo || "—"} />
  );

  const precoBody = (row: Wine) => {
    const v = row.preco_medio ?? null;
    return v !== null ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
  };

  const intensBody = (row: Wine, key: keyof Wine, max = 5) => {
    const val = (row[key] as number) ?? 0;
    if (!val) return <span>—</span>;
    return (
      <div className="meter" role="meter" aria-valuemin={1} aria-valuemax={max} aria-valuenow={val}>
        <div className="meter-bar" style={{ width: `${(val / max) * 100}%` }} />
        <span className="meter-val">{val}/{max}</span>
      </div>
    );
  };

  const emptyMessage = loading
    ? "Carregando vinhos..."
    : (error ? "Erro ao carregar." : "Nenhum vinho encontrado.");

  const onRowDoubleClick = (e: DataTableRowEvent) => {
    openDetails(e.data as Wine);
  };

  // filtro simples na memória (global)
  const filtered = wines.filter((w) => {
    if (!globalFilter.trim()) return true;
    const q = globalFilter.toLowerCase();
    const s = [
      w.titulo, w.nome, w.tipo, w.pais, w.uva, w.harmonizacao
    ].map(v => (v || "").toString().toLowerCase()).join(" ");
    return s.includes(q);
  });

  return (
    <div className="admin-page usuario-page">
      <Toast ref={toast} />

      <div className="admin-table usuario-table">
        <DataTable
          value={filtered}
          paginator
          rows={10}
          stripedRows
          dataKey="id"
          responsiveLayout="scroll"
          className="p-datatable-sm"
          header={header}
          emptyMessage={emptyMessage}
          onRowDoubleClick={onRowDoubleClick}
        >
          <Column field="titulo" header="Título" sortable body={nameBody} />
          <Column field="tipo" header="Tipo" body={tipoBody} />
          <Column field="uva" header="Uva" sortable />
          <Column field="pais" header="País" sortable />
          <Column field="preco_medio" header="Preço" body={precoBody} sortable />
          <Column
            field="harmonizacao"
            header="Harmonização"
            body={(r) => r.harmonizacao || "—"}
          />
          <Column
            header="Doçura"
            body={(r) => intensBody(r, "nivel_docura", 5)}
          />
          <Column
            header="Tanino"
            body={(r) => intensBody(r, "nivel_tanino", 5)}
          />
          <Column
            header="Acidez"
            body={(r) => intensBody(r, "nivel_acidez", 5)}
          />
          <Column
            header="Frutado"
            body={(r) => intensBody(r, "nivel_frutado", 5)}
          />
        </DataTable>
      </div>

      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        closable={false}
        dismissableMask
        className="admin-dialog-root"
        contentClassName="admin-dialog-content"
        style={{ width: "44rem", maxWidth: "94vw" }}
      >
        <div className="admin-modal-card">
          <div className="admin-modal-top">
            <h3 className="admin-modal-title">{selectedWine?.titulo || selectedWine?.nome}</h3>
          </div>

          <div className="admin-modal-body usuario-details">
            <div className="details-grid">
              <div><strong>Tipo:</strong> {selectedWine?.tipo || "—"}</div>
              <div><strong>Uva:</strong> {selectedWine?.uva || "—"}</div>
              <div><strong>País:</strong> {selectedWine?.pais || "—"}</div>
              <div><strong>Preço:</strong> {selectedWine?.preco_medio != null
                ? selectedWine!.preco_medio!.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : "—"}</div>
              <div className="grid-span">
                <strong>Harmonização:</strong> {selectedWine?.harmonizacao || "—"}
              </div>
              <div><strong>Doçura:</strong> {selectedWine?.nivel_docura ?? "—"}</div>
              <div><strong>Tanino:</strong> {selectedWine?.nivel_tanino ?? "—"}</div>
              <div><strong>Acidez:</strong> {selectedWine?.nivel_acidez ?? "—"}</div>
              <div><strong>Frutado:</strong> {selectedWine?.nivel_frutado ?? "—"}</div>
              <div><strong>Ocasião:</strong> {selectedWine?.ocasiao ?? "—"}</div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <Button label="Fechar" className="btn-ghost p-button-text" onClick={() => setDialogVisible(false)} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UsuarioPage;
