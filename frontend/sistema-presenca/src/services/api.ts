import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Usa a nossa variável de ambiente ou o proxy local
});

// Interceptor: Roda automaticamente ANTES de toda requisição que o sistema fizer
api.interceptors.request.use((config) => {
  // Vai no armazenamento do navegador e tenta buscar o token salvo
  const token = localStorage.getItem('@SistemaPresenca:token');

  // Se achar o token, injeta no cabeçalho "Authorization" com a palavra "Bearer "
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Resposta (Se o C# disser que o token expirou)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Sessão expirada ou não autorizada.");
      localStorage.removeItem('@SistemaPresenca:token');
      localStorage.removeItem('@SistemaPresenca:perfil');
      localStorage.removeItem('@SistemaPresenca:nome');
      localStorage.removeItem('@SistemaPresenca:email');
      
      alert('Sessão expirada. Por favor, faça login novamente.');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);