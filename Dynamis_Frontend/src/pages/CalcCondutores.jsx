import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Cable, ArrowLeft, Save, Trash2, Info, Pencil, Layers3 } from 'lucide-react';
import { clearToolEntries, getToolEntries, removeToolEntry, saveToolEntry } from '../utils/storage';

const DEFAULT_FORM = { corrente: '', tipo_circuito: 'terminal', comprimento: '', tensao: '127' };

function buildLabel(form, total) {
  return `Circuito ${form.corrente || total + 1}A`;
}

export default function CalcCondutores() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [entries, setEntries] = useState(() => getToolEntries('condutores'));
  const [editingId, setEditingId] = useState(null);

  const refreshEntries = () => setEntries(getToolEntries('condutores'));
  const resetCurrent = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.corrente || !form.comprimento) {
      toast.error('Preencha corrente e comprimento antes de salvar.');
      return;
    }

    const label = editingId ? entries.find((item) => item.id === editingId)?.label || buildLabel(form, entries.length) : buildLabel(form, entries.length);
    saveToolEntry('condutores', form, label, editingId);
    refreshEntries();
    resetCurrent();
    toast.success(editingId ? 'Registro atualizado com sucesso.' : 'Novo registro salvo na ferramenta.');
  };

  const handleEdit = (entry) => {
    setForm(entry.data);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (entryId) => {
    removeToolEntry('condutores', entryId);
    refreshEntries();
    if (editingId === entryId) resetCurrent();
    toast.success('Registro removido.');
  };

  const handleClearAll = () => {
    clearToolEntries('condutores');
    refreshEntries();
    resetCurrent();
    toast.success('Todos os registros de condutores foram removidos.');
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 24px 110px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(126,184,126,0.1)', border: '1px solid rgba(126,184,126,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7eb87e' }}>
          <Cable size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Dimensionamento de condutores</h1>
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Sem limite de registros. Salve vários circuitos e gere todos de uma vez depois.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="notice-box" style={{ marginBottom: '20px' }}>
          <Info size={16} />
          <span>Você pode preencher e salvar quantos circuitos quiser. O crédito será consumido apenas na geração do projeto final.</span>
        </div>

        <div className="result-grid" style={{ marginBottom: '20px' }}>
          <div className="result-item"><div className="value">{entries.length}</div><div className="label">Registros salvos</div></div>
          <div className="result-item"><div className="value">{editingId ? 'Sim' : 'Não'}</div><div className="label">Editando item</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Corrente (A)</label>
            <input type="number" className="input-field" placeholder="Ex: 20" value={form.corrente} onChange={(e) => setForm({ ...form, corrente: e.target.value })} min="1" step="0.1" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Comprimento do circuito (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 15" value={form.comprimento} onChange={(e) => setForm({ ...form, comprimento: e.target.value })} min="1" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tensão (V)</label>
            <select className="input-field" value={form.tensao} onChange={(e) => setForm({ ...form, tensao: e.target.value })}>
              <option value="127">127 V</option>
              <option value="220">220 V</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tipo de circuito</label>
            <select className="input-field" value={form.tipo_circuito} onChange={(e) => setForm({ ...form, tipo_circuito: e.target.value })}>
              <option value="terminal">Terminal</option>
              <option value="alimentacao">Alimentação</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={handleSave} className="btn-primary">
            <Save size={14} /> {editingId ? 'Atualizar registro' : 'Salvar registro'}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Layers3 size={18} /> Registros salvos nesta ferramenta</h2>
          <span className="badge badge-blue">Sem limite</span>
        </div>

        {!entries.length ? (
          <p style={{ color: '#606070' }}>Nenhum registro salvo ainda.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {entries.map((entry, index) => (
              <div key={entry.id} style={{ background: '#141418', border: '1px solid #2a2a38', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{entry.label || `Registro ${index + 1}`}</strong>
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
                  Corrente: <strong style={{ color: '#fff' }}>{entry.data.corrente} A</strong> • Comprimento: <strong style={{ color: '#fff' }}>{entry.data.comprimento} m</strong> • Tensão: <strong style={{ color: '#fff' }}>{entry.data.tensao} V</strong> • Tipo: <strong style={{ color: '#fff' }}>{entry.data.tipo_circuito}</strong>
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
