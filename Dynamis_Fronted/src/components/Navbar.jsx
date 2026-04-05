import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogOut, Zap, Infinity, Home } from 'lucide-react';

export default function Navbar() {
  const { user, credits, ilimitado, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: '#0d0d0f', borderBottom: '1px solid #1e1e2e', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <img src="/Dynamis.png" alt="Dynamis" style={{ height: '40px', objectFit: 'contain' }} />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {user && (
          <>
            <Link to="/dashboard" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', textDecoration: 'none' }}>
              <Home size={14} /> Início
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: credits === 0 && !ilimitado ? 'rgba(224,82,82,0.1)' : 'rgba(74,127,165,0.1)', border: `1px solid ${credits === 0 && !ilimitado ? 'rgba(224,82,82,0.3)' : 'rgba(74,127,165,0.3)'}`, borderRadius: '20px', padding: '6px 14px', fontSize: '0.85rem', fontWeight: '600', color: credits === 0 && !ilimitado ? '#e05252' : '#6ba3cc' }}>
              {ilimitado ? <Infinity size={14} /> : <Zap size={14} />}
              {ilimitado ? 'Ilimitado' : `${credits} crédito${credits !== 1 ? 's' : ''} para gerar`}
            </div>

            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <LogOut size={14} />
              Sair
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
