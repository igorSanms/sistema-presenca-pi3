import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

interface Horario {
  id: number;
  dia: string;
  inicio: string;
  termino: string;
}

export function NovaDisciplina() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    professor: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: ''
  });

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [professores, setProfessores] = useState<{ id: string; nome: string }[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfessores() {
      try {
        const { data } = await api.get('/Auth/professores');
        setProfessores(data || []);
      } catch (error) {
        console.error('Erro ao buscar professores:', error);
      }
    }
    loadProfessores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (erros[name]) setErros({ ...erros, [name]: '' });
  };

  const handleAddHorario = () => {
    setHorarios([...horarios, { id: Date.now(), dia: 'Segunda', inicio: '', termino: '' }]);
  };

  const handleHorarioChange = (id: number, campo: keyof Horario, valor: string) => {
    setHorarios(horarios.map(h => (h.id === id ? { ...h, [campo]: valor } : h)));
  };

  const handleRemoveHorario = (id: number) => {
    setHorarios(horarios.filter(h => h.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) novosErros.nome = 'Nome da disciplina é obrigatório';
    if (!formData.professor) novosErros.professor = 'Professor é obrigatório';
    if (!formData.dataInicio) novosErros.dataInicio = 'Data de início é obrigatória';
    if (!formData.dataFim) novosErros.dataFim = 'Data de término é obrigatória';

    if (horarios.length === 0) {
      novosErros.horarios = 'Adicione ao menos um horário';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      setLoading(true);
      const horariosFormatados = JSON.stringify(horarios.map(h => `${h.dia} ${h.inicio}-${h.termino}`));

      const payload = {
        nome: formData.nome,
        professorId: formData.professor,
        horarios: horariosFormatados,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim
      };

      await api.post('/Disciplinas', payload);
      alert('Disciplina cadastrada com sucesso!');
      navigate('/painel');
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar disciplina. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (campo: string) => 
    `w-full bg-gray-50 border focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900 transition-colors ${erros[campo] ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`;

  return (
    <div className="max-w-[1310px] mx-auto w-full pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Nova Disciplina</h1>
        <p className="text-sm text-gray-500 mb-8 mt-1">Preencha os dados abaixo para inserir uma nova matéria na grade do cursinho.</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Nome da Disciplina *</label>
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Matemática, Biologia..." className={inputClass('nome')} />
            {erros.nome && <span className="text-[#ff6b6b] text-xs mt-1 block font-medium">{erros.nome}</span>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Professor Responsável *</label>
            <select name="professor" value={formData.professor} onChange={handleChange} className={inputClass('professor')}>
              <option value="">Selecione o professor</option>
              {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            {erros.professor && <span className="text-[#ff6b6b] text-xs mt-1 block font-medium">{erros.professor}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Data Início *</label>
              <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className={inputClass('dataInicio')} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Data Fim *</label>
              <input type="date" name="dataFim" value={formData.dataFim} onChange={handleChange} className={inputClass('dataFim')} />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-900">Grade de Horários *</label>
              <Button type="button" variant="outline" onClick={handleAddHorario} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
                <Plus className="w-4 h-4" /> Adicionar Horário
              </Button>
            </div>
            
            {erros.horarios && <span className="text-[#ff6b6b] text-xs mb-3 block font-medium">{erros.horarios}</span>}

            <div className="flex flex-col gap-3">
              {horarios.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
                  Nenhum horário cadastrado. Clique em "Adicionar Horário".
                </div>
              ) : (
                horarios.map((h) => (
                  <div key={h.id} className="flex items-center gap-4 border border-gray-200 bg-white p-3 rounded-lg shadow-sm">
                    <select value={h.dia} onChange={e => handleHorarioChange(h.id, 'dia', e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d => <option key={d}>{d}</option>)}
                    </select>
                    <input type="time" value={h.inicio} onChange={e => handleHorarioChange(h.id, 'inicio', e.target.value)} className="w-32 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                    <span className="text-gray-400 font-medium">até</span>
                    <input type="time" value={h.termino} onChange={e => handleHorarioChange(h.id, 'termino', e.target.value)} className="w-32 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                    
                    <button type="button" onClick={() => handleRemoveHorario(h.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Remover horário">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Button type="submit" disabled={loading} className="w-full bg-[#0A0F1C] hover:bg-gray-800 text-white py-3 rounded-md flex items-center justify-center transition-colors disabled:opacity-50">
              <Save className="w-5 h-5 mr-2" /> {loading ? 'Cadastrando...' : 'Cadastrar Disciplina'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}