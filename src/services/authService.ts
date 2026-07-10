import { api } from './api';

export interface LoginData {
  Email: string;
  Senha: string;
}

// O novo "espelho" do RegisterRequest.cs
export interface RegisterData {
  Nome: string;
  Email: string;
  Senha: string;
  Perfil: number; // Usamos number pois Enums no C# são trafegados como inteiros
  Telefone?: string;
  AreaAtuacao?: string;
}

export const authService = {
  async login(data: LoginData) {
    const response = await api.post('/Auth/login', data);
    return response.data;
  },

  // Nova função para o Cadastro
  async register(data: RegisterData) {
    const response = await api.post('/Auth/register', data);
    return response.data;
  }
};