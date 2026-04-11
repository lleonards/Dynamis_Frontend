import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BookOpen, ArrowLeft, Search } from 'lucide-react';

export default function Dicionario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [termos, setTermos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregado, setCarregado] = useState(false);

  const handleCarregar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/calculos/dicionario');
      setTermos(res.data.resultados || []);
      setCarregado(true);
    } catch (err) {
      toast.error('Erro ao carregar dicionário.');
    } finally {
      setLoading(false);
    }
  };

  const termosFiltrados = busca
    ? termos.filter((t) => t.termo.toLowerCase().includes(busca.toLowerCase()) || t.definicao.toLowerCase().includes(busca.toLowerCase()))
    : termos;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(184,126,184,0.1)', border: '1px solid rgba(184,126,184,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b87eb8' }}>
          <BookOpen size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Dicionário técnico elétrico</h1>
          <p style={{ color: '#606070', fontSize: '0.85rem' }}>Consulta livre com termos técnicos. Não consome créditos.</p>
        </div>
      </div>

      {!carregado ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <BookOpen size={40} style={{ color: '#3a3a50', margin: '0 auto 16px' }} />
          <p style={{ color: '#606070', marginBottom: '20px' }}>Clique para abrir o dicionário técnico completo.</p>
          <button onClick={handleCarregar} className="btn-primary" disabled={loading} style={{ margin: '0 auto' }}>
            {loading ? <span className="loading-spinner" /> : <BookOpen size={14} />}
            {loading ? 'Carregando...' : 'Abrir dicionário'}
          </button>
          <p style={{ color: '#3a3a50', fontSize: '0.78rem', marginTop: '12px' }}>Acesso livre</p>
        </div>
      ) : (
        <div>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#606070' }} />
            <input type="text" className="input-field" placeholder="Buscar termo ou definição..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: '40px' }} />
          </div>
          <p style={{ color: '#606070', fontSize: '0.82rem', marginBottom: '16px' }}>{termosFiltrados.length} termo(s) encontrado(s)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {termosFiltrados.map((t, i) => (
              <div key={i} style={{ background: '#141418', border: '1px solid #2a2a38', borderRadius: '10px', padding: '16px', borderLeft: '3px solid #b87eb8' }}>
                <div style={{ fontWeight: '700', color: '#e8e8f0', marginBottom: '6px', fontSize: '0.95rem' }}>{t.termo}</div>
                <div style={{ color: '#a0a0b0', fontSize: '0.88rem', lineHeight: '1.6' }}>{t.definicao}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
