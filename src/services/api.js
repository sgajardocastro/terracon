// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // aquí mismo puedes setear headers comunes, timeouts, etc.
});

// (opcional) interceptor para token
api.interceptors.request.use(config => {
  // Asegurar que si el baseURL tiene /api, las URLs absolutas no se lo salten (evitando duplicar /api)
  if (config.baseURL && config.baseURL.endsWith('/api') && config.url.startsWith('/') && !config.url.startsWith('/api/')) {
    config.url = config.url.substring(1);
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
