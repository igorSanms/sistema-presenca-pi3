import { createContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

export interface Turma {
  id: string;
  nome: string;
  ativo: boolean;
}

interface TurmaContextData {
  turmaAtiva: Turma | null;
  setTurmaAtiva: (turma: Turma) => void;
  turmas: Turma[];
  carregarTurmas: () => Promise<void>;
}

export const TurmaContext = createContext<TurmaContextData>({} as TurmaContextData);

export function TurmaProvider({ children }: { children: ReactNode }) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaAtiva, setTurmaAtivaState] = useState<Turma | null>(null);

  // Quando o usuário escolhe uma turma nova, salvamos no estado e no LocalStorage
  const setTurmaAtiva = (turma: Turma) => {
    setTurmaAtivaState(turma);
    localStorage.setItem('@SistemaPresenca:turmaAtiva', JSON.stringify(turma));
  };

  const carregarTurmas = async () => {
    try {
      const response = await api.get('/Turmas');
      const turmasData = response.data;
      setTurmas(turmasData);

      if (turmasData.length > 0) {
        // Verifica se já existia uma turma salva no navegador
        const savedTurma = localStorage.getItem('@SistemaPresenca:turmaAtiva');
        
        if (savedTurma) {
          const parsed = JSON.parse(savedTurma);
          // Confirma se a turma salva ainda existe no banco de dados
          const exists = turmasData.find((t: Turma) => t.id === parsed.id);
          if (exists) {
            setTurmaAtivaState(exists);
          } else {
            setTurmaAtiva(turmasData[0]); // Se a salva foi apagada, pega a primeira
          }
        } else {
          // Se é o primeiro acesso, seleciona a primeira turma da lista por padrão
          setTurmaAtiva(turmasData[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  useEffect(() => {
    // Só tenta carregar as turmas se o usuário já estiver logado (tiver token)
    const token = localStorage.getItem('@SistemaPresenca:token');
    if (token) {
      carregarTurmas();
    }
  }, []);

  return (
    <TurmaContext.Provider value={{ turmaAtiva, setTurmaAtiva, turmas, carregarTurmas }}>
      {children}
    </TurmaContext.Provider>
  );
}