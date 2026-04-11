import React, { useEffect, useMemo, useState } from 'react';
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

function createAmbiente(tipo = 'quarto') {
  return { nome: '', tipo, comprimento: '', largura: '', altura: '2.8' };
}

function cloneDefault() {
  return [createAmbiente()];
}

function hasMeaningfulData(ambiente = {}) {
  return Boolean(
    ambiente?.nome?.trim() ||
    ambiente?.comprimento ||
    ambiente?.largura ||
    (ambiente?.altura && ambiente.altura !== '2.8') ||
    (ambiente?.tipo && ambiente.tipo !== 'quarto')
  );
}

function sanitizeAmbientes(ambientes = []) {
  return ambientes
    .filter((ambiente) => hasMeaningfulData(ambiente))
    .map((ambiente) => ({
      nome: ambiente.nome?.trim() || '',
      tipo: ambiente.tipo || 'quarto',
      comprimento: ambiente.comprimento,
      largura: ambiente.largura,
      altura: ambiente.altura || '2.8'
    }));
}

function getSavedAmbientesCount(entries = []) {
  return entries.reduce((total, entry) => total + (entry?.data?.ambientes?.length || 0), 0);
}

function buildLabel(ambientes, entries = []) {
  const validos = sanitizeAmbientes(ambientes);
  if (validos.length === 1) {
    const numeroAmbiente = getSavedAmbientesCount(entries) + 1;
    return validos[0].nome || `Ambiente ${numeroAmbiente}`;
  }
  return `Grupo com ${validos.length} ambientes`;
}

export default function CalcMateriais() {
  const navigate = useNavigate();
  const [ambientes, setAmbientes] = useState(cloneDefault());
  const [entries, setEntries] = useState(() => getToolEntries('materiais'));
  const [editingId, setEditingId] = useState(null);

  const refreshEntries = () => setEntries(getToolEntries('materiais'));
  const resetCurrent = () => {
    setAmbientes(cloneDefault());
    setEditingId(null);
  };

  useEffect(() => {
    setAmbientes((prev) => {
      if (!prev.length) return cloneDefault();
      const last = prev[prev.length - 1];
      if (last.comprimento && last.largura) {
        return [...prev, createAmbiente('sala')];
      }
      return prev;
    });
  }, [ambientes]);

  const ambientesPreenchidos = useMemo(() => sanitizeAmbientes(ambientes), [ambientes]);
  const totalAmbientesSalvos = useMemo(() => getSavedAmbientesCount(entries), [entries]);

  const removeAmbienteItem = (idx) => {
    setAmbientes((prev) => {
      const next = prev.filter((_, index) => index !== idx);
      return next.length ? next : cloneDefault();
    });
  };

  const updateAmbiente = (idx, field, value) => {
    setAmbientes((prev) => prev.map((item, index) => index === idx ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    if (!ambientesPreenchidos.length) {
      toast.error('Preencha pelo menos um ambiente antes de salvar.');
      return;
    }

    for (const ambiente of ambientesPreenchidos) {
      if (!ambiente.comprimento || !ambiente.largura) {
        toast.error('Preencha as dimensões de todos os ambientes antes de salvar.');
        return;
      }
    }

    const existingEntry = editingId ? entries.find((item) => item.id === editingId) : null;
    const label = editingId ? (existingEntry?.label || buildLabel(ambientesPreenchidos, entries)) : buildLabel(ambientesPreenchidos, entries);

    saveToolEntry('materiais', { ambientes: ambientesPreenchidos }, label, editingId);
    refreshEntries();
    resetCurrent();
    toast.success(editingId ? 'Ambientes atualizados com sucesso.' : 'Ambientes salvos com sucesso.');
  };

  const handleEdit = (entry) => {
    const ambientesSalvos = entry.data?.ambientes?.length ? entry.data.ambientes : cloneDefault();
    setAmbientes([...ambientesSalvos, createAmbiente('sala')]);
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
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Conforme você preenche um ambiente completo, o próximo ambiente aparece automaticamente para continuar o estudo.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="notice-box" style={{ marginBottom: '20px' }}>
          <Info size={16} />
          <span>O salvamento não consome créditos. Cada crédito é usado somente quando você gerar um projeto com todos os ambientes salvos.</span>
        </div>

        <div className="result-grid" style={{ marginBottom: '20px' }}>
          <div className="result-item"><div className="value">{totalAmbientesSalvos}</div><div className="label">Ambientes salvos</div></div>
          <div className="result-item"><div className="value">{ambientesPreenchidos.length || 1}</div><div className="label">Ambientes no formulário</div></div>
        </div>

        {ambientes.map((ambiente, idx) => {
          const nomeVisual = ambiente.nome?.trim() || `Ambiente ${idx + 1}`;
          return (
            <div key={idx} className="card" style={{ marginBottom: '12px', background: '#141418' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ color: '#6ba3cc', fontWeight: '600', fontSize: '0.95rem' }}>{nomeVisual}</span>
                {ambientes.length > 1 && (
                  <button onClick={() => removeAmbienteItem(idx)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Nome do ambiente</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={`Ambiente ${idx + 1}`}
                    value={ambiente.nome}
                    onChange={(e) => updateAmbiente(idx, 'nome', e.target.value)}
                    maxLength={60}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Tipo de ambiente</label>
                  <select className="input-field" value={ambiente.tipo} onChange={(e) => updateAmbiente(idx, 'tipo', e.target.value)}>
                    {TIPOS_AMBIENTE.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Comprimento (m)</label>
                  <input type="number" className="input-field" placeholder="Ex: 4.5" value={ambiente.comprimento} onChange={(e) => updateAmbiente(idx, 'comprimento', e.target.value)} min="0.5" step="0.1" />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Largura (m)</label>
                  <input type="number" className="input-field" placeholder="Ex: 3.2" value={ambiente.largura} onChange={(e) => updateAmbiente(idx, 'largura', e.target.value)} min="0.5" step="0.1" />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Pé-direito (m)</label>
                  <input type="number" className="input-field" placeholder="2.8" value={ambiente.altura} onChange={(e) => updateAmbiente(idx, 'altura', e.target.value)} min="2" step="0.1" />
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleSave} className="btn-primary">
            <Save size={14} /> {editingId ? 'Atualizar ambientes' : 'Salvar ambientes'}
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
                    <strong style={{ color: '#fff' }}>{entry.label || `Ambientes ${index + 1}`}</strong>
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
                <p style={{ color: '#a0a0b0', lineHeight: 1.6, marginBottom: '8px' }}>
                  Total de ambientes: <strong style={{ color: '#fff' }}>{entry.data?.ambientes?.length || 0}</strong>
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(entry.data?.ambientes || []).map((ambiente, idx) => (
                    <span key={idx} className="badge badge-neutral">
                      {(ambiente.nome?.trim() || `Ambiente ${idx + 1}`)} • {TIPOS_AMBIENTE.find((item) => item.value === ambiente.tipo)?.label || ambiente.tipo} • {ambiente.comprimento}x{ambiente.largura}
                    </span>
                  ))}
                </div>
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
