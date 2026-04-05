import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, Plus, Trash2, ArrowLeft, Save, Info } from 'lucide-react';
import { getSavedTool, saveToolDraft, removeToolDraft } from '../utils/storage';

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

const DEFAULT_AMBIENTES = [{ tipo: 'quarto', comprimento: '', largura: '', altura: '2.8' }];

export default function CalcMateriais() {
  const navigate = useNavigate();
  const [ambientes, setAmbientes] = useState(() => getSavedTool('materiais')?.ambientes || DEFAULT_AMBIENTES);

  const addAmbiente = () => {
    setAmbientes(prev => [...prev, { tipo: 'sala', comprimento: '', largura: '', altura: '2.8' }]);
  };

  const removeAmbienteItem = (idx) => {
    if (ambientes.length === 1) return;
    setAmbientes(prev => prev.filter((_, index) => index !== idx));
  };

  const updateAmbiente = (idx, field, value) => {
    setAmbientes(prev => prev.map((item, index) => index === idx ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    for (const ambiente of ambientes) {
      if (!ambiente.comprimento || !ambiente.largura) {
        toast.error('Preencha as dimensões de todos os ambientes antes de salvar.');
        return;
      }
    }

    saveToolDraft('materiais', { ambientes });
    toast.success('Ferramenta salva! Volte para a tela principal e clique em Gerar para montar o relatório.');
  };

  const handleClear = () => {
    removeToolDraft('materiais');
    setAmbientes(DEFAULT_AMBIENTES);
    toast.success('Rascunho da calculadora de materiais removido.');
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(74,127,165,0.1)', border: '1px solid rgba(74,127,165,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a7fa5' }}>
          <Package size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Calculadora de materiais</h1>
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Salve os ambientes e gere depois os quantitativos mínimos na tela principal.</p>
        </div>
      </div>

      <div className="notice-box" style={{ marginBottom: '20px' }}>
        <Info size={16} />
        <span>O salvamento não consome créditos. O consumo acontece apenas quando você gerar o relatório consolidado.</span>
      </div>

      {ambientes.map((ambiente, idx) => (
        <div key={idx} className="card" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#6ba3cc', fontWeight: '600', fontSize: '0.9rem' }}>Ambiente {idx + 1}</span>
            {ambientes.length > 1 && (
              <button onClick={() => removeAmbienteItem(idx)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Tipo de ambiente</label>
              <select className="input-field" value={ambiente.tipo} onChange={e => updateAmbiente(idx, 'tipo', e.target.value)}>
                {TIPOS_AMBIENTE.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Comprimento (m)</label>
              <input type="number" className="input-field" placeholder="Ex: 4.5" value={ambiente.comprimento} onChange={e => updateAmbiente(idx, 'comprimento', e.target.value)} min="0.5" step="0.1" />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Largura (m)</label>
              <input type="number" className="input-field" placeholder="Ex: 3.2" value={ambiente.largura} onChange={e => updateAmbiente(idx, 'largura', e.target.value)} min="0.5" step="0.1" />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Pé-direito (m)</label>
              <input type="number" className="input-field" placeholder="2.8" value={ambiente.altura} onChange={e => updateAmbiente(idx, 'altura', e.target.value)} min="2" step="0.1" />
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={addAmbiente} className="btn-secondary">
          <Plus size={14} /> Adicionar ambiente
        </button>
        <button onClick={handleSave} className="btn-primary">
          <Save size={14} /> Salvar ferramenta
        </button>
        <button onClick={handleClear} className="btn-secondary">
          <Trash2 size={14} /> Limpar salvo
        </button>
      </div>
    </div>
  );
}
