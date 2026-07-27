import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

export function EditarProfissional() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    areaAtuacao: '',
    perfil: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  useEffect(() => {
    if (id) carregarProfissional();
  }, [id]);

  const carregarProfissional = async () => {
    try {
      // Usa a nossa nova rota do backend
      const response = await api.get(`/Auth/${id}`);
      const dados = response.data;
      
      setFormData({
        nome: dados.nome || '',
        email: dados.email || '',
        telefone: dados.telefone || '',
        areaAtuacao: dados.areaAtuacao || '',
        perfil: dados.perfil || ''
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Não foi possível carregar os dados deste profissional.');
      navigate('/professores');
    } finally {
      setLoadingDados(false);
    }
  };

  const formatarTelefone = (valor: string) => {
    if (!valor) return "";
    let telefone = valor.replace(/\D/g, ""); 
    if (telefone.length <= 2) return `(${telefone}`;
    if (telefone.length <= 7) return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    if (name === 'telefone') {
      value = formatarTelefone(value);
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.email.trim()) {
      alert('Nome e E-mail são obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/Auth/${id}`, {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.perfil === 'Professor' ? (formData.telefone || undefined) : undefined,
        areaAtuacao: formData.perfil === 'Professor' ? formData.areaAtuacao : undefined
      });
      
      alert('Cadastro atualizado com sucesso!');
      navigate('/professores');
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao atualizar cadastro.';
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  if (loadingDados) {
    return <div className="py-20 text-center text-gray-500 font-medium">Carregando dados cadastrais...</div>;
  }

  const isProfessor = formData.perfil === 'Professor';

  return (
    <div className="max-w-[1310px] mx-auto w-full pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Editar Cadastro</h1>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${isProfessor ? 'text-blue-600 bg-blue-50' : 'text-yellow-700 bg-yellow-100'}`}>
            {formData.perfil}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-8">Atualize as informações cadastrais institucionais</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Nome Completo *</label>
            <input name="nome" value={formData.nome} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
            </div>
            
            {/* O campo telefone só fica ativo se for Professor */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Telefone</label>
              <input 
                name="telefone" 
                maxLength={15} 
                value={formData.telefone} 
                onChange={handleChange} 
                disabled={!isProfessor}
                placeholder={isProfessor ? "(00) 00000-0000" : "Não aplicável"}
                className={`w-full border focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm transition-colors ${
                  isProfessor 
                    ? 'bg-gray-50 border-gray-200 focus:bg-white text-gray-900' 
                    : 'bg-gray-100 border-transparent text-gray-400 cursor-not-allowed'
                }`} 
              />
            </div>
          </div>

          {/* O campo Área de Atuação só aparece se for Professor */}
          {isProfessor && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Área de Atuação</label>
              <input name="areaAtuacao" value={formData.areaAtuacao} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
            </div>
          )}

          <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md">
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" disabled={loading} className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md disabled:opacity-50 font-bold">
              <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}