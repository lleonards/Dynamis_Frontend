import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [plano, setPlano] = useState('free');
  const [ilimitado, setIlimitado] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await api.get('/api/credits');
      setCredits(res.data.creditos);
      setPlano(res.data.plano);
      setIlimitado(res.data.ilimitado);
      return res.data;
    } catch (error) {
      return null;
    }
  }, []);

  // 🔐 VALIDAÇÃO REAL DA SESSÃO AO INICIAR
  useEffect(() => {
    const token = localStorage.getItem('dynamis_token');
    const savedUser = localStorage.getItem('dynamis_user');

    if (!token || !savedUser) {
      setLoading(false);
      return;
    }

    const validateSession = async () => {
      try {
        setUser(JSON.parse(savedUser));

        const creditsData = await fetchCredits();

        // Se não conseguiu buscar créditos, sessão inválida
        if (!creditsData) {
          throw new Error('Sessão inválida');
        }

      } catch (error) {
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [fetchCredits]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });

    localStorage.setItem('dynamis_token', res.data.access_token);
    localStorage.setItem('dynamis_refresh', res.data.refresh_token);
    localStorage.setItem('dynamis_user', JSON.stringify(res.data.user));

    setUser(res.data.user);
    await fetchCredits();

    return res.data;
  };

  // 🔥 REGISTRO COM LOGIN AUTOMÁTICO
  const register = async (nome, email, password) => {
    await api.post('/api/auth/register', { nome, email, password });

    const loginRes = await api.post('/api/auth/login', { email, password });

    localStorage.setItem('dynamis_token', loginRes.data.access_token);
    localStorage.setItem('dynamis_refresh', loginRes.data.refresh_token);
    localStorage.setItem('dynamis_user', JSON.stringify(loginRes.data.user));

    setUser(loginRes.data.user);
    await fetchCredits();

    return loginRes.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setCredits(0);
    setPlano('free');
    setIlimitado(false);
  };

  const useCredit = async (ferramenta) => {
    const res = await api.post('/api/credits/usar', { ferramenta });

    if (res.data.success && !res.data.ilimitado) {
      setCredits(res.data.creditos);
    }

    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        plano,
        ilimitado,
        loading,
        login,
        register,
        logout,
        useCredit,
        fetchCredits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
