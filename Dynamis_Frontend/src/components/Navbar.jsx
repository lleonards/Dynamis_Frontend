import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogOut, Zap, Infinity } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': '',
  '/calculos/materiais': 'Calculadora de materiais',
  '/calculos/tomadas': 'Dimensionamento de tomadas',
  '/calculos/padrao': 'Padrão de entrada',
  '/calculos/condutores': 'Dimensionamento de condutores',
  '/calculos/dicionario': 'Dicionário técnico',
  '/calculos/luminarias': 'Tipos de luminárias',
  '/login': '',
  '/register': '',
  '/sucesso': ''
};

function getPageTitle(pathname) {
  return PAGE_TITLES[pathname] ?? '';
}

export default function Navbar() {
  const { user, credits, ilimitado, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  useEffect(() => {
    const titleSuffix = 'Dynamis';
    document.title = currentPageTitle ? `${currentPageTitle} | ${titleSuffix}` : titleSuffix;
  }, [currentPageTitle]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: '#0d0d0f', borderBottom: '1px solid #1e1e2e', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src="/Dynamis.png" alt="Dynamis" style={{ height: '40px', objectFit: 'contain' }} />
        </Link>

        {user && currentPageTitle && (
          <div style={{ display: 'inline-flex', alignItems: 'center', minWidth: 0, padding: '8px 14px', borderRadius: '999px', border: '1px solid rgba(74,127,165,0.28)', background: 'rgba(74,127,165,0.08)' }}>
            <span style={{ color: '#d8e8f4', fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentPageTitle}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {user && (
          <>
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
