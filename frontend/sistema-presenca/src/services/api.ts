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

  // LÓGICA DAS TURMAS: Ignora a rota de Turmas para evitar loops
  const isTurmasRoute = config.url?.toLowerCase().includes('/turmas');
  
  if (!isTurmasRoute) {
    const turmaData = localStorage.getItem('@SistemaPresenca:turmaAtiva');
    if (turmaData && config.headers) {
      try {
        const turma = JSON.parse(turmaData);
        if (turma && turma.id) {
          config.headers['X-Turma-Id'] = turma.id;
        }
      } catch (error) {
        console.error("Erro ao ler turma do localStorage", error);
      }
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Resposta (Se o C# disser que o token expirou ou é proibido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Verifica se o erro 401 veio da rota de login
      const isLoginRequest = error.config?.url?.toLowerCase().includes('login');

      // Só derruba a sessão e exibe o alert se NÃO for uma tentativa de login
      if (!isLoginRequest) {
        console.error("Sessão expirada ou não autorizada.");
        localStorage.removeItem('@SistemaPresenca:token');
        localStorage.removeItem('@SistemaPresenca:perfil');
        localStorage.removeItem('@SistemaPresenca:nome');
        localStorage.removeItem('@SistemaPresenca:email');
        
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/';
      }
    } else if (error.response?.status === 403) {
      alert('Acesso negado. Você não tem permissão para realizar esta ação.');
      window.location.href = '/painel';
    }
    
    // Passa o erro para frente para que o Catch do Login consiga pegar!
    return Promise.reject(error);
  }
);