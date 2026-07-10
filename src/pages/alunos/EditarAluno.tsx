import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/Button';
import { alunoService } from '../../services/alunoService';

export function EditarAluno() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [matriculaSimulada, setMatriculaSimulada] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  // Carrega os dados do aluno quando a tela abre
  useEffect(() => {
    if (id) {
      carregarAluno();
    }
  }, [id]);

  const carregarAluno = async () => {
    try {
      const dados = await alunoService.buscarPorId(id!);
      setFormData({
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone
      });
      setMatriculaSimulada(dados.id ? dados.id.substring(0, 8).toUpperCase() : '');
    } catch (error) {
      console.error('Erro ao carregar aluno:', error);
      alert('Não foi possível carregar os dados deste aluno.');
      navigate('/alunos');
    } finally {
      setLoadingDados(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.telefone) {
      alert('Preencha os campos obrigatórios (*)');
      return;
    }

    try {
      setLoading(true);
      await alunoService.atualizar(id!, formData);
      alert('Aluno atualizado com sucesso!');
      navigate('/alunos');
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      alert('Erro ao atualizar no banco de dados. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingDados) {
    return <div className="p-10 text-center text-gray-500">Carregando dados do aluno...</div>;
  }

  return (
    <div className="max-w-[1310px] mx-auto w-full pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Editar Aluno</h1>
        <p className="text-sm text-gray-500 mb-8 mt-1">Atualize as informações do aluno</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Nome Completo *</label>
            <input name="nome" value={formData.nome} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Telefone *</label>
              <input name="telefone" value={formData.telefone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Número de Matrícula *</label>
            {/* Campo desabilitado conforme o design Figma */}
            <input value={matriculaSimulada} disabled className="w-full bg-gray-100 border border-transparent rounded-md px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-500 mt-2">A matrícula não pode ser alterada</p>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md">
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" disabled={loading} className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md disabled:opacity-50">
              <Save className="w-4 h-4 mr-2" /> {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}