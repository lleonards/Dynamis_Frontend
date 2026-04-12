import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, Trash2, ArrowLeft, Save, Info, Pencil, Layers3 } from 'lucide-react';
import { clearToolEntries, getToolEntries, removeToolEntry, saveToolEntry } from '../utils/storage';

const TIPOS_AMBIENTE = [
  { value: 'quarto', label: 'Quarto' },
  { value: 'sala', label: 'Sala' },
  { value: 'cozinha', label: 'Cozinha' },
  { value: 'banheiro', label: 'Banheiro' },
  { value: 'lavanderia', label: 'Lavanderia' },
  { value: 'garagem', label: 'Garagem' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'corredor', label: 'Corredor' }
];

const DEFAULT_FORM = { nome: '', tipo: 'quarto', comprimento: '', largura: '', altura: '2.8' };

function normalizeAmbiente(form) {
  return {
    nome: form.nome?.trim() || '',
    tipo: form.tipo || 'quarto',
    comprimento: form.comprimento,
    largura: form.largura,
    altura: form.altura || '2.8'
  };
}

function buildLabel(form, total) {
  const nome = form.nome?.trim();
  if (nome) return nome;
  const tipo = TIPOS_AMBIENTE.find((item) => item.value === form.tipo)?.label || 'Ambiente';
  return `${tipo} ${total + 1}`;
}

export default function CalcMateriais() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [entries, setEntries] = useState(() => getToolEntries('materiais'));
  const [editingId, setEditingId] = useState(null);

  const refreshEntries = () => setEntries(getToolEntries('materiais'));

  const resetCurrent = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const preview = useMemo(() => {
    const comprimento = Number(form.comprimento || 0);
    const largura = Number(form.largura || 0);
    const altura = Number(form.altura || 0);
    if (!comprimento || !largura) return null;

    const area = comprimento * largura;
    const perimetro = 2 * (comprimento + largura);
    const volume = altura ? area * altura : 0;
    return {
      area: area.toFixed(2),
      perimetro: perimetro.toFixed(2),
      volume: volume.toFixed(2)
    };
  }, [form]);

  const handleSave = () => {
    if (!form.comprimento || !form.largura) {
      toast.error('Informe as dimensões do ambiente antes de salvar.');
      return;
    }

    const ambiente = normalizeAmbiente(form);
    const existingEntry = editingId ? entries.find((item) => item.id === editingId) : null;
    const label = editingId
      ? existingEntry?.label || buildLabel(ambiente, entries.length)
      : buildLabel(ambiente, entries.length);

    saveToolEntry('materiais', { ambientes: [ambiente] }, label, editingId);
    refreshEntries();
    resetCurrent();
    toast.success(editingId ? 'Ambiente atualizado com sucesso.' : 'Ambiente salvo com sucesso.');
  };

  const handleEdit = (entry) => {
    const ambienteSalvo = entry.data?.ambientes?.[0] || DEFAULT_FORM;
    setForm({ ...DEFAULT_FORM, ...ambienteSalvo });
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (entryId) => {
    removeToolEntry('materiais', entryId);
    refreshEntries();
    if (editingId === entryId) resetCurrent();
    toast.success('Registro removido.');
  };

  const handleClearAll = () => {
    clearToolEntries('materiais');
    refreshEntries();
    resetCurrent();
    toast.success('Todos os ambientes salvos foram removidos.');
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 24px 110px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(74,127,165,0.1)', border: '1px solid rgba(74,127,165,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a7fa5' }}>
          <Package size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Calculadora de materiais</h1>
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Agora funciona como em dimensionamento de tomadas: você salva um ambiente por vez e o formulário é renovado logo após o salvamento.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="notice-box" style={{ marginBottom: '20px' }}>
          <Info size={16} />
          <span>Salvar não consome créditos. Cada ambiente salvo entra na geração do projeto final depois. Você pode cadastrar quantos ambientes quiser.</span>
        </div>

        <div className="result-grid" style={{ marginBottom: '20px' }}>
          <div className="result-item"><div className="value">{entries.length}</div><div className="label">Ambientes salvos</div></div>
          <div className="result-item"><div className="value">{editingId ? 'Sim' : 'Não'}</div><div className="label">Editando item</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Nome do ambiente</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Suíte casal"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              maxLength={60}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tipo de ambiente</label>
            <select className="input-field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              {TIPOS_AMBIENTE.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Comprimento (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 4.5" value={form.comprimento} onChange={(e) => setForm({ ...form, comprimento: e.target.value })} min="0.5" step="0.1" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Largura (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 3.2" value={form.largura} onChange={(e) => setForm({ ...form, largura: e.target.value })} min="0.5" step="0.1" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Pé-direito (m)</label>
            <input type="number" className="input-field" placeholder="2.8" value={form.altura} onChange={(e) => setForm({ ...form, altura: e.target.value })} min="2" step="0.1" />
          </div>
        </div>

        {preview && (
          <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: '#141418', border: '1px solid #2a2a38' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#a0a0b0', fontSize: '0.9rem' }}>
              <span><strong style={{ color: '#fff' }}>Área:</strong> {preview.area} m²</span>
              <span><strong style={{ color: '#fff' }}>Perímetro:</strong> {preview.perimetro} m</span>
              <span><strong style={{ color: '#fff' }}>Volume:</strong> {preview.volume} m³</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={handleSave} className="btn-primary">
            <Save size={14} /> {editingId ? 'Atualizar ambiente' : 'Salvar ambiente'}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Layers3 size={18} /> Ambientes salvos nesta ferramenta</h2>
          <span className="badge badge-blue">Sem limite</span>
        </div>

        {!entries.length ? (
          <p style={{ color: '#606070' }}>Nenhum ambiente salvo ainda.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {entries.map((entry, index) => {
              const ambiente = entry.data?.ambientes?.[0] || DEFAULT_FORM;
              return (
                <div key={entry.id} style={{ background: '#141418', border: '1px solid #2a2a38', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{entry.label || `Ambiente ${index + 1}`}</strong>
                      <div style={{ color: '#606070', fontSize: '0.8rem', marginTop: '4px' }}>Salvo em {new Date(entry.savedAt).toLocaleString('pt-BR')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleEdit(entry)} className="btn-secondary" style={{ padding: '8px 10px', fontSize: '0.8rem' }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button onClick={() => handleRemove(entry.id)} className="btn-secondary" style={{ padding: '8px 10px', fontSize: '0.8rem' }}>
                        <Trash2 size={13} /> Excluir
                      </button>
                    </div>
                  </div>
                  <p style={{ color: '#a0a0b0', lineHeight: 1.6 }}>
                    Ambiente: <strong style={{ color: '#fff' }}>{ambiente.nome?.trim() || (TIPOS_AMBIENTE.find((item) => item.value === ambiente.tipo)?.label || ambiente.tipo)}</strong>
                    {' '}• Tipo: <strong style={{ color: '#fff' }}>{TIPOS_AMBIENTE.find((item) => item.value === ambiente.tipo)?.label || ambiente.tipo}</strong>
                    {' '}• Dimensões: <strong style={{ color: '#fff' }}>{ambiente.comprimento}m x {ambiente.largura}m x {ambiente.altura || '2.8'}m</strong>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <button onClick={handleClearAll} className="floating-clear-button" type="button">
          <Trash2 size={16} /> Limpar todos
        </button>
      )}
    </div>
  );
}
