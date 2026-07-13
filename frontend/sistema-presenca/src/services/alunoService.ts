import { api } from './api';

// Interface atualizada e blindada para o TypeScript aceitar os novos fluxos
export interface AlunoData {
  id?: string; 
  nome: string;
  email: string;
  telefone?: string;         // 👉 Transformado em opcional (?) para aceitar strings vazias ou undefined
  matricula?: string;        // 👉 Adicionado para sumir o erro na tabela de Alunos
  disciplinasIds?: string[]; // 👉 Adicionado para sumir o erro do payload no NovoAluno
  presencas?: number;
  faltasReais?: number;
  faltasJustificadas?: number;
  disciplinas?: Array<{ id: string; nome: string }>; // 👉 Adicionado para mapear o retorno do C#
}

export const alunoService = {
  // Busca todos os alunos
  async listarTodos() {
    const response = await api.get('/Alunos');
    return response.data;
  },

  // Cadastra um novo aluno
  async criar(aluno: AlunoData) {
    const response = await api.post('/Alunos', aluno);
    return response.data;
  },

  // Busca um aluno específico para preencher a tela de edição
  async buscarPorId(id: string) {
    const response = await api.get(`/Alunos/${id}`);
    return response.data;
  },

  // Atualiza os dados do aluno (Utiliza Partial<AlunoData> para permitir pacotes de dados parciais)
  async atualizar(id: string, aluno: Partial<AlunoData>) {
    const response = await api.put(`/Alunos/${id}`, aluno);
    return response.data;
  },

  // Exclui um aluno
  async excluir(id: string) {
    const response = await api.delete(`/Alunos/${id}`);
    return response.data;
  }
};