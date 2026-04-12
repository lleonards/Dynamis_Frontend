import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plug, ArrowLeft, Save, Trash2, Info, Pencil, Layers3 } from 'lucide-react';
import { clearToolEntries, getToolEntries, removeToolEntry, saveToolEntry } from '../utils/storage';

const TIPOS = [
  { value: 'quarto', label: 'Quarto' },
  { value: 'sala', label: 'Sala de estar' },
  { value: 'cozinha', label: 'Cozinha' },
  { value: 'banheiro', label: 'Banheiro' },
  { value: 'lavanderia', label: 'Lavanderia' },
  { value: 'garagem', label: 'Garagem' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'corredor', label: 'Corredor' }
];

const DEFAULT_FORM = { tipo: 'quarto', comprimento: '', largura: '' };

function buildLabel(form, total) {
  const tipo = TIPOS.find((item) => item.value === form.tipo)?.label || 'Ambiente';
  return `${tipo} ${total + 1}`;
}

export default function CalcTomadas() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [entries, setEntries] = useState(() => getToolEntries('tomadas'));
  const [editingId, setEditingId] = useState(null);

  const preview = useMemo(() => {
    const comprimento = Number(form.comprimento || 0);
    const largura = Number(form.largura || 0);
    if (!comprimento || !largura) return null;

    const area = comprimento * largura;
    const perimetro = 2 * (comprimento + largura);
    return { area: area.toFixed(2), perimetro: perimetro.toFixed(2) };
  }, [form]);

  const resetCurrent = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const refreshEntries = () => setEntries(getToolEntries('tomadas'));

  const handleSave = () => {
    if (!form.comprimento || !form.largura) {
      toast.error('Informe as dimensões do ambiente antes de salvar.');
      return;
    }

    const label = editingId ? entries.find((item) => item.id === editingId)?.label || buildLabel(form, entries.length) : buildLabel(form, entries.length);
    saveToolEntry('tomadas', form, label, editingId);
    refreshEntries();
    resetCurrent();
    toast.success(editingId ? 'Ambiente atualizado com sucesso.' : 'Ambiente salvo com sucesso.');
  };

  const handleEdit = (entry) => {
    setForm(entry.data);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (entryId) => {
    removeToolEntry('tomadas', entryId);
    refreshEntries();
    if (editingId === entryId) resetCurrent();
    toast.success('Registro removido.');
  };

  const handleClearAll = () => {
    clearToolEntries('tomadas');
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
        <div style={{ width: '44px', height: '44px', background: 'rgba(107,163,204,0.1)', border: '1px solid rgba(107,163,204,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ba3cc' }}>
          <Plug size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Dimensionamento de tomadas</h1>
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Você pode salvar quantos ambientes quiser. Cada item salvo será calculado depois no projeto final.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="notice-box" style={{ marginBottom: '20px' }}>
          <Info size={16} />
          <span>Salvar não consome crédito. O consumo acontece apenas ao gerar o projeto na tela inicial. Esta ferramenta está sem limite de ambientes.</span>
        </div>

        <div className="result-grid" style={{ marginBottom: '20px' }}>
          <div className="result-item"><div className="value">{entries.length}</div><div className="label">Ambientes salvos</div></div>
          <div className="result-item"><div className="value">{editingId ? 'Sim' : 'Não'}</div><div className="label">Editando item</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tipo de ambiente</label>
            <select className="input-field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              {TIPOS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Comprimento (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 5" value={form.comprimento} onChange={(e) => setForm({ ...form, comprimento: e.target.value })} min="0.5" step="0.1" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Largura (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 3" value={form.largura} onChange={(e) => setForm({ ...form, largura: e.target.value })} min="0.5" step="0.1" />
          </div>
        </div>

        {preview && (
          <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: '#141418', border: '1px solid #2a2a38' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#a0a0b0', fontSize: '0.9rem' }}>
              <span><strong style={{ color: '#fff' }}>Área:</strong> {preview.area} m²</span>
              <span><strong style={{ color: '#fff' }}>Perímetro:</strong> {preview.perimetro} m</span>
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
            {entries.map((entry, index) => (
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
                  Ambiente: <strong style={{ color: '#fff' }}>{TIPOS.find((item) => item.value === entry.data.tipo)?.label || entry.data.tipo}</strong> • Dimensões: <strong style={{ color: '#fff' }}>{entry.data.comprimento}m x {entry.data.largura}m</strong>
                </p>
              </div>
            ))}
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
