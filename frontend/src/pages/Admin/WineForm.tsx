import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { motion } from 'framer-motion';
import { Divider } from 'primereact/divider'; // 💡 NOVO
import { InputTextarea } from 'primereact/inputtextarea'; // 💡 NOVO
import type { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import type { DropdownChangeEvent } from 'primereact/dropdown';

interface WineData {
  id?: number;
  titulo: string;
  tipo: string;
  pais: string;
  uva: string;
  preco_medio: number;
  harmonizacao?: string;
  nivel_docura?: number;
  nivel_tanino?: number;
  nivel_acidez?: number;
  nivel_frutado?: number;
  ocasiao?: number;
  descricao?: string;
  rotulo_url?: string;
}

// Opções para Dropdowns de Nível (1-5)
const nivelOptions = [
  { label: '1 - Leve', value: 1 },
  { label: '2', value: 2 },
  { label: '3 - Médio', value: 3 },
  { label: '4', value: 4 },
  { label: '5 - Intenso', value: 5 },
];

const WineForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [wine, setWine] = useState<WineData>({
    titulo: '',
    tipo: '',
    pais: '',
    uva: '',
    preco_medio: 0,
    harmonizacao: '',
    nivel_docura: 3,
    nivel_tanino: 3,
    nivel_acidez: 3,
    nivel_frutado: 3,
    ocasiao: 1,
    descricao: '',
    rotulo_url: '',
  });

  const [loading, setLoading] = useState(false);

  // Opções gerais de tipo
  const allWineTypes = [
    { label: 'Tinto', value: 'Tinto' },
    { label: 'Branco', value: 'Branco' },
    { label: 'Rosé', value: 'Rosé' },
    { label: 'Espumante', value: 'Espumante' },
  ];

  // Opções de Ocasião (Baseado no seu código)
  const ocasiaoOptions = [
    { label: 'Casual', value: 1 },
    { label: 'Jantar', value: 2 },
    { label: 'Presente', value: 3 },
    { label: 'Celebração', value: 4 },
  ];

  // Opções de Harmonização (Baseado no seu código)
  const harmonizacaoOptions = [
    { label: 'Carnes Vermelhas', value: 'Carnes Vermelhas' },
    { label: 'Aves e Carnes Brancas', value: 'Aves e Carnes Brancas' },
    { label: 'Peixes e Frutos do Mar', value: 'Peixes e Frutos do Mar' },
    { label: 'Massas e Molhos', value: 'Massas e Molhos' },
    { label: 'Queijos', value: 'Queijos' },
    { label: 'Sobremesas', value: 'Sobremesas' },
    { label: 'Charcutaria (frios e embutidos)', value: 'Charcutaria (frios e embutidos)' },
    { label: 'Sem comida / consumo isolado', value: 'Sem comida / consumo isolado' },
  ];

  // Mapa de harmonização → tipos compatíveis
  const harmonizacaoMap: Record<string, string[]> = {
    'Carnes Vermelhas': ['Tinto'],
    'Aves e Carnes Brancas': ['Branco', 'Rosé'],
    'Peixes e Frutos do Mar': ['Branco', 'Rosé', 'Espumante'],
    'Massas e Molhos': ['Tinto', 'Rosé'],
    'Queijos': ['Tinto', 'Branco'],
    'Sobremesas': ['Branco', 'Espumante'],
    'Charcutaria (frios e embutidos)': ['Tinto', 'Rosé'],
    'Sem comida / consumo isolado': ['Tinto', 'Branco', 'Rosé', 'Espumante'],
  };

  // Filtro dinâmico de tipos conforme harmonização
  const filteredTypes =
    harmonizacaoMap[wine.harmonizacao || 'Sem comida / consumo isolado']
      ?.map((tipo) => allWineTypes.find((t) => t.value === tipo))
      .filter(Boolean) || allWineTypes;

  // Carrega vinho se estiver editando
  useEffect(() => {
    if (isEditing) {
      const loadWine = async () => {
        setLoading(true);
        try {
          // Seu endpoint
          const data = await fetch(`http://127.0.0.1:8000/admin/vinhos/${id}`);
          const json: WineData = await data.json();

          // Ajuste para garantir que os números sejam definidos corretamente
          json.nivel_docura = json.nivel_docura ?? 3;
          json.nivel_tanino = json.nivel_tanino ?? 3;
          json.nivel_acidez = json.nivel_acidez ?? 3;
          json.nivel_frutado = json.nivel_frutado ?? 3;
          json.ocasiao = json.ocasiao ?? 1;

          setWine(json);
        } catch (error) {
          console.error('Erro ao carregar vinho:', error);
          alert('Erro ao carregar dados do vinho.');
        } finally {
          setLoading(false);
        }
      };
      loadWine();
    }
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setWine({ ...wine, [name]: value });
  };

  const handleNumberChange = (name: string, value: number | null) => {
    setWine((prev) => ({ ...prev, [name]: value ?? 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `http://127.0.0.1:8000/admin/vinhos/${id}`
        : `http://127.0.0.1:8000/admin/vinhos/`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(wine),
      });

      if (!response.ok) throw new Error('Erro ao salvar o vinho.');

      alert(isEditing ? '🍷 Vinho atualizado com sucesso!' : '🍇 Vinho cadastrado com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar vinho.');
    }
  };

  return (
    <motion.div
      className="admin-container"
      style={{ overflowY: 'auto', alignItems: 'flex-start' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        title={isEditing ? 'Editar Vinho' : 'Cadastrar Novo Vinho'}
        className="w-full shadow-3 border-round-2xl p-4"
        style={{ overflow: 'visible' }}
      >
        <form onSubmit={handleSubmit} className="p-fluid formgrid grid">
          {/* ====================================================== */}
          {/* 🍷 SEÇÃO 1: INFORMAÇÕES BÁSICAS (2 COLUNAS) */}
          {/* ====================================================== */}
          <div className="col-12">
            <h3 className="text-xl mb-3 mt-0 text-primary">Informações Básicas</h3>
            <div className="grid">
              <div className="field col-12 md:col-6">
                <label htmlFor="titulo">Título</label>
                <InputText id="titulo" name="titulo" value={wine.titulo} onChange={handleChange} required className="w-full" />
              </div>

              {/* Tipo (com filtro de harmonização) */}
              <div className="field col-12 md:col-6">
                <label htmlFor="tipo">Tipo</label>
                <Dropdown
                  id="tipo"
                  value={wine.tipo}
                  onChange={(e: DropdownChangeEvent) => setWine({ ...wine, tipo: e.value })}
                  options={filteredTypes}
                  placeholder="Selecione o tipo de vinho"
                  appendTo={document.body}
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="pais">País</label>
                <InputText id="pais" name="pais" value={wine.pais} onChange={handleChange} required className="w-full" />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="uva">Uva</label>
                <InputText id="uva" name="uva" value={wine.uva} onChange={handleChange} required className="w-full" />
              </div>

              {/* URL do Rótulo */}
              <div className="field col-12">
                <label htmlFor="rotulo_url">URL do Rótulo</label>
                <InputText id="rotulo_url" name="rotulo_url" value={wine.rotulo_url || ''} onChange={handleChange} className="w-full" />
              </div>
            </div>
          </div>

          <Divider />

          {/* ====================================================== */}
          {/* 💰 SEÇÃO 2: PERFIL DE SABOR E PREÇO (3 COLUNAS) */}
          {/* ====================================================== */}
          <div className="col-12">
            <h3 className="text-xl mb-3 text-primary">Perfil de Sabor e Características</h3>
            <div className="grid">
              <div className="field col-12 md:col-4">
                <label htmlFor="preco_medio">Preço Médio (R$)</label>
                <InputNumber
                  id="preco_medio"
                  name="preco_medio"
                  value={wine.preco_medio}
                  onValueChange={(e) => handleNumberChange('preco_medio', e.value ?? 0)}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-4">
                <label htmlFor="nivel_docura">Docura (1–5)</label>
                <Dropdown
                  id="nivel_docura"
                  value={wine.nivel_docura ?? 3}
                  options={nivelOptions}
                  onChange={(e: DropdownChangeEvent) => handleNumberChange('nivel_docura', e.value)}
                  placeholder="Nível de Doçura"
                  appendTo={document.body}
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-4">
                <label htmlFor="nivel_tanino">Tanino (1–5)</label>
                <Dropdown
                  id="nivel_tanino"
                  value={wine.nivel_tanino ?? 3}
                  options={nivelOptions}
                  onChange={(e: DropdownChangeEvent) => handleNumberChange('nivel_tanino', e.value)}
                  placeholder="Nível de Tanino"
                  appendTo={document.body}
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="nivel_acidez">Acidez (1–5)</label>
                <Dropdown
                  id="nivel_acidez"
                  value={wine.nivel_acidez ?? 3}
                  options={nivelOptions}
                  onChange={(e: DropdownChangeEvent) => handleNumberChange('nivel_acidez', e.value)}
                  placeholder="Nível de Acidez"
                  appendTo={document.body}
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="nivel_frutado">Frutado (1–5)</label>
                <Dropdown
                  id="nivel_frutado"
                  value={wine.nivel_frutado ?? 3}
                  options={nivelOptions}
                  onChange={(e: DropdownChangeEvent) => handleNumberChange('nivel_frutado', e.value)}
                  placeholder="Nível de Frutado"
                  appendTo={document.body}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* ====================================================== */}
          {/* 📋 SEÇÃO 3: CONTEXTO E DETALHES */}
          {/* ====================================================== */}
          <div className="col-12">
            <h3 className="text-xl mb-3 text-primary">Contexto de Uso e Detalhes</h3>
            <div className="grid">
              <div className="field col-12 md:col-6">
                <label htmlFor="ocasiao">Ocasião</label>
                <Dropdown
                  id="ocasiao"
                  value={wine.ocasiao ?? 1}
                  options={ocasiaoOptions}
                  onChange={(e: DropdownChangeEvent) => handleNumberChange('ocasiao', e.value)}
                  placeholder="Selecione uma ocasião"
                  appendTo={document.body}
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="harmonizacao">Harmonização</label>
                <Dropdown
                  id="harmonizacao"
                  value={wine.harmonizacao}
                  options={harmonizacaoOptions}
                  onChange={(e: DropdownChangeEvent) => {
                    setWine({ ...wine, harmonizacao: e.value, tipo: '' });
                  }}
                  placeholder="Selecione o tipo de harmonização"
                  appendTo={document.body}
                  className="w-full"
                />
              </div>

              <div className="field col-12">
                <label htmlFor="descricao">Descrição</label>
                <InputTextarea
                  id="descricao"
                  name="descricao"
                  value={wine.descricao || ''}
                  onChange={handleChange}
                  rows={4}
                  autoResize
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO - Tamanho e Alinhamento Corrigidos */}
          <div className="field col-12">
            <div
              className="flex justify-content-end align-items-center"
              style={{ gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}
            >
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text p-button-secondary"
                type="button"
                onClick={() => navigate('/admin')}
                style={{
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontWeight: 500,
                  width: 'auto',
                  minWidth: '120px',
                }}
              />
              <Button
                label={isEditing ? 'Salvar Alterações' : 'Cadastrar Vinho'}
                icon="pi pi-check"
                className="p-button-success"
                type="submit"
                loading={loading}
                style={{
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontWeight: 500,
                  backgroundColor: '#7b1fa2',
                  border: 'none',
                  width: 'auto',
                  minWidth: '160px',
                }}
              />
            </div>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default WineForm;
