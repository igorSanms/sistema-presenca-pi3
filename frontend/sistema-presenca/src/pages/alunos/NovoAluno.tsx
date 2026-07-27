import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/Button';
import { alunoService } from '../../services/alunoService';
import { api } from '../../services/api';

export function NovoAluno() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  
  const [catalogDisciplinas, setCatalogDisciplinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  // Carrega em background o catálogo para capturar todos os IDs ativos
  useEffect(() => {
    async function carregarCatalogo() {
      try {
        const response = await api.get('/Disciplinas');
        setCatalogDisciplinas(response.data || []);
      } catch (error) {
        console.error('Erro ao ler disciplinas para auto-vínculo:', error);
      }
    }
    carregarCatalogo();
  }, []);

  // Função para formatar o telefone no padrão (99) 99999-9999
  const formatarTelefone = (valor: string) => {
    if (!valor) return "";
    let telefone = valor.replace(/\D/g, ""); // Remove tudo que não for número
    if (telefone.length <= 2) return `(${telefone}`;
    if (telefone.length <= 7) return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    //  Se o campo for telefone, aplica a máscara antes de salvar no estado
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

    if (!formData.nome.trim()) novosErros.nome = 'Nome completo é obrigatório';

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        nome: formData.nome,
        email: formData.email || undefined,
        telefone: formData.telefone || undefined,
        disciplinasIds: catalogDisciplinas.map(d => d.id) 
      };

      await alunoService.criar(payload);
      alert('Aluno cadastrado com sucesso! Matrícula e inserção na grade unificada geradas.');
      navigate('/alunos');
    } catch (error: any) {
      console.error('Erro ao cadastrar aluno:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao salvar novo aluno no banco de dados.';
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (campo: string) => `w-full bg-gray-50 border focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900 transition-colors ${
    erros[campo] ? 'border-red-300 bg-red-50/30' : 'border-gray-100'
  }`;

  return (
    <div className="max-w-[1310px] mx-auto w-full pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Novo Aluno</h1>
        <p className="text-sm text-gray-500 mb-8 mt-1">Insira os dados cadastrais. O aluno será matriculado automaticamente em todas as disciplinas ativas.</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Nome Completo *</label>
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Adriano Souza" className={inputClass('nome')} />
            {erros.nome && <span className="text-[#ff6b6b] text-xs mt-1 block font-medium">{erros.nome}</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="aluno@email.com" className={inputClass('email')} />
              {erros.email && <span className="text-[#ff6b6b] text-xs mt-1 block font-medium">{erros.email}</span>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Telefone</label>
              {/* 👉 Adicionado o maxLength=15 para limitar o tamanho */}
              <input name="telefone" maxLength={15} value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" className={inputClass('telefone')} />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md">
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" disabled={loading} className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md disabled:opacity-50">
              <Save className="w-4 h-4 mr-2" /> {loading ? 'Registrando estudante...' : 'Cadastrar Aluno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}