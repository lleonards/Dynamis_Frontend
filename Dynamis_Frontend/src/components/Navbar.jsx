import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogOut, Zap, Menu, X, Infinity } from 'lucide-react';

export default function Navbar() {
  const { user, credits, plano, ilimitado, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const logoUrl = import.meta.env.VITE_LOGO_URL || 'https://www.genspark.ai/api/files/s/vSPekgD2';

  return (
    <nav style={{
      background: '#0d0d0f',
      borderBottom: '1px solid #1e1e2e',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <img
          src={logoUrl}
          alt="Dynamis"
          style={{ height: '36px', objectFit: 'contain' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <span style={{ display: 'none', color: '#fff', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '2px' }}>DYNAMIS</span>
      </Link>

      {/* Desktop Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <>
            {/* Credits Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: credits === 0 && !ilimitado ? 'rgba(224,82,82,0.1)' : 'rgba(74,127,165,0.1)',
              border: `1px solid ${credits === 0 && !ilimitado ? 'rgba(224,82,82,0.3)' : 'rgba(74,127,165,0.3)'}`,
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: credits === 0 && !ilimitado ? '#e05252' : '#6ba3cc'
            }}>
              {ilimitado ? <Infinity size={14} /> : <Zap size={14} />}
              {ilimitado ? 'Ilimitado' : `${credits} crédito${credits !== 1 ? 's' : ''}`}
            </div>

            <span style={{ color: '#606070', fontSize: '0.85rem', display: 'none', '@media(min-width:600px)': { display: 'block' } }}>
              Olá, <strong style={{ color: '#a0a0b0' }}>{user.nome?.split(' ')[0]}</strong>
            </span>

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
