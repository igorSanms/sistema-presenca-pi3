import { createContext, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode'; 

interface AuthContextData {
  token: string | null;
  perfil: string | null;
  nome: string | null;   
  email: string | null;  
  isAuthenticated: boolean;
  signIn: (token: string, perfil: string) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('@SistemaPresenca:token'));
  const [perfil, setPerfil] = useState<string | null>(() => localStorage.getItem('@SistemaPresenca:perfil'));
  
  // Novos estados buscando do navegador
  const [nome, setNome] = useState<string | null>(() => localStorage.getItem('@SistemaPresenca:nome'));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('@SistemaPresenca:email'));

  function signIn(newToken: string, novoPerfil: string) {
    setToken(newToken);
    setPerfil(novoPerfil);
    localStorage.setItem('@SistemaPresenca:token', newToken);
    localStorage.setItem('@SistemaPresenca:perfil', novoPerfil);

    // ABRE O ENVELOPE DO TOKEN PARA EXTRAIR OS DADOS
    try {
      const decoded: any = jwtDecode(newToken);
      
      // O e-mail vem na propriedade 'email' ou na claim padrão da Microsoft
      const emailExtraido = decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
      
      // O nome pode vir na claim 'name'. Se o C# não enviou o nome dentro do token, usamos a parte do e-mail antes do @ como plano B!
      let nomeExtraido = decoded.name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      
      if (!nomeExtraido && emailExtraido) {
        nomeExtraido = emailExtraido.split('@')[0]; // ex: "coord@gmail.com" vira "coord"
      }

      setNome(nomeExtraido);
      setEmail(emailExtraido);
      
      localStorage.setItem('@SistemaPresenca:nome', nomeExtraido);
      localStorage.setItem('@SistemaPresenca:email', emailExtraido);

    } catch (err) {
      console.error('Erro ao decodificar o Token JWT:', err);
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  function signOut() {
    setToken(null);
    setPerfil(null);
    setNome(null);
    setEmail(null);
    localStorage.removeItem('@SistemaPresenca:token');
    localStorage.removeItem('@SistemaPresenca:perfil');
    localStorage.removeItem('@SistemaPresenca:nome');
    localStorage.removeItem('@SistemaPresenca:email');
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      perfil, 
      nome,   // <-- Entregando pro sistema
      email,  // <-- Entregando pro sistema
      isAuthenticated: !!token, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}