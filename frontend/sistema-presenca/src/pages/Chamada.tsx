import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Calendar as CalendarIcon, Book, Clock, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

// Interface que reflete o retorno e envio para a API
interface AlunoChamada {
  alunoId: string;
  nome: string;
  status: 0 | 1 | 2 | null;
  observacao?: string;
}

interface Disciplina {
  id: string;
  nome: string;
}

export function Chamada() {
  const navigate = useNavigate();
  const { dia } = useParams();
  const location = useLocation();
  
  // Estado dataAula inicializado com a data de hoje YYYY-MM-DD
  const hoje = new Date().toISOString().split('T')[0];
  const [dataAula, setDataAula] = useState(hoje);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string>('');
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>('');
  
  const [alunos, setAlunos] = useState<AlunoChamada[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  
  // Controle para evitar loops de auto-fetch
  const [autoFetchExecuted, setAutoFetchExecuted] = useState(false);

  // Busca inicial das disciplinas
  useEffect(() => {
    async function loadDisciplinas() {
      try {
        const response = await api.get('/Disciplinas');
        setDisciplinas(response.data);
      } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
      }
    }
    loadDisciplinas();
  }, []);

  // 1. Popula os states a partir do React Router (Smart Routing)
  useEffect(() => {
    try {
      if (location.state) {
        const state = location.state as any;
        const { data, disciplinaId, horario } = state;
        
        if (data) {
          // Sanitização para formato estrito YYYY-MM-DD
          let safeDate = String(data);
          if (safeDate.includes('T')) {
            safeDate = safeDate.split('T')[0];
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) {
            setDataAula(safeDate);
          }
        }
        
        if (disciplinaId) setDisciplinaSelecionada(String(disciplinaId));
        if (horario) setHorarioSelecionado(String(horario));
      }
    } catch (error) {
      console.error('Erro ao hidratar state da navegação, prosseguindo com tela vazia', error);
    }
  }, [location.state]);

  // Busca de Dados (GET) - Extraída para não depender estritamente do clique
  const fetchFrequencia = async (data: string, disciplina: string, horario: string) => {
    try {
      setBuscando(true);
      
      const alunosResponse = await api.get('/Alunos');
      const alunosBase = alunosResponse.data || [];
      console.log('Alunos base recuperados:', alunosBase);

      let frequenciaData: any[] = [];
      try {
        const frequenciaResponse = await api.get('/Frequencia', {
          params: { data, disciplinaId: disciplina, horario }
        });
        frequenciaData = frequenciaResponse.data || [];
        console.log('Dados de frequência:', frequenciaData);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error('Erro ao buscar a Frequência do dia:', err);
          throw err;
        }
        console.log('Aula inédita (404). Iniciando chamada limpa.');
      }

      const alunosMapeados = alunosBase.map((alunoBase: any) => {
        const baseId = alunoBase.id || alunoBase.Id;
        const baseNome = alunoBase.nome || alunoBase.Nome || 'Aluno Sem Nome';

        const registro = frequenciaData.find((f: any) => {
           const freqId = f.alunoId || f.AlunoId;
           return freqId === baseId;
        });
        
        let statusConvertido = 0; 
        if (registro) {
          const statusRegistro = registro.status || registro.Status;
          if (statusRegistro === 'Falta' || statusRegistro === 1) statusConvertido = 1;
          else if (statusRegistro === 'Justificada' || statusRegistro === 2) statusConvertido = 2;
          else if (statusRegistro === null) statusConvertido = 0;
        }
        
        return {
          alunoId: baseId,
          nome: baseNome,
          status: statusConvertido,
          observacao: (registro?.observacao || registro?.Observacao) || ''
        };
      });
      
      console.log('Resultado do merge (alunosMapeados):', alunosMapeados);
      setAlunos(alunosMapeados);
      
    } catch (error) {
      console.error('Erro ao buscar chamada:', error);
      alert('Erro ao buscar a lista de alunos.');
    } finally {
      setBuscando(false);
    }
  };

  // 2. Aciona o auto-fetch se vier do Smart Routing
  useEffect(() => {
    if (disciplinas.length > 0 && location.state && !autoFetchExecuted) {
      const { data, disciplinaId, horario } = location.state;
      // Garante que o estado local já foi hidratado
      if (dataAula === data && disciplinaSelecionada === disciplinaId && horarioSelecionado === horario) {
        fetchFrequencia(data, disciplinaId, horario);
        setAutoFetchExecuted(true);
      }
    }
  }, [disciplinas, dataAula, disciplinaSelecionada, horarioSelecionado, location.state, autoFetchExecuted]);

  const handleBuscarAlunos = () => {
    if (!dataAula || !disciplinaSelecionada || !horarioSelecionado) return;
    fetchFrequencia(dataAula, disciplinaSelecionada, horarioSelecionado);
  };

  // Lógica para atualizar o status de forma imutável e segura
  const handleStatusChange = (id: string, novoStatus: 0 | 1 | 2 | null) => {
    setAlunos(prev => prev.map(aluno => 
      aluno.alunoId === id ? { ...aluno, status: novoStatus } : aluno
    ));
  };

  const handleObsChange = (id: string, obs: string) => {
    setAlunos(prev => prev.map(aluno => 
      aluno.alunoId === id ? { ...aluno, observacao: obs } : aluno
    ));
  };

  // Salvamento (POST)
  const handleSave = async () => {
    if (!disciplinaSelecionada || !horarioSelecionado) {
      alert('Por favor, selecione a disciplina e o horário antes de salvar.');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        data: dataAula.split('T')[0],
        disciplinaId: disciplinaSelecionada,
        horario: horarioSelecionado,
        alunos: alunos.map(a => ({
          alunoId: a.alunoId,
          status: Number(a.status !== null ? a.status : 0)
        }))
      };

      console.log("Payload enviado:", JSON.stringify(payload, null, 2));

      await api.post('/Frequencia', payload);
      alert('Chamada salva com sucesso!');
      navigate('/painel');
    } catch (error: any) {
      console.error("Erro 400 detalhado:", error.response?.data);
      alert('Erro ao salvar chamada. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  // Matemática dinâmica para o placar no topo
  const total = alunos.length;
  const ausentes = alunos.filter(a => a.status === 1).length;
  const justificados = alunos.filter(a => a.status === 2).length;
  const presentes = total > 0 ? total - ausentes - justificados : 0;

  const podeBuscar = dataAula && disciplinaSelecionada && horarioSelecionado;

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <button onClick={() => navigate('/painel')} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar para Grade de Aulas
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 capitalize">Chamada - {dia || 'Registro'}</h1>
        <p className="text-sm text-gray-500 mt-1">Preencha os filtros para iniciar a chamada.</p>
      </div>

      {/* Placar de Resumo e Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Data da Aula</label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input 
                type="date" 
                value={dataAula}
                onChange={(e) => setDataAula(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Disciplina</label>
            <div className="relative">
              <Book className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <select 
                value={disciplinaSelecionada}
                onChange={(e) => setDisciplinaSelecionada(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 appearance-none"
              >
                <option value="">Selecione a Disciplina...</option>
                {disciplinas.map(d => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <select 
                value={horarioSelecionado}
                onChange={(e) => setHorarioSelecionado(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 appearance-none"
              >
                <option value="">Selecione o Horário...</option>
                <option value="08:00 - 09:40">08:00 - 09:40</option>
                <option value="10:00 - 11:40">10:00 - 11:40</option>
                <option value="19:00 - 20:40">19:00 - 20:40</option>
                <option value="21:00 - 22:40">21:00 - 22:40</option>
              </select>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <Button 
              onClick={handleBuscarAlunos} 
              disabled={!podeBuscar || buscando} 
              className={`w-full h-[38px] flex items-center justify-center gap-2 ${podeBuscar ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Search className="w-4 h-4" /> {buscando ? 'Buscando...' : 'Buscar Alunos'}
            </Button>
          </div>
        </div>

        {alunos.length > 0 && (
          <div className="flex gap-8 text-center bg-gray-50 p-4 rounded-lg border border-gray-100 justify-center">
            <div><p className="text-xs text-gray-500 font-medium mb-1">Presentes</p><p className="text-2xl font-bold text-green-600">{presentes}</p></div>
            <div><p className="text-xs text-gray-500 font-medium mb-1">Ausentes</p><p className="text-2xl font-bold text-red-600">{ausentes}</p></div>
            <div><p className="text-xs text-gray-500 font-medium mb-1">Justificados</p><p className="text-2xl font-bold text-blue-600">{justificados}</p></div>
            <div><p className="text-xs text-gray-500 font-medium mb-1">Total Matriculados</p><p className="text-2xl font-bold text-gray-900">{total}</p></div>
          </div>
        )}
      </div>

      {/* Tabela de Alunos */}
      {alunos.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Lista de Presença</h3>
          <p className="text-sm text-gray-500 mb-6">Marque "Ausente" ou "Justificativa" quando necessário. Sem marcação = Presente</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm font-bold text-gray-900">
                  <th className="pb-3 px-4 w-28">Matrícula</th>
                  <th className="pb-3 px-4 w-48">Nome do Aluno</th>
                  <th className="pb-3 px-4 w-24 text-center">Ausente</th>
                  <th className="pb-3 px-4 w-32 text-center">Justificativa</th>
                  <th className="pb-3 px-4 w-32 text-center">Status</th>
                  <th className="pb-3 px-4 w-64">Observações da Aula</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {alunos.map((aluno) => (
                  <tr key={aluno.alunoId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">
                      {aluno.alunoId ? aluno.alunoId.substring(0, 8).toUpperCase() : ''}
                    </td>
                    <td className="py-4 px-4 font-bold">{aluno.nome}</td>
                    
                    {/* Checkbox Ausente */}
                    <td className="py-4 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={aluno.status === 1} 
                        onChange={(e) => handleStatusChange(aluno.alunoId, e.target.checked ? 1 : 0)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </td>
                    
                    {/* Checkbox Justificativa */}
                    <td className="py-4 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={aluno.status === 2} 
                        onChange={(e) => handleStatusChange(aluno.alunoId, e.target.checked ? 2 : 0)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </td>

                    {/* Badge Dinâmica de Status */}
                    <td className="py-4 px-4 text-center">
                      {aluno.status === 1 ? (
                        <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">Ausente</span>
                      ) : aluno.status === 2 ? (
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">Justificado</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Presente</span>
                      )}
                    </td>

                    {/* Input de Observação */}
                    <td className="py-4 px-4">
                      <input 
                        type="text" 
                        placeholder="Adicionar observação..." 
                        value={aluno.observacao || ''}
                        onChange={(e) => handleObsChange(aluno.alunoId, e.target.value)}
                        className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-md px-3 py-2 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-8">
            <Button variant="secondary" className="bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 px-6 flex items-center justify-center rounded-md w-auto" onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Chamada'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 shadow-sm text-center">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pronto para a chamada</h3>
          <p className="text-gray-500">Selecione a disciplina, a data e o horário acima e clique em "Buscar Alunos" para iniciar o registro de frequência da sua turma.</p>
        </div>
      )}
    </div>
  );
}