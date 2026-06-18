import { api } from './api';

// Essa interface deve refletir o que o C# espera/retorna
export interface AlunoData {
  id?: string; // O C# costuma gerar um ID tipo Guid no banco
  nome: string;
  email: string;
  telefone: string;
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

  // Atualiza os dados do aluno
  async atualizar(id: string, aluno: AlunoData) {
    const response = await api.put(`/Alunos/${id}`, aluno);
    return response.data;
  },

  // Exclui um aluno
  async excluir(id: string) {
    const response = await api.delete(`/Alunos/${id}`);
    return response.data;
  }
};