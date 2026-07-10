import axios, { type InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: 'https://localhost:7214/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor ajustado para os tipos oficiais do Axios moderno
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('@Chamada:token');
    
    // Verificamos se o token existe e se a propriedade headers foi inicializada
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;