import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plug, ArrowLeft, Save, Trash2, Info } from 'lucide-react';
import { getSavedTool, saveToolDraft, removeToolDraft } from '../utils/storage';

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

export default function CalcTomadas() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => getSavedTool('tomadas') || DEFAULT_FORM);

  const preview = useMemo(() => {
    const comprimento = Number(form.comprimento || 0);
    const largura = Number(form.largura || 0);
    if (!comprimento || !largura) return null;

    const area = comprimento * largura;
    const perimetro = 2 * (comprimento + largura);
    return {
      area: area.toFixed(2),
      perimetro: perimetro.toFixed(2)
    };
  }, [form]);

  const handleSave = () => {
    if (!form.comprimento || !form.largura) {
      toast.error('Informe as dimensões do ambiente antes de salvar.');
      return;
    }

    saveToolDraft('tomadas', form);
    toast.success('Ferramenta salva! Volte para a tela principal e clique em Gerar para calcular os resultados.');
  };

  const handleClear = () => {
    removeToolDraft('tomadas');
    setForm(DEFAULT_FORM);
    toast.success('Rascunho da ferramenta removido.');
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(107,163,204,0.1)', border: '1px solid rgba(107,163,204,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ba3cc' }}>
          <Plug size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Dimensionamento de tomadas</h1>
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Salve os dados agora e gere o cálculo consolidado depois, na tela principal.</p>
        </div>
      </div>

      <div className="card">
        <div className="notice-box" style={{ marginBottom: '20px' }}>
          <Info size={16} />
          <span>Salvar esta ferramenta não consome crédito. O consumo acontece somente quando você clicar em <strong>Gerar</strong> no dashboard.</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tipo de ambiente</label>
            <select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              {TIPOS.map(item => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Comprimento (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 5" value={form.comprimento} onChange={e => setForm({ ...form, comprimento: e.target.value })} min="0.5" step="0.1" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Largura (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 3" value={form.largura} onChange={e => setForm({ ...form, largura: e.target.value })} min="0.5" step="0.1" />
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
