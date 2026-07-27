import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Copy } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

export function NovoProfessor() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    areaAtuacao: '',
    perfil: 'Professor'
  });
  
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    const gerarSenha = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let senha = '';
      for (let i = 0; i < 8; i++) {
        senha += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return senha;
    };
    
    setFormData(prev => ({ ...prev, senha: gerarSenha() }));
  }, []);

  // 👉 Função de máscara adicionada
  const formatarTelefone = (valor: string) => {
    if (!valor) return "";
    let telefone = valor.replace(/\D/g, ""); 
    if (telefone.length <= 2) return `(${telefone}`;
    if (telefone.length <= 7) return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    // 👉 Aplica a máscara se for o campo de telefone
    if (name === 'telefone') {
      value = formatarTelefone(value);
    }

    setFormData({ ...formData, [name]: value });
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros: Record<string, string> = {};

    if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
    if (!formData.email) novosErros.email = 'Email é obrigatório';
    
    if (formData.perfil === 'Professor' && !formData.areaAtuacao) {
      novosErros.areaAtuacao = 'Área de Atuação é obrigatória';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      const payload = { 
        ...formData,
        areaAtuacao: formData.perfil === 'Professor' ? formData.areaAtuacao : '',
        // 👉 Se o telefone estiver vazio, enviamos nulo igual no aluno
        telefone: formData.perfil === 'Professor' && formData.telefone.trim() !== '' ? formData.telefone : undefined
      };
      
      await api.post('/Auth/register', payload);
      
      const tipoLabel = payload.perfil === 'Professor' ? 'Professor' : 'Coordenador';
      
      window.alert(
        `${tipoLabel} cadastrado com sucesso!\n\nSENHA TEMPORÁRIA: ${payload.senha}\n\nCopie esta senha agora e envie ao usuário. Ela não será exibida novamente.`
      );
      
      navigate('/professores');
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao realizar o cadastro. Verifique os dados e tente novamente.';
      alert(mensagemErro);
    }
  };

  const inputClass = (campo: string) => `w-full bg-gray-100 border focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900 ${
    erros[campo] ? 'border-red-300' : 'border-transparent'
  }`;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Novo Cadastro institucional</h1>
        <p className="text-sm text-gray-500 mb-8 mt-1">Selecione o perfil e preencha os dados do novo profissional</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div className="border-b border-gray-100 pb-6 mb-2">
            <label className="block text-sm font-bold text-gray-900 mb-2">Perfil de Acesso *</label>
            <select 
              name="perfil" 
              value={formData.perfil} 
              onChange={handleChange} 
              className={`${inputClass('perfil')} max-w-xs font-bold text-blue-600 bg-blue-50/50`}
            >
              <option value="Professor">Professor</option>
              <option value="Coordenacao">Coordenação (God Mode)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Nome Completo *</label>
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex. Carlos Santos" className={inputClass('nome')} />
            {erros.nome && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.nome}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">E-mail *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="usuario@escola.com" className={inputClass('email')} />
              {erros.email && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.email}</span>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Telefone</label>
              <input 
                name="telefone" 
                maxLength={15} // 👉 Adicionado o limite de caracteres
                value={formData.telefone} 
                onChange={handleChange} 
                placeholder={formData.perfil === 'Professor' ? "(00) 00000-0000" : "Apenas para professores"} 
                disabled={formData.perfil !== 'Professor'}
                className={`${inputClass('telefone')} ${formData.perfil !== 'Professor' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {formData.perfil === 'Professor' ? (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Área de Atuação *</label>
                <input name="areaAtuacao" value={formData.areaAtuacao} onChange={handleChange} placeholder="Ex. Matemática, Humanas, Programação" className={inputClass('areaAtuacao')} />
                {erros.areaAtuacao && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.areaAtuacao}</span>}
              </div>
            ) : (
              <div className="flex flex-col justify-center text-xs text-gray-500 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-800 mb-1">Acesso Coordenação</span>
                O perfil de Coordenação (Administrador) tem acesso irrestrito ao sistema e não requer área de atuação curricular.
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                <span>Senha de Acesso Gerada *</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">Automático</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  name="senha" 
                  value={formData.senha} 
                  readOnly 
                  className={`${inputClass('senha')} bg-gray-50 border-gray-200 text-gray-500 font-mono tracking-wider cursor-not-allowed select-none pointer-events-none pr-10`} 
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(formData.senha)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                  title="Copiar senha"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md">
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md">
              <Save className="w-4 h-4 mr-2" /> Cadastrar Usuário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}