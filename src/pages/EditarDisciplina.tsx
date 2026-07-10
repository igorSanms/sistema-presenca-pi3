import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Save } from 'lucide-react';
import { Button } from '../components/Button';

interface Horario {
  id: number;
  dia: string;
  inicio: string;
  termino: string;
}

export function EditarDisciplina() {
  const navigate = useNavigate();

  // Estado pré-preenchido com os dados do seu print (Simulando o que viria do Backend)
  const [formData, setFormData] = useState({
    titulo: 'Design UX/UI Fundamentos',
    descricao: 'Aprenda os princípios de design de interfaces e experiência do usuário',
    professor: '1', // ID do Prof. Carlos Santos
    duracao: '20 horas',
    categoria: 'Design',
    nivel: 'Iniciante',
    preco: '199,9'
  });

  const [horarios, setHorarios] = useState<Horario[]>([
    { id: 1, dia: 'Segunda', inicio: '10:00', termino: '12:00' },
    { id: 2, dia: 'Sexta', inicio: '10:00', termino: '12:00' }
  ]);
  
  const [erros, setErros] = useState<Record<string, string>>({});

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // (Mesma validação do cadastro omitida por brevidade)
    alert('Alterações salvas com sucesso!');
    navigate('/painel');
  };

  const inputClass = (campo: string) => `w-full bg-gray-100 border focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900 ${erros[campo] ? 'border-red-300' : 'border-transparent'}`;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <button onClick={() => navigate('/painel')} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Editar disciplina</h1>
        <p className="text-sm text-gray-500 mb-8 mt-1">Altere os dados da disciplina existente</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Título da disciplina *</label>
            <input name="titulo" value={formData.titulo} onChange={handleChange} className={inputClass('titulo')} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Descrição *</label>
            <input name="descricao" value={formData.descricao} onChange={handleChange} className={inputClass('descricao')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Professor *</label>
              <select name="professor" value={formData.professor} onChange={handleChange} className={inputClass('professor')}>
                <option value="1">Prof. Carlos Santos</option>
                <option value="2">Prof. Ana Silva</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Duração *</label>
              <input name="duracao" value={formData.duracao} onChange={handleChange} className={inputClass('duracao')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Categoria *</label>
              <input name="categoria" value={formData.categoria} onChange={handleChange} className={inputClass('categoria')} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Nível</label>
              <select name="nivel" value={formData.nivel} onChange={handleChange} className={inputClass('nivel')}>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Preço (R$) *</label>
            <input name="preco" value={formData.preco} onChange={handleChange} className={inputClass('preco')} />
          </div>

          <hr className="border-gray-200 my-2" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Horários das Aulas</h3>
              <Button type="button" variant="outline" onClick={handleAddHorario} className="text-gray-900 border-gray-300 px-4 py-2 flex items-center justify-center rounded-md">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Horário
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {horarios.map((horario, index) => (
                <div key={horario.id} className="border border-gray-200 rounded-xl p-6 relative bg-white shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Horário {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Dia da semana</label>
                      <select value={horario.dia} onChange={(e) => handleHorarioChange(horario.id, 'dia', e.target.value)} className="w-full bg-gray-100 border-transparent rounded-md px-3 py-2 text-sm">
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
                      <input type="time" value={horario.inicio} onChange={(e) => handleHorarioChange(horario.id, 'inicio', e.target.value)} className="w-full bg-gray-100 border-transparent rounded-md px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Horário de Término</label>
                      <input type="time" value={horario.termino} onChange={(e) => handleHorarioChange(horario.id, 'termino', e.target.value)} className="w-full bg-gray-100 border-transparent rounded-md px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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