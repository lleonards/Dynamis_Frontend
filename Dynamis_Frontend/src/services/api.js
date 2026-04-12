import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

function redirectToLogin() {
  const loginHashUrl = `${window.location.origin}${window.location.pathname}#/login`;
  window.location.replace(loginHashUrl);
}

// Interceptor: adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dynamis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tenta refresh
      const refreshToken = localStorage.getItem('dynamis_refresh');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: refreshToken });
          localStorage.setItem('dynamis_token', res.data.access_token);
          localStorage.setItem('dynamis_refresh', res.data.refresh_token);
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api.request(error.config);
        } catch {
          localStorage.clear();
          redirectToLogin();
        }
      } else {
        localStorage.clear();
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
