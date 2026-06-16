import axios from 'axios';

// Cria uma instância do Axios com configurações base
export const api = axios.create({
  // Puxa a URL base do arquivo .env.local
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Resposta (Opcional, mas recomendado)
// Aqui podemos interceptar erros globais, como um token expirado
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o erro for 401 (Não autorizado), poderemos forçar o logout do usuário aqui depois
    if (error.response && error.response.status === 401) {
      console.error('Sessão expirada ou não autorizada.');
    }
    return Promise.reject(error);
  }
);