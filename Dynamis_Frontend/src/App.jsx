import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CalcMateriais from './pages/CalcMateriais';
import CalcTomadas from './pages/CalcTomadas';
import CalcPadrao from './pages/CalcPadrao';
import CalcCondutores from './pages/CalcCondutores';
import Dicionario from './pages/Dicionario';
import Luminarias from './pages/Luminarias';
import Sucesso from './pages/Sucesso';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loading-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 12px' }} />
        <p style={{ color: '#606070', fontSize: '0.9rem' }}>Carregando...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/calculos/materiais" element={<ProtectedRoute><CalcMateriais /></ProtectedRoute>} />
        <Route path="/calculos/tomadas" element={<ProtectedRoute><CalcTomadas /></ProtectedRoute>} />
        <Route path="/calculos/padrao" element={<ProtectedRoute><CalcPadrao /></ProtectedRoute>} />
        <Route path="/calculos/condutores" element={<ProtectedRoute><CalcCondutores /></ProtectedRoute>} />
        <Route path="/calculos/dicionario" element={<ProtectedRoute><Dicionario /></ProtectedRoute>} />
        <Route path="/calculos/luminarias" element={<ProtectedRoute><Luminarias /></ProtectedRoute>} />
        <Route path="/sucesso" element={<ProtectedRoute><Sucesso /></ProtectedRoute>} />
        <Route path="/cancelado" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a22', color: '#e8e8f0', border: '1px solid #2a2a38', fontSize: '0.9rem' },
            success: { iconTheme: { primary: '#4caf82', secondary: '#0d0d0f' } },
            error: { iconTheme: { primary: '#e05252', secondary: '#0d0d0f' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
