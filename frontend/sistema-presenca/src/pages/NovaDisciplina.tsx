import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Save } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

// Tipagem para os horários dinâmicos
interface Horario {
  id: number;
  dia: string;
  inicio: string;
  termino: string;
}

export function NovaDisciplina() {
  const navigate = useNavigate();

  // Estado dos campos do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    professor: '',
    duracao: '',
    categoria: '',
    nivel: 'Iniciante',
    preco: ''
  });

  // Estado dos horários (começa vazio)
  const [horarios, setHorarios] = useState<Horario[]>([]);

  // Estado dos professores
  const [professores, setProfessores] = useState<{id: string, nome: string}[]>([]);
  
  // Estado para controlar as mensagens de erro
  const [erros, setErros] = useState<Record<string, string>>({});

  // Buscar professores na montagem
  useEffect(() => {
    async function loadProfessores() {
      try {
        const { data } = await api.get('/Auth/professores');
        setProfessores(data);
      } catch (error) {
        console.error('Erro ao carregar professores:', error);
      }
    }
    loadProfessores();
  }, []);

  // Atualiza os campos de texto normais
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpa o erro do campo quando o usuário começa a digitar
    if (erros[e.target.name]) {
      setErros({ ...erros, [e.target.name]: '' });
    }
  };

  // Adiciona um novo bloco de horário vazio
  const handleAddHorario = () => {
    const novoHorario = {
      id: Date.now(), // Gera um ID único baseado no tempo
      dia: 'Segunda',
      inicio: '',
      termino: ''
    };
    setHorarios([...horarios, novoHorario]);
  };

  // Atualiza um campo específico de um horário específico
  const handleHorarioChange = (id: number, campo: keyof Horario, valor: string) => {
    setHorarios(horarios.map(h => h.id === id ? { ...h, [campo]: valor } : h));
  };

  // Função de salvar com validação visual
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros: Record<string, string> = {};

    if (!formData.titulo) novosErros.titulo = 'Título é obrigatório';
    if (!formData.descricao) novosErros.descricao = 'Descrição é obrigatória';
    if (!formData.professor) novosErros.professor = 'Professor(a) é obrigatório';
    if (!formData.duracao) novosErros.duracao = 'Duração é obrigatória';
    if (!formData.categoria) novosErros.categoria = 'Categoria é obrigatória';
    if (!formData.preco) novosErros.preco = 'Preço é obrigatório';

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return; // Interrompe o salvamento se houver erros
    }

    try {
      const horariosFormatados = horarios.length > 0 
        ? JSON.stringify(horarios.map(h => `${h.dia} ${h.inicio}-${h.termino}`)) 
        : '';

      const payload = {
        nome: formData.titulo,
        professorId: formData.professor,
        horarios: horariosFormatados
      };

      await api.post('/Disciplinas', payload);
      alert('Disciplina cadastrada com sucesso!');
      navigate('/painel');
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error);
      alert('Erro ao realizar o cadastro da disciplina. Verifique os dados e tente novamente.');
    }
  };

  // Helper para o CSS dos inputs com erro
  const inputClass = (campo: string) => `w-full bg-gray-100 border focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-4 py-2.5 text-sm text-gray-900 ${
    erros[campo] ? 'border-red-300' : 'border-transparent'
  }`;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Botão Voltar */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      {/* Container Principal Branco */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Nova disciplina</h1>
        <p className="text-sm text-gray-500 mb-8 mt-1">Preencha os dados para cadastrar uma nova disciplina</p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Título */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Título da disciplina *</label>
            <input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ex. Língua Portuguesa" className={inputClass('titulo')} />
            {erros.titulo && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.titulo}</span>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Descrição *</label>
            <input name="descricao" value={formData.descricao} onChange={handleChange} placeholder="Descreva o conteúdo da disciplina" className={inputClass('descricao')} />
            {erros.descricao && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.descricao}</span>}
          </div>

          {/* Grid de 2 colunas: Professor e Duração */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Duração *</label>
              <input name="duracao" value={formData.duracao} onChange={handleChange} placeholder="Ex. 40 horas" className={inputClass('duracao')} />
              {erros.duracao && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.duracao}</span>}
            </div>
          </div>

          {/* Grid de 2 colunas: Categoria e Nível */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Categoria *</label>
              <input name="categoria" value={formData.categoria} onChange={handleChange} placeholder="Ex. Humanas" className={inputClass('categoria')} />
              {erros.categoria && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.categoria}</span>}
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

          {/* Preço */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Preço (R$) *</label>
            <input name="preco" value={formData.preco} onChange={handleChange} placeholder="Ex. 20 Reais" className={inputClass('preco')} />
            {erros.preco && <span className="text-[#ff6b6b] text-xs mt-1 block">{erros.preco}</span>}
          </div>

          <hr className="border-gray-200 my-2" />

          {/* Seção Dinâmica de Horários */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Horários das Aulas</h3>
                <p className="text-sm text-gray-500">Adicione um ou mais horários para esta disciplina</p>
              </div>
              <Button type="button" variant="outline" onClick={handleAddHorario} className="text-gray-900 border border-gray-300 px-4 py-2 flex items-center justify-center rounded-md">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Horário
              </Button>
            </div>

            {horarios.length === 0 ? (
              // Empty State dos Horários
              <div className="border border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                <Clock className="w-10 h-10 mb-3 text-gray-400" />
                <p className="text-sm">Nenhum horário adicionado. Clique em "Adicionar Horário" para começar.</p>
              </div>
            ) : (
              // Lista de Horários Adicionados
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

          {/* Botões de Ação Final */}
          <div className="flex items-center gap-4 mt-8 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="flex-1 border border-gray-300 text-gray-900 py-2.5 flex items-center justify-center rounded-md"
            >
              Cancelar
            </Button>

            <Button 
              type="submit" 
              variant="secondary" 
              className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 flex items-center justify-center rounded-md"
            >
              <Save className="w-4 h-4 mr-2" /> Cadastrar
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}