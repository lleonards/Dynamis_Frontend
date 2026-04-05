import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Cable, ArrowLeft, Save, Trash2, Info } from 'lucide-react';
import { getSavedTool, saveToolDraft, removeToolDraft } from '../utils/storage';

const DEFAULT_FORM = { corrente: '', tipo_circuito: 'terminal', comprimento: '', tensao: '127' };

export default function CalcCondutores() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => getSavedTool('condutores') || DEFAULT_FORM);

  const handleSave = () => {
    if (!form.corrente || !form.comprimento) {
      toast.error('Preencha corrente e comprimento antes de salvar.');
      return;
    }

    saveToolDraft('condutores', form);
    toast.success('Ferramenta salva! Volte à tela principal e clique em Gerar para calcular o resultado.');
  };

  const handleClear = () => {
    removeToolDraft('condutores');
    setForm(DEFAULT_FORM);
    toast.success('Rascunho do dimensionamento de condutores removido.');
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(126,184,126,0.1)', border: '1px solid rgba(126,184,126,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7eb87e' }}>
          <Cable size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Dimensionamento de condutores</h1>
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Salve os dados do circuito e gere o resultado consolidado depois.</p>
        </div>
      </div>

      <div className="card">
        <div className="notice-box" style={{ marginBottom: '20px' }}>
          <Info size={16} />
          <span>Você pode preencher e salvar quantas ferramentas quiser. O crédito será consumido apenas na geração do relatório final.</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Corrente (A)</label>
            <input type="number" className="input-field" placeholder="Ex: 20" value={form.corrente} onChange={e => setForm({ ...form, corrente: e.target.value })} min="1" step="0.1" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Comprimento do circuito (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 15" value={form.comprimento} onChange={e => setForm({ ...form, comprimento: e.target.value })} min="1" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tensão (V)</label>
            <select className="input-field" value={form.tensao} onChange={e => setForm({ ...form, tensao: e.target.value })}>
              <option value="127">127 V</option>
              <option value="220">220 V</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tipo de circuito</label>
            <select className="input-field" value={form.tipo_circuito} onChange={e => setForm({ ...form, tipo_circuito: e.target.value })}>
              <option value="terminal">Terminal</option>
              <option value="alimentacao">Alimentação</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={handleSave} className="btn-primary">
            <Save size={14} /> Salvar ferramenta
          </button>
          <button onClick={handleClear} className="btn-secondary">
            <Trash2 size={14} /> Limpar salvo
          </button>
        </div>
      </div>
    </div>
  );
}
