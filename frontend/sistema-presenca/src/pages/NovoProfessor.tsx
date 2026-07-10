import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

export function NovoProfessor() {
  const navigate = useNavigate();

  // Estado dos campos do formulário. Perfil 1 = Professor
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    areaAtuacao: '',
    perfil: 1 
  });
  
  // Estado para controlar as mensagens de erro
  const [erros, setErros] = useState<Record<string, string>>({});

  // Atualiza os campos de texto normais
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpa o erro do campo quando o usuário começa a digitar
    if (erros[e.target.name]) {
      setErros({ ...erros, [e.target.name]: '' });
    }
  };

  // Função de salvar com requisição real
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros: Record<string, string> = {};

    if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
    if (!formData.email) novosErros.email = 'Email é obrigatório';
    if (!formData.senha) novosErros.senha = 'Senha é obrigatória';
    if (!formData.areaAtuacao) novosErros.areaAtuacao = 'Área de Atuação é obrigatória';

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      await api.post('/Auth/register', formData);
      
      alert('Professor cadastrado com sucesso!');
      navigate('/professores');
    } catch (error: any) {
      console.error('Erro ao salvar professor:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao realizar o cadastro do professor. Verifique os dados e tente novamente.';
      alert(mensagemErro);
    }
  };

  // Helper para o CSS dos inputs com erro
  const inputClass = (campo: string) => `w-full bg-gray-100 border focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900 ${
    erros[campo] ? 'border-red-300' : 'border-transparent'
  }`;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Novo Professor</h1>
        <p className="text-sm text-gray-500 mb-8 mt-1">Preencha os dados para cadastrar um novo professor no sistema</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Nome Completo *</label>
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex. Carlos Santos" className={inputClass('nome')} />
            {erros.nome && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.nome}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">E-mail *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="professor@escola.com" className={inputClass('email')} />
              {erros.email && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.email}</span>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Telefone</label>
              <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" className={inputClass('telefone')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Área de Atuação *</label>
              <input name="areaAtuacao" value={formData.areaAtuacao} onChange={handleChange} placeholder="Ex. Matemática, Humanas, Programação" className={inputClass('areaAtuacao')} />
              {erros.areaAtuacao && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.areaAtuacao}</span>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Senha de Acesso *</label>
              <input type="password" name="senha" value={formData.senha} onChange={handleChange} placeholder="Crie uma senha forte" className={inputClass('senha')} />
              {erros.senha && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.senha}</span>}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md">
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md">
              <Save className="w-4 h-4 mr-2" /> Cadastrar Professor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
