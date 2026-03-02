import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PlansModal from '../components/PlansModal';
import {
  Package, Plug, Zap, Cable, BookOpen, Lightbulb,
  ChevronRight, Infinity
} from 'lucide-react';

const TOOLS = [
  {
    id: 'materiais',
    icon: <Package size={28} />,
    nome: 'Calculadora de Materiais',
    descricao: 'Calcule todos os materiais elétricos da residência por ambiente',
    cor: '#4a7fa5',
    rota: '/calculos/materiais',
    tag: 'NBR 5410'
  },
  {
    id: 'tomadas',
    icon: <Plug size={28} />,
    nome: 'Dimensionamento de Tomadas',
    descricao: 'Quantidade mínima de tomadas TUG/TUE por ambiente conforme norma',
    cor: '#6ba3cc',
    rota: '/calculos/tomadas',
    tag: 'NBR 5410'
  },
  {
    id: 'padrao',
    icon: <Zap size={28} />,
    nome: 'Padrão de Entrada',
    descricao: 'Calcule o padrão de fornecimento: monofásico, bifásico ou trifásico',
    cor: '#e0a852',
    rota: '/calculos/padrao',
    tag: 'Cálculo'
  },
  {
    id: 'condutores',
    icon: <Cable size={28} />,
    nome: 'Dimensionamento de Condutores',
    descricao: 'Descubra a bitola correta dos fios para cada circuito',
    cor: '#7eb87e',
    rota: '/calculos/condutores',
    tag: 'ABNT'
  },
  {
    id: 'dicionario',
    icon: <BookOpen size={28} />,
    nome: 'Dicionário Técnico',
    descricao: 'Glossário completo de termos elétricos com mais de 25 definições',
    cor: '#b87eb8',
    rota: '/calculos/dicionario',
    tag: 'Referência'
  },
  {
    id: 'luminarias',
    icon: <Lightbulb size={28} />,
    nome: 'Tipos de Luminárias',
    descricao: 'Guia de luminárias: características, usos e dicas de instalação',
    cor: '#b8a07e',
    rota: '/calculos/luminarias',
    tag: 'Guia'
  }
];

export default function Dashboard() {
  const { user, credits, ilimitado, plano } = useAuth();
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);

  const logoUrl = import.meta.env.VITE_LOGO_URL || 'https://www.genspark.ai/api/files/s/vSPekgD2';

  const handleToolClick = (tool) => {
    if (!ilimitado && credits <= 0) {
      setShowPlans(true);
      return;
    }
    navigate(tool.rota);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f' }}>
      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0d0f 0%, #111120 50%, #141428 100%)',
        borderBottom: '1px solid #1e1e2e',
        padding: '40px 24px 32px',
        textAlign: 'center',
      }}>
        <img src={logoUrl} alt="Dynamis" style={{ height: '48px', objectFit: 'contain', marginBottom: '16px' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }} />
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
          Instalações Elétricas Residenciais
        </h1>
        <p style={{ color: '#606070', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
          Ferramentas profissionais para cálculos e dimensionamentos elétricos conforme NBR 5410
        </p>

        {/* Credits info */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: ilimitado ? 'rgba(76,175,130,0.08)' : credits === 0 ? 'rgba(224,82,82,0.08)' : 'rgba(74,127,165,0.08)',
          border: `1px solid ${ilimitado ? 'rgba(76,175,130,0.3)' : credits === 0 ? 'rgba(224,82,82,0.3)' : 'rgba(74,127,165,0.3)'}`,
          borderRadius: '30px', padding: '10px 20px', marginTop: '20px'
        }}>
          {ilimitado ? <Infinity size={16} style={{ color: '#4caf82' }} /> : <Zap size={16} style={{ color: credits === 0 ? '#e05252' : '#6ba3cc' }} />}
          <span style={{ color: ilimitado ? '#4caf82' : credits === 0 ? '#e05252' : '#6ba3cc', fontWeight: '600', fontSize: '0.9rem' }}>
            {ilimitado ? 'Plano Ilimitado ativo' : credits === 0 ? '⚠️ Sem créditos — compre um plano' : `${credits} crédito${credits !== 1 ? 's' : ''} disponíve${credits !== 1 ? 'is' : 'l'}`}
          </span>
          {!ilimitado && credits === 0 && (
            <button onClick={() => setShowPlans(true)} style={{
              background: 'linear-gradient(135deg, #2d5f82, #4a7fa5)',
              border: 'none', color: 'white', padding: '6px 14px',
              borderRadius: '16px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
            }}>
              Ver planos
            </button>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ color: '#606070', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' }}>
          Ferramentas disponíveis
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              style={{
                background: '#141418',
                border: '1px solid #2a2a38',
                borderRadius: '12px',
                padding: '24px',
                cursor: !ilimitado && credits <= 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                opacity: !ilimitado && credits <= 0 ? 0.6 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                if (ilimitado || credits > 0) {
                  e.currentTarget.style.borderColor = tool.cor;
                  e.currentTarget.style.background = '#1a1a22';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2a2a38';
                e.currentTarget.style.background = '#141418';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, transparent, ${tool.cor}, transparent)`,
                opacity: 0.6
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '52px', height: '52px',
                  background: `${tool.cor}18`,
                  border: `1px solid ${tool.cor}30`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: tool.cor, flexShrink: 0
                }}>
                  {tool.icon}
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: '600',
                  color: tool.cor,
                  background: `${tool.cor}15`,
                  border: `1px solid ${tool.cor}30`,
                  padding: '3px 8px', borderRadius: '10px'
                }}>
                  {tool.tag}
                </span>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: '#e8e8f0' }}>
                {tool.nome}
              </h3>
              <p style={{ color: '#606070', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '16px' }}>
                {tool.descricao}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: tool.cor, fontSize: '0.85rem', fontWeight: '600' }}>
                <span>Usar ferramenta</span>
                <ChevronRight size={14} />
                {!ilimitado && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4a7fa5', background: 'rgba(74,127,165,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                  1 crédito
                </span>}
              </div>
            </div>
          ))}
        </div>

        {/* Info bar */}
        <div style={{
          marginTop: '40px', padding: '16px 20px',
          background: 'rgba(74,127,165,0.05)',
          border: '1px solid rgba(74,127,165,0.15)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <Zap size={16} style={{ color: '#4a7fa5', flexShrink: 0 }} />
          <p style={{ color: '#606070', fontSize: '0.85rem' }}>
            Cada ferramenta consome <strong style={{ color: '#6ba3cc' }}>1 crédito</strong> por uso.
            Plano ilimitado: uso sem restrições.
          </p>
          {!ilimitado && (
            <button onClick={() => setShowPlans(true)} style={{
              marginLeft: 'auto', background: 'transparent',
              border: '1px solid #4a7fa5', color: '#6ba3cc',
              padding: '6px 14px', borderRadius: '8px',
              fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap'
            }}>
              Ver planos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
