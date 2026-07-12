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
  });
  
  const [disciplinasIds, setDisciplinasIds] = useState<string[]>([]);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  const carregarDisciplinas = async () => {
    try {
      const response = await api.get('/Disciplinas');
      setDisciplinasDisponiveis(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
    }
  };

  const handleToggleDisciplina = (id: string) => {
    setDisciplinasIds(prev => 
      prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) novosErros.nome = 'Nome completo é obrigatório';
    if (!formData.email.trim()) novosErros.email = 'E-mail é obrigatório';

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        disciplinasIds
      };
      await alunoService.criar(payload);
      alert('Aluno cadastrado com sucesso! A matrícula foi gerada automaticamente.');
      navigate('/alunos');
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      alert('Erro ao cadastrar no banco de dados. Verifique o console.');
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
        <p className="text-sm text-gray-500 mb-8 mt-1">O número de Matrícula será gerado automaticamente pelo sistema de forma dinâmica.</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Nome Completo *</label>
              <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Carlos Oliveira" className={inputClass('nome')} />
              {erros.nome && <span className="text-[#ff6b6b] text-xs mt-1 block font-medium">{erros.nome}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="aluno@email.com" className={inputClass('email')} />
              {erros.email && <span className="text-[#ff6b6b] text-xs mt-1 block font-medium">{erros.email}</span>}
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-bold text-gray-900 mb-3">Vincular a Disciplinas (Opcional)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {disciplinasDisponiveis.map(disc => (
                <label key={disc.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={disciplinasIds.includes(disc.id)}
                    onChange={() => handleToggleDisciplina(disc.id)}
                  />
                  <span className="text-sm font-medium text-gray-700">{disc.nome}</span>
                </label>
              ))}
              {disciplinasDisponiveis.length === 0 && (
                <span className="text-sm text-gray-500 italic">Nenhuma disciplina cadastrada no sistema.</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md">
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" disabled={loading} className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md disabled:opacity-50">
              <Save className="w-4 h-4 mr-2" /> {loading ? 'Cadastrando...' : 'Cadastrar Aluno'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}