import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/Button';
import { alunoService } from '../../services/alunoService';

export function NovoAluno() {
  const navigate = useNavigate();
  // Removemos a matrícula do estado
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [loading, setLoading] = useState(false);

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
      await alunoService.criar(formData);
      alert('Aluno cadastrado com sucesso!');
      navigate('/alunos');
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      alert('Erro ao cadastrar no banco de dados. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Novo Aluno</h1>
        <p className="text-sm text-gray-500 mb-8 mt-1">Preencha os dados para cadastrar um novo aluno</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Nome Completo *</label>
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Carlos Oliveira" className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="aluno@email.com" className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Telefone *</label>
              <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(11) 98765-4321" className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900" />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md">
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" disabled={loading} className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md disabled:opacity-50">
              <Save className="w-4 h-4 mr-2" /> {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}