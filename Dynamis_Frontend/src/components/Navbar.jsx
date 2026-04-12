import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import HelpGuideModal from './HelpGuideModal';
import { LogOut, Zap, Infinity, HelpCircle } from 'lucide-react';

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
  const [guideOpen, setGuideOpen] = useState(false);

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
    <>
      <nav className="app-navbar">
        <div className="app-navbar-brand">
          <Link to="/dashboard" className="app-navbar-home-link">
            <img src="/Dynamis.png" alt="Dynamis" className="app-navbar-logo" />
          </Link>

          {user && currentPageTitle && (
            <div className="app-navbar-pill">
              <span className="app-navbar-pill-text">{currentPageTitle}</span>
            </div>
          )}
        </div>

        <div className="app-navbar-actions">
          <button onClick={() => setGuideOpen(true)} className="btn-secondary app-navbar-help" type="button">
            <HelpCircle size={14} />
            <span className="app-navbar-help-label">Ajuda</span>
          </button>

          {user && (
            <>
              <div
                className="app-navbar-credit"
                style={{
                  background: credits === 0 && !ilimitado ? 'rgba(224,82,82,0.1)' : 'rgba(74,127,165,0.1)',
                  border: `1px solid ${credits === 0 && !ilimitado ? 'rgba(224,82,82,0.3)' : 'rgba(74,127,165,0.3)'}`,
                  color: credits === 0 && !ilimitado ? '#e05252' : '#6ba3cc'
                }}
              >
                {ilimitado ? <Infinity size={14} /> : <Zap size={14} />}
                <span className="app-navbar-credit-text app-navbar-credit-text-desktop">
                  {ilimitado ? 'Ilimitado' : `${credits} crédito${credits !== 1 ? 's' : ''} para gerar`}
                </span>
                <span className="app-navbar-credit-text app-navbar-credit-text-mobile">
                  {ilimitado ? 'Plano ativo' : `${credits} crédito${credits !== 1 ? 's' : ''}`}
                </span>
              </div>

              <button onClick={handleLogout} className="btn-secondary app-navbar-logout" type="button">
                <LogOut size={14} />
                <span className="app-navbar-logout-label">Sair</span>
              </button>
            </>
          )}
        </div>
      </nav>

      <HelpGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
