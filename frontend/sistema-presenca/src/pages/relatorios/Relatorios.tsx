import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Download, BarChart2, FileText, BookOpen, Activity, AlertTriangle, ShieldAlert, Check, BellOff, Clock, Edit2, X, Calendar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface Alerta {
  id: string;
  alunoNome: string;
  disciplinaNome: string;
  mensagem: string;
  dataCriacao: string;
}

interface HistoricoAluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  status: number;
  ultimaModificacao: string;
}

export function Relatorios() {
  const perfil = localStorage.getItem('@SistemaPresenca:perfil');
  const isProfessor = perfil === 'Professor';

  const { nome } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const abaQuery = searchParams.get('aba');
  const [abaAtiva, setAbaAtiva] = useState(abaQuery || 'exportacao');

  const handleTrocarAba = (aba: string) => {
    setAbaAtiva(aba);
    setSearchParams({ aba });
  };
  
  const [baixandoAlunos, setBaixandoAlunos] = useState(false);
  const [baixandoDisciplinas, setBaixandoDisciplinas] = useState(false);

  const [dadosEvolucao, setDadosEvolucao] = useState([]);
  const [carregandoDashboard, setCarregandoDashboard] = useState(false);

  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [carregandoAlertas, setCarregandoAlertas] = useState(false);
  const [erroAlertas, setErroAlertas] = useState<string | null>(null);

  // Estados para o Histórico de Chamadas
  const hojeDate = new Date();
  const hojeISO = `${hojeDate.getFullYear()}-${String(hojeDate.getMonth() + 1).padStart(2, '0')}-${String(hojeDate.getDate()).padStart(2, '0')}`;
  
  const [dataHistorico, setDataHistorico] = useState(hojeISO);
  const [historicoChamada, setHistoricoChamada] = useState<HistoricoAluno[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [responsavelEdicao, setResponsavelEdicao] = useState(nome || 'Coordenador Logado');
  
  // Controle de Edição Individual
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [statusEdicao, setStatusEdicao] = useState<number>(0);

  useEffect(() => {
    if (abaQuery && abaQuery !== abaAtiva) {
      setAbaAtiva(abaQuery);
    }
  }, [abaQuery]);

  useEffect(() => {
    if (abaAtiva === 'dashboards') {
      const loadDadosDashboard = async () => {
        try {
          setCarregandoDashboard(true);
          const { data } = await api.get('/Relatorios/Frequencia/Evolucao');
          setDadosEvolucao(data);
        } catch (error) {
          console.error("Erro ao buscar dados do dashboard:", error);
        } finally {
          setCarregandoDashboard(false);
        }
      };
      loadDadosDashboard();
      
    } else if (abaAtiva === 'alertas' && !isProfessor) {
      const loadAlertas = async () => {
        try {
          setCarregandoAlertas(true);
          setErroAlertas(null);
          const { data } = await api.get('/Alertas/Ativos');
          setAlertas(data || []);
        } catch (error) {
          console.error("Erro ao buscar alertas:", error);
          setErroAlertas('Não foi possível carregar os alertas de infrequência.');
        } finally {
          setCarregandoAlertas(false);
        }
      };
      loadAlertas();
      
    } else if (abaAtiva === 'historico' && !isProfessor) {
      const loadHistorico = async () => {
        try {
          setCarregandoHistorico(true);
          
          // 1. Busca os alunos apenas para servir como um "dicionário" para pegar matrícula e e-mail depois
          const alunosResponse = await api.get('/Alunos');
          const listaAlunos = alunosResponse.data || [];

          // 2. Busca a chamada que vem do backend
          let frequenciaData: any[] = [];
          try {
            const frequenciaResponse = await api.get('/Frequencia', { params: { data: dataHistorico } });
            frequenciaData = frequenciaResponse.data || [];
          } catch (err) {
            console.log('Nenhuma chamada encontrada para esta data.');
          }

          // 👉 O GRANDE SEGREDO: Filtra a lista deixando APENAS quem tem um status salvo no banco (diferente de null/undefined)
          const registrosReais = frequenciaData.filter((f: any) => f.status != null || f.Status != null);

          // Se NINGUÉM tem registro, significa que a chamada não foi feita. A tela fica zerada e bloqueada!
          if (registrosReais.length === 0) {
            setHistoricoChamada([]);
            setCarregandoHistorico(false);
            return; 
          }

          // Se a chamada foi feita, a tabela é desenhada APENAS com quem está em "registrosReais".
          // O Aluno 2 recém-cadastrado é ignorado porque ele não tem registro para esse dia!
          const historicoMapeado: HistoricoAluno[] = registrosReais.map((registro: any) => {
            const regId = registro.alunoId || registro.AlunoId;
            const statusRegistro = registro.status != null ? registro.status : registro.Status;
            
            // Procura o aluno no "dicionário" para pegar os dados visuais (email e matrícula)
            const alunoBase = listaAlunos.find((a: any) => (a.id || a.Id) === regId) || {};

            let statusConvertido = 0; // Padrão Presente
            if (statusRegistro === 'Falta' || statusRegistro === 1) statusConvertido = 1;
            else if (statusRegistro === 'Justificada' || statusRegistro === 2) statusConvertido = 2;

            return {
              id: regId,
              nome: alunoBase.nome || alunoBase.Nome || registro.nome || registro.Nome || 'Aluno Desconhecido',
              matricula: alunoBase.matricula || alunoBase.Matricula || 'Sem Matrícula',
              email: alunoBase.email || alunoBase.Email || '',
              status: statusConvertido,
              ultimaModificacao: 'Registro original'
            };
          });

          setHistoricoChamada(historicoMapeado);
        } catch (error) {
          console.error('Erro ao carregar histórico:', error);
        } finally {
          setCarregandoHistorico(false);
        }
      };
      loadHistorico();
    }
  }, [abaAtiva, isProfessor, dataHistorico]);

  const handleResolverAlerta = async (id: string) => {
    try {
      await api.put(`/Alertas/${id}/Resolver`);
      setAlertas(prev => prev.filter(a => a.id !== id));
      window.dispatchEvent(new Event('alertaResolvido'));
    } catch (err) {
      console.error('Erro ao resolver alerta:', err);
      setErroAlertas('Erro ao resolver alerta.');
    }
  };

  const iniciarEdicao = (aluno: HistoricoAluno) => {
    setEditandoId(aluno.id);
    setStatusEdicao(aluno.status);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
  };

  const salvarEdicaoHistorico = async (alunoId: string) => {
    try {
      const payload = {
        data: dataHistorico, 
        alunos: historicoChamada.map(a => ({
          alunoId: a.id,
          status: a.id === alunoId ? statusEdicao : a.status, 
          observacao: ''
        }))
      };

      await api.post('/Frequencia', payload);

      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao salvar alteração no histórico:', error);
      alert('Erro ao salvar a correção. Verifique a conexão.');
    }
  };

  const formatarDataExibicao = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split('-');
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${dia} de ${meses[parseInt(mes) - 1]} de ${ano}`;
  };

  const handleDownloadAlunos = async () => {
    try {
      setBaixandoAlunos(true);
      const { data } = await api.get('/Alunos');
      
      if (!data || data.length === 0) {
        alert('Nenhum aluno encontrado para exportar.');
        return;
      }
      // Monta o cabeçalho do CSV
      let csvContent = "ID,Nome,Matricula,Email\n";
      // Percorre os alunos e monta as linhas
      data.forEach((aluno: any) => {
        // As aspas protegem contra nomes ou emails que possam ter vírgulas acidentalmente
        const nome = `"${aluno.nome || aluno.Nome || ''}"`;
        const matricula = `"${aluno.matricula || aluno.Matricula || 'Sem matricula'}"`;
        const email = `"${aluno.email || aluno.Email || ''}"`;
        
        csvContent += `${aluno.id || aluno.Id},${nome},${matricula},${email}\n`;
      });

      // Cria o arquivo em memória e força o navegador a fazer o download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_alunos_${hojeISO}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erro ao exportar alunos:', error);
      alert('Erro ao gerar relatório de alunos. Verifique sua conexão.');
    } finally {
      setBaixandoAlunos(false);
    }
  };

  const handleDownloadDisciplinas = async () => {
    try {
      setBaixandoDisciplinas(true);
      const { data } = await api.get('/Disciplinas');
      
      if (!data || data.length === 0) {
        alert('Nenhuma disciplina encontrada para exportar.');
        return;
      }

      // Monta o cabeçalho do CSV
      let csvContent = "ID,Nome,Data Inicio,Data Fim\n";

      // Percorre as disciplinas e monta as linhas
      data.forEach((d: any) => {
        const nome = `"${d.nome || d.Nome || ''}"`;
        // Pegando apenas a data (YYYY-MM-DD) se existir
        const inicio = `"${d.dataInicio ? d.dataInicio.split('T')[0] : ''}"`;
        const fim = `"${d.dataFim ? d.dataFim.split('T')[0] : ''}"`;
        
        csvContent += `${d.id || d.Id},${nome},${inicio},${fim}\n`;
      });

      // Cria o arquivo e baixa
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `matriz_curricular_${hojeISO}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erro ao exportar disciplinas:', error);
      alert('Erro ao gerar matriz curricular. Verifique sua conexão.');
    } finally {
      setBaixandoDisciplinas(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; 
      return (
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xl flex flex-col gap-2">
          <p className="text-gray-900 font-bold border-b border-gray-100 pb-2 mb-1">{`Período: ${label}`}</p>
          <div className="flex flex-col gap-1 text-sm">
            <p className="text-blue-600 font-semibold">Taxa de Frequência: <span className="font-bold text-lg">{data.taxaFrequencia}%</span></p>
            <p className="text-emerald-600 font-medium mt-2">Total de Presenças: <span className="font-bold">{data.totalPresencas}</span></p>
            <p className="text-rose-600 font-medium">Total de Faltas: <span className="font-bold">{data.totalFaltas}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 mt-2">Exporte dados em massa e analise os indicadores acadêmicos.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Menu Lateral */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-2">
            <button onClick={() => handleTrocarAba('exportacao')} className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'exportacao' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FileText className="w-5 h-5 mr-3" />
              Exportação de Dados
            </button>
            
            <button onClick={() => handleTrocarAba('dashboards')} className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'dashboards' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
              <BarChart2 className="w-5 h-5 mr-3" />
              Dashboards Analíticos
            </button>

            {!isProfessor && (
              <>
                <button onClick={() => handleTrocarAba('historico')} className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'historico' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Clock className="w-5 h-5 mr-3" />
                  Histórico de Chamadas
                </button>

                <button onClick={() => handleTrocarAba('alertas')} className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'alertas' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  Alertas de Infrequência
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Área de Conteúdo Renderizada */}
        <div className="flex-1">
          
          {/* Sessão 1: Exportação */}
          {abaAtiva === 'exportacao' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-opacity duration-300">
               {/* Mantido igual... (Encurtado visualmente para focar no histórico) */}
               <h2 className="text-xl font-bold text-gray-900 mb-6">Módulos de Exportação</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Alunos */}
                 <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-start hover:border-blue-300 hover:shadow-md transition-all bg-gray-50/30">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mb-4"><Download className="w-6 h-6" /></div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Relatório de Alunos</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1">Exporte a base de alunos e os indicadores de presença vigentes no sistema.</p>
                  <button onClick={handleDownloadAlunos} disabled={baixandoAlunos} className="w-full bg-[#0A0F1C] hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" /> Baixar CSV (Alunos)
                  </button>
                 </div>
                 {/* Disciplinas */}
                 <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-start hover:border-blue-300 hover:shadow-md transition-all bg-gray-50/30">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mb-4"><BookOpen className="w-6 h-6" /></div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Matriz Curricular</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1">Exporta a relação de disciplinas, professores e horários.</p>
                  <button onClick={handleDownloadDisciplinas} disabled={baixandoDisciplinas} className="w-full bg-[#0A0F1C] hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" /> Baixar CSV (Disciplinas)
                  </button>
                 </div>
               </div>
            </div>
          )}

          {/* Sessão 2: Dashboards Analíticos */}
          {abaAtiva === 'dashboards' && (
             <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                {/* Mantido igual... */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg"><Activity className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Evolução Histórica da Frequência</h2>
                    <p className="text-sm text-gray-500 mt-1">Acompanhamento mês a mês da taxa de presença acadêmica global</p>
                  </div>
                </div>
                <div className="w-full h-80 mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dadosEvolucao} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="periodo" tick={{ fill: '#6B7280', fontSize: 13 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: '#6B7280', fontSize: 13 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line name="Taxa Global de Frequência" type="monotone" dataKey="taxaFrequencia" stroke="#2563EB" strokeWidth={4} dot={{ r: 6, fill: '#FFFFFF', stroke: '#2563EB', strokeWidth: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                </div>
             </div>
          )}

          {/* NOVA SESSÃO: Histórico de Chamadas (Só Coordenação) */}
          {abaAtiva === 'historico' && !isProfessor && (
            <div className="transition-opacity duration-300">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900">Histórico de Chamadas</h2>
                </div>
                <p className="text-gray-500 mt-1 ml-9">Consulte e edite chamadas realizadas anteriormente</p>
              </div>

              {/* Filtro Cinza (Cabeçalho do Histórico) */}
              <div className="bg-[#F3F4F6] rounded-xl p-5 mb-6 flex flex-col md:flex-row items-end gap-6 border border-gray-200">
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Data da Chamada</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input 
                      type="date" 
                      value={dataHistorico}
                      max={hojeISO}
                      onChange={(e) => setDataHistorico(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Responsável pela Alteração</label>
                  <input 
                    type="text" 
                    value={responsavelEdicao}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-200 rounded-md py-2.5 px-4 text-sm font-bold text-gray-600 cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex justify-end">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Registros</p>
                    <p className="text-3xl font-black text-gray-900">{historicoChamada.length}</p>
                  </div>
                </div>
              </div>

              {/* Listagem de Alunos */}
              {carregandoHistorico ? (
                <div className="py-20 text-center text-gray-500 font-medium bg-white rounded-xl border border-gray-200">Sincronizando registros da data...</div>
              ) : historicoChamada.length === 0 ? (
                <div className="py-20 text-center text-gray-500 bg-white rounded-xl border border-gray-200">Nenhum registro encontrado para esta data.</div>
              ) : (
                <div className="space-y-6">
                  {historicoChamada.map((aluno) => (
                    <div key={aluno.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Cabeçalho do Aluno */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">{aluno.nome}</h3>
                        <p className="text-sm text-gray-500">Matrícula: {aluno.matricula.substring(0, 8).toUpperCase()} • {aluno.email}</p>
                      </div>

                      {/* Sub-Tabela do Registro */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 bg-gray-50">
                              <th className="py-2 px-4 rounded-tl-md rounded-bl-md w-1/4">Data da Chamada</th>
                              <th className="py-2 px-4 w-1/4">Status</th>
                              <th className="py-2 px-4 w-1/3">Última Modificação</th>
                              <th className="py-2 px-4 rounded-tr-md rounded-br-md text-right w-32">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr className="border-b border-gray-50 last:border-0">
                              <td className="py-4 px-4 font-medium text-gray-800">
                                {formatarDataExibicao(dataHistorico)}
                              </td>
                              
                              <td className="py-4 px-4">
                                {editandoId === aluno.id ? (
                                  <select 
                                    value={statusEdicao}
                                    onChange={(e) => setStatusEdicao(Number(e.target.value))}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 shadow-sm"
                                  >
                                    <option value={0}>Presente</option>
                                    <option value={1}>Ausente</option>
                                    <option value={2}>Justificado</option>
                                  </select>
                                ) : (
                                  aluno.status === 1 ? (
                                    <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md border border-red-100">Ausente</span>
                                  ) : aluno.status === 2 ? (
                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100">Justificado</span>
                                  ) : (
                                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md border border-green-100">Presente</span>
                                  )
                                )}
                              </td>

                              <td className="py-4 px-4 text-gray-500 text-xs whitespace-pre-line leading-relaxed">
                                {aluno.ultimaModificacao.includes('\n') ? (
                                  <>
                                    <span className="font-bold text-gray-900">{aluno.ultimaModificacao.split('\n')[0]}</span><br/>
                                    {aluno.ultimaModificacao.split('\n')[1]}
                                  </>
                                ) : (
                                  aluno.ultimaModificacao
                                )}
                              </td>

                              <td className="py-4 px-4 text-right">
                                {editandoId === aluno.id ? (
                                  <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => salvarEdicaoHistorico(aluno.id)} className="text-green-600 hover:text-green-800 transition-colors" title="Salvar">
                                      <Check className="w-5 h-5" />
                                    </button>
                                    <button onClick={cancelarEdicao} className="text-red-500 hover:text-red-700 transition-colors" title="Cancelar">
                                      <X className="w-5 h-5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => iniciarEdicao(aluno)} className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-md">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sessão 4: Alertas de Infrequência */}
          {abaAtiva === 'alertas' && !isProfessor && (
             <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-opacity duration-300">
               {/* Mantido igual... */}
               <div className="flex items-center gap-3 mb-6">
                 <div className="bg-red-50 text-red-600 p-2.5 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
                 <div>
                   <h2 className="text-xl font-bold text-gray-900">Alertas de Infrequência</h2>
                   <p className="text-sm text-gray-500 mt-1">Monitore os alunos que estão em risco de reprovação por falta</p>
                 </div>
               </div>
               
               {carregandoAlertas ? (
                 <div className="py-20 text-center text-gray-500">Verificando registros...</div>
               ) : erroAlertas ? (
                 <div className="py-16 text-center text-red-500"><ShieldAlert className="w-16 h-16 mx-auto mb-4" />{erroAlertas}</div>
               ) : alertas.length === 0 ? (
                 <div className="py-16 text-center text-emerald-500"><BellOff className="w-16 h-16 mx-auto mb-4" />Tudo limpo por aqui!</div>
               ) : (
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-gray-200 text-sm font-bold text-gray-900">
                       <th className="pb-3 px-4">Aluno</th>
                       <th className="pb-3 px-4">Disciplina</th>
                       <th className="pb-3 px-4">Mensagem</th>
                       <th className="pb-3 px-4">Data</th>
                       <th className="pb-3 px-4 text-right">Ação</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm text-gray-800">
                     {alertas.map((alerta) => (
                       <tr key={alerta.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                         <td className="py-4 px-4 font-medium text-gray-900">{alerta.alunoNome}</td>
                         <td className="py-4 px-4 text-gray-500">{alerta.disciplinaNome || '-'}</td>
                         <td className="py-4 px-4 text-red-600 font-medium">{alerta.mensagem}</td>
                         <td className="py-4 px-4 text-gray-500">{new Date(alerta.dataCriacao).toLocaleDateString()}</td>
                         <td className="py-4 px-4 text-right">
                           <button onClick={() => handleResolverAlerta(alerta.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium text-xs transition-colors border border-blue-200">
                             <Check className="w-4 h-4" /> Marcar como resolvido
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}