// src/pages/Admin/WineForm.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { motion } from 'framer-motion';
import { Divider } from 'primereact/divider';
import { InputTextarea } from 'primereact/inputtextarea';
import type { DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

import { http } from '../../api/http';
import { AxiosError } from 'axios';

interface WineData {
  id?: number;
  titulo: string;
  tipo: string;
  pais: string;
  uva: string;
  preco_medio: number;
  harmonizacao?: string[];
  nivel_docura?: number;
  nivel_tanino?: number;
  nivel_acidez?: number;
  nivel_frutado?: number;
  ocasiao?: number;
  descricao?: string;
  rotulo_url?: string;
}

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
    harmonizacao: [],
    nivel_docura: 3,
    nivel_tanino: 3,
    nivel_acidez: 3,
    nivel_frutado: 3,
    ocasiao: 1,
    descricao: '',
    rotulo_url: '',
  });

  const [loading, setLoading] = useState(false);

  const allWineTypes = [
    { label: 'Tinto', value: 'Tinto' },
    { label: 'Branco', value: 'Branco' },
    { label: 'Rosé', value: 'Rosé' },
    { label: 'Espumante', value: 'Espumante' },
  ];

  const ocasiaoOptions = [
    { label: 'Dia a Dia / Leve', value: 1 },
    { label: 'Social / Encontro', value: 2 },
    { label: 'Especial / Celebração', value: 3 },
  ];

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

  const selectedHarmonizacaoKey =
    Array.isArray(wine.harmonizacao) && wine.harmonizacao.length > 0
      ? wine.harmonizacao[0]
      : 'Sem comida / consumo isolado';

  const filteredTypes =
    harmonizacaoMap[selectedHarmonizacaoKey]
      ?.map((tipo) => allWineTypes.find((t) => t.value === tipo))
      .filter(Boolean) || allWineTypes;

  useEffect(() => {
    if (isEditing) {
      const loadWine = async () => {
        setLoading(true);
        try {
          const response = await http.get(`/admin/vinhos/${id}`);
          const json = response.data;

          let harmonizacaoArray: string[] = [];

          if (json.harmonizacao) {
            if (Array.isArray(json.harmonizacao)) {
              harmonizacaoArray = json.harmonizacao;
            } else {
              harmonizacaoArray = [json.harmonizacao];
            }
          }

          const wineData: WineData = {
            id: json.id,
            titulo: json.titulo,
            tipo: json.tipo,
            pais: json.pais,
            uva: json.uva,
            preco_medio: json.preco_medio,
            harmonizacao: harmonizacaoArray,
            nivel_docura: json.nivel_docura ?? 3,
            nivel_tanino: json.nivel_tanino ?? 3,
            nivel_acidez: json.nivel_acidez ?? 3,
            nivel_frutado: json.nivel_frutado ?? 3,
            ocasiao: json.ocasiao ?? 1,
            descricao: json.descricao ?? '',
            rotulo_url: json.rotulo_url ?? '',
          };

          setWine(wineData);
        } catch (error) {
          const axiosError = error as AxiosError;
          alert('Erro ao carregar dados do vinho.');
          if (axiosError.response?.status === 404) {
            navigate('/admin');
          }
        } finally {
          setLoading(false);
        }
      };
      loadWine();
    }
  }, [id, isEditing, navigate]);

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
      const url = isEditing ? `/admin/vinhos/${id}` : `/admin/vinhos/`;

      const payload = {
        ...wine,
        harmonizacao: Array.isArray(wine.harmonizacao)
          ? wine.harmonizacao.join(', ')
          : wine.harmonizacao,
      };

      await http.request({
        method,
        url,
        data: payload,
      });

      localStorage.removeItem('wine_recommendations');

      alert(isEditing ? '🍷 Vinho atualizado com sucesso!' : '🍇 Vinho cadastrado com sucesso!');
      navigate('/admin');
    } catch (error) {
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
      <Card className="w-full shadow-3 border-round-2xl p-0" style={{ overflow: 'hidden' }}>

        {/* 🔹 Cabeçalho roxo igual ao Painel Admin */}
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
            label="Voltar"
            icon="pi pi-arrow-left"
            onClick={() => navigate('/admin')}
            style={{
              backgroundColor: '#ffffff22',
              border: '1px solid #fff',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
            }}
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
            {isEditing ? 'Editar Vinho' : 'Cadastrar Novo Vinho'}
          </h2>

          {/* espaço para alinhar */}
          <span style={{ width: '90px' }}></span>
        </div>

        {/* Conteúdo do formulário */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="p-fluid formgrid grid">
            {/* SECTION 1 */}
            <div className="col-12">
              <h3 className="text-xl mb-3 mt-0 text-primary">Informações Básicas</h3>
              <div className="grid">
                <div className="field col-12 md:col-6">
                  <label htmlFor="titulo">Título</label>
                  <InputText
                    id="titulo"
                    name="titulo"
                    value={wine.titulo}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label htmlFor="tipo">Tipo</label>
                  <Dropdown
                    id="tipo"
                    value={wine.tipo}
                    onChange={(e: DropdownChangeEvent) =>
                      setWine({ ...wine, tipo: e.value })
                    }
                    options={filteredTypes}
                    placeholder="Selecione o tipo de vinho"
                    appendTo={document.body}
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label htmlFor="pais">País</label>
                  <InputText
                    id="pais"
                    name="pais"
                    value={wine.pais}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label htmlFor="uva">Uva</label>
                  <InputText
                    id="uva"
                    name="uva"
                    value={wine.uva}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="field col-12">
                  <label htmlFor="rotulo_url">URL do Rótulo</label>
                  <InputText
                    id="rotulo_url"
                    name="rotulo_url"
                    value={wine.rotulo_url || ''}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* SECTION 2 */}
            <div className="col-12">
              <h3 className="text-xl mb-3 text-primary">Perfil de Sabor e Características</h3>
              <div className="grid">
                <div className="field col-12 md:col-4">
                  <label htmlFor="preco_medio">Preço Médio (R$)</label>
                  <InputNumber
                    id="preco_medio"
                    name="preco_medio"
                    value={wine.preco_medio}
                    onValueChange={(e) =>
                      handleNumberChange('preco_medio', e.value ?? 0)
                    }
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
                    onChange={(e: DropdownChangeEvent) =>
                      handleNumberChange('nivel_docura', e.value)
                    }
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
                    onChange={(e: DropdownChangeEvent) =>
                      handleNumberChange('nivel_tanino', e.value)
                    }
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
                    onChange={(e: DropdownChangeEvent) =>
                      handleNumberChange('nivel_acidez', e.value)
                    }
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
                    onChange={(e: DropdownChangeEvent) =>
                      handleNumberChange('nivel_frutado', e.value)
                    }
                    placeholder="Nível de Frutado"
                    appendTo={document.body}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* SECTION 3 */}
            <div className="col-12">
              <h3 className="text-xl mb-3 text-primary">Contexto de Uso e Detalhes</h3>
              <div className="grid">
                <div className="field col-12 md:col-6">
                  <label htmlFor="ocasiao">Ocasião</label>
                  <Dropdown
                    id="ocasiao"
                    value={wine.ocasiao ?? 1}
                    options={ocasiaoOptions}
                    onChange={(e: DropdownChangeEvent) =>
                      handleNumberChange('ocasiao', e.value)
                    }
                    placeholder="Selecione uma ocasião"
                    appendTo={document.body}
                    className="w-full"
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label htmlFor="harmonizacao">Harmonização</label>
                  <MultiSelect
                    id="harmonizacao"
                    value={wine.harmonizacao || []}
                    options={harmonizacaoOptions}
                    onChange={(e) =>
                      setWine({
                        ...wine,
                        harmonizacao: e.value,
                      })
                    }
                    placeholder="Selecione o(s) tipo(s) de harmonização"
                    display="chip"
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

            {/* BOTÕES */}
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
        </div>
      </Card>
    </motion.div>
  );
};

export default WineForm;
