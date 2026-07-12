import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

interface Horario {
  id: number;
  dia: string;
  inicio: string;
  termino: string;
}

export function EditarDisciplina() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados limpos aguardando a hidratação do Banco de Dados
  const [formData, setFormData] = useState({
    titulo: '',
    professor: '',
    dataInicio: '',
    dataFim: ''
  });

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [professores, setProfessores] = useState<{ id: string; nome: string }[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  // Efeito para carregar os dados dinâmicos do backend
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Carrega o dropdown de professores
        const profRes = await api.get('/Auth/professores');
        setProfessores(profRes.data);

        // 2. Carrega os dados reais da disciplina a ser editada
        const { data } = await api.get(`/Disciplinas/${id}`);
        setFormData({
          titulo: data.nome,
          professor: data.professorId,
          // split('T')[0] formata para YYYY-MM-DD exigido pelo HTML Date Input
          dataInicio: data.dataInicio ? data.dataInicio.split('T')[0] : '',
          dataFim: data.dataFim ? data.dataFim.split('T')[0] : ''
        });

        // 3. Desserializa a string de horários do C#
        if (data.horarios) {
          try {
            const parsed = JSON.parse(data.horarios) as string[];
            const mappedHorarios = parsed.map((hStr, idx) => {
              const partes = hStr.split(' ');
              const dia = partes[0];
              const horas = partes[1].split('-');
              return {
                id: idx,
                dia,
                inicio: horas[0],
                termino: horas[1]
              };
            });
            setHorarios(mappedHorarios);
          } catch {
            // Em caso de erro ou string legada bruta não-JSON
            setHorarios([{ id: Date.now(), dia: 'Segunda', inicio: '', termino: '' }]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados de edição:', error);
        alert('Erro ao carregar os dados da disciplina.');
      }
    }
    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (erros[e.target.name]) setErros({ ...erros, [e.target.name]: '' });
  };

  const handleAddHorario = () => {
    setHorarios([...horarios, { id: Date.now(), dia: 'Segunda', inicio: '', termino: '' }]);
  };

  const handleHorarioChange = (id: number, campo: keyof Horario, valor: string) => {
    setHorarios(horarios.map(h => h.id === id ? { ...h, [campo]: valor } : h));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros: Record<string, string> = {};

    if (!formData.titulo) novosErros.titulo = 'Título é obrigatório';
    if (!formData.professor) novosErros.professor = 'Professor é obrigatório';
    if (!formData.dataInicio) novosErros.dataInicio = 'Data de início é obrigatória';
    if (!formData.dataFim) novosErros.dataFim = 'Data de término é obrigatória';

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      const horariosFormatados = horarios.length > 0 
        ? JSON.stringify(horarios.map(h => `${h.dia} ${h.inicio}-${h.termino}`)) 
        : '';

      const payload = {
        nome: formData.titulo,
        professorId: formData.professor,
        horarios: horariosFormatados,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim
      };

      await api.put(`/Disciplinas/${id}`, payload);
      alert('Alterações salvas com sucesso!');
      navigate('/painel');
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      alert('Erro ao salvar as alterações da disciplina.');
    }
  };

  // Lógica de Soft / Hard Delete Real
  const handleExcluir = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta disciplina? Todos os registros atrelados a ela serão perdidos.')) {
      try {
        await api.delete(`/Disciplinas/${id}`);
        alert('Disciplina excluída com sucesso!');
        navigate('/painel');
      } catch (error) {
        console.error('Erro ao excluir disciplina:', error);
        alert('Erro ao tentar excluir a disciplina.');
      }
    }
  };

  const inputClass = (campo: string) => `w-full bg-gray-100 border focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900 ${erros[campo] ? 'border-red-300' : 'border-transparent'}`;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <button onClick={() => navigate('/painel')} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar disciplina</h1>
            <p className="text-sm text-gray-500 mt-1">Altere os dados da disciplina existente</p>
          </div>
          
          {/* Botão de Exclusão da Disciplina */}
          <button 
            type="button" 
            onClick={handleExcluir}
            className="flex items-center justify-center gap-2 text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-md font-medium text-sm transition-colors self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" /> Excluir Disciplina
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Título da Disciplina */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Título da disciplina *</label>
            <input name="titulo" value={formData.titulo} onChange={handleChange} className={inputClass('titulo')} />
            {erros.titulo && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.titulo}</span>}
          </div>

          {/* Seleção do Professor */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Professor *</label>
            <select name="professor" value={formData.professor} onChange={handleChange} className={inputClass('professor')}>
              <option value="">Selecione um professor</option>
              {professores.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            {erros.professor && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.professor}</span>}
          </div>

          {/* Ciclo de Vida da Disciplina (Datas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-blue-50 bg-blue-50/20 p-4 rounded-xl">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Data de Início *</label>
              <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className={inputClass('dataInicio')} />
              {erros.dataInicio && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.dataInicio}</span>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Data de Término *</label>
              <input type="date" name="dataFim" value={formData.dataFim} onChange={handleChange} className={inputClass('dataFim')} />
              {erros.dataFim && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.dataFim}</span>}
            </div>
          </div>

          <hr className="border-gray-200 my-2" />

          {/* Horários */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Horários das Aulas</h3>
              <Button type="button" variant="outline" onClick={handleAddHorario} className="text-gray-900 border border-gray-300 px-4 py-2 flex items-center justify-center rounded-md">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Horário
              </Button>
            </div>

            {horarios.length === 0 ? (
              <div className="border border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                <Clock className="w-10 h-10 mb-3 text-gray-400" />
                <p className="text-sm">Nenhum horário adicionado. Clique em "Adicionar Horário" para começar.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {horarios.map((horario, index) => (
                  <div key={horario.id} className="border border-gray-200 rounded-xl p-6 relative bg-white shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Horário {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Dia da semana</label>
                        <select value={horario.dia} onChange={(e) => handleHorarioChange(horario.id, 'dia', e.target.value)} className="w-full bg-gray-100 border-transparent rounded-md px-3 py-2 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500">
                          <option>Segunda</option>
                          <option>Terça</option>
                          <option>Quarta</option>
                          <option>Quinta</option>
                          <option>Sexta</option>
                          <option>Sábado</option>
                          <option>Domingo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Horário de Início</label>
                        <input type="time" value={horario.inicio} onChange={(e) => handleHorarioChange(horario.id, 'inicio', e.target.value)} className="w-full bg-gray-100 border-transparent rounded-md px-3 py-2 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Horário de Término</label>
                        <input type="time" value={horario.termino} onChange={(e) => handleHorarioChange(horario.id, 'termino', e.target.value)} className="w-full bg-gray-100 border-transparent rounded-md px-3 py-2 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center gap-4 mt-8 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/painel')} className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md">
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md">
              <Save className="w-4 h-4 mr-2" /> Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}