import { createContext, useState, type ReactNode } from 'react';
import { api } from '../services/api';

// Tipagem do que o nosso contexto vai fornecer para o resto do app
interface AuthContextData {
  token: string | null;
  perfil: string | null;
  isAuthenticated: boolean;
  signIn: (token: string, perfil: string) => void;
  signOut: () => void;
}

// Criando o contexto vazio
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializamos os estados buscando no localStorage (caso o usuário já tenha logado antes)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('@SistemaPresenca:token');
  });
  
  const [perfil, setPerfil] = useState<string | null>(() => {
    return localStorage.getItem('@SistemaPresenca:perfil');
  });

  // Função para salvar a sessão
  function signIn(newToken: string, novoPerfil: string) {
    setToken(newToken);
    setPerfil(novoPerfil);

    // Salva no navegador para não deslogar no F5
    localStorage.setItem('@SistemaPresenca:token', newToken);
    localStorage.setItem('@SistemaPresenca:perfil', novoPerfil);

    // Opcional de Sênior: Já injeta o token em todas as futuras requisições do Axios
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  // Função para limpar a sessão (Sair)
  function signOut() {
    setToken(null);
    setPerfil(null);
    localStorage.removeItem('@SistemaPresenca:token');
    localStorage.removeItem('@SistemaPresenca:perfil');
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      perfil, 
      isAuthenticated: !!token, // Retorna true se existir um token
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}