import { useState, useEffect } from 'react';
import { Download, BarChart2, FileText, BookOpen, Activity, History, AlertTriangle, ShieldAlert, Check, BellOff } from 'lucide-react';
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

export function Relatorios() {
  const perfil = localStorage.getItem('@SistemaPresenca:perfil');
  const isProfessor = perfil === 'Professor';
  
  const [searchParams, setSearchParams] = useSearchParams();
  const abaQuery = searchParams.get('aba');
  const [abaAtiva, setAbaAtiva] = useState(abaQuery || 'exportacao');

  const handleTrocarAba = (aba: string) => {
    setAbaAtiva(aba);
    setSearchParams({ aba });
  };
  
  // Estados de loading para exportações
  const [baixandoAlunos, setBaixandoAlunos] = useState(false);
  const [baixandoDisciplinas, setBaixandoDisciplinas] = useState(false);

  // Estados e Loading para Dashboards Analíticos
  const [dadosEvolucao, setDadosEvolucao] = useState([]);
  const [carregandoDashboard, setCarregandoDashboard] = useState(false);

  // Estados para Histórico de Atividades
  const [atividades, setAtividades] = useState<any[]>([]);
  const [carregandoAtividades, setCarregandoAtividades] = useState(false);

  // Estados para Alertas
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [carregandoAlertas, setCarregandoAlertas] = useState(false);
  const [erroAlertas, setErroAlertas] = useState<string | null>(null);

  useEffect(() => {
    if (abaQuery && abaQuery !== abaAtiva) {
      setAbaAtiva(abaQuery);
    }
  }, [abaQuery]);

  // Efeito disparado apenas quando a aba de dashboards é acessada
  useEffect(() => {
    if (abaAtiva === 'dashboards') {
      const loadDadosDashboard = async () => {
        try {
          setCarregandoDashboard(true);
          const { data } = await api.get('/Relatorios/Frequencia/Evolucao');
          setDadosEvolucao(data);
        } catch (error) {
          console.error("Erro ao buscar dados do dashboard:", error);
          alert("Não foi possível carregar os dados analíticos.");
        } finally {
          setCarregandoDashboard(false);
        }
      };
      
      loadDadosDashboard();
    } else if (abaAtiva === 'atividades') {
      const loadAtividades = async () => {
        try {
          setCarregandoAtividades(true);
          const { data } = await api.get('/Relatorios/Atividades');
          setAtividades(data);
        } catch (error) {
          console.error("Erro ao buscar atividades:", error);
        } finally {
          setCarregandoAtividades(false);
        }
      };
      
      loadAtividades();
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
    }
  }, [abaAtiva, isProfessor]);

  const handleResolverAlerta = async (id: string) => {
    try {
      await api.put(`/Alertas/${id}/Resolver`);
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Erro ao resolver alerta:', err);
      setErroAlertas('Erro ao resolver alerta.');
    }
  };

  // Lógica de Download Blob para Alunos
  const handleDownloadAlunos = async () => {
    try {
      setBaixandoAlunos(true);
      const response = await api.get('/Relatorios/Alunos/Exportar', {
        responseType: 'blob'
      });

      const nomeArquivo = 'relatorio_alunos.csv';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar relatório de alunos:', error);
      alert('Erro ao realizar o download do relatório de alunos. Tente novamente mais tarde.');
    } finally {
      setBaixandoAlunos(false);
    }
  };

  // Lógica de Download Blob para Disciplinas
  const handleDownloadDisciplinas = async () => {
    try {
      setBaixandoDisciplinas(true);
      const response = await api.get('/Relatorios/Disciplinas/Exportar', {
        responseType: 'blob'
      });

      const nomeArquivo = 'relatorio_disciplinas.csv';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar relatório de disciplinas:', error);
      alert('Erro ao realizar o download do relatório de disciplinas. Tente novamente mais tarde.');
    } finally {
      setBaixandoDisciplinas(false);
    }
  };

  // Tooltip Profissional Personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Extraindo os dados da raiz injetada pelo Recharts
      const data = payload[0].payload; 
      
      return (
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xl flex flex-col gap-2">
          <p className="text-gray-900 font-bold border-b border-gray-100 pb-2 mb-1">{`Período: ${label}`}</p>
          <div className="flex flex-col gap-1 text-sm">
            <p className="text-blue-600 font-semibold">
              Taxa de Frequência: <span className="font-bold text-lg">{data.taxaFrequencia}%</span>
            </p>
            <p className="text-emerald-600 font-medium mt-2">
              Total de Presenças: <span className="font-bold">{data.totalPresencas}</span>
            </p>
            <p className="text-rose-600 font-medium">
              Total de Faltas: <span className="font-bold">{data.totalFaltas}</span>
            </p>
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
            
            {/* Aba Exportação */}
            <button
              onClick={() => handleTrocarAba('exportacao')}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'exportacao' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FileText className="w-5 h-5 mr-3" />
              Exportação de Dados
            </button>
            
            {/* Aba Dashboards Desbloqueada */}
            <button
              onClick={() => handleTrocarAba('dashboards')}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'dashboards' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <BarChart2 className="w-5 h-5 mr-3" />
              Dashboards Analíticos
            </button>

            {/* Aba Histórico de Atividades */}
            <button
              onClick={() => handleTrocarAba('atividades')}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'atividades' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <History className="w-5 h-5 mr-3" />
              Histórico de Atividades
            </button>

            {/* Aba Alertas (Apenas Coordenação) */}
            {!isProfessor && (
              <button
                onClick={() => handleTrocarAba('alertas')}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'alertas' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <AlertTriangle className="w-5 h-5 mr-3" />
                Alertas de Infrequência
              </button>
            )}

          </nav>
        </div>

        {/* Área de Conteúdo Renderizada */}
        <div className="flex-1">
          
          {/* Sessão 1: Exportação */}
          {abaAtiva === 'exportacao' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-opacity duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Módulos de Exportação</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Alunos */}
                <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-start hover:border-blue-300 hover:shadow-md transition-all bg-gray-50/30">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mb-4">
                    <Download className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Relatório de Alunos</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1">
                    {isProfessor 
                      ? 'Exporte a base de alunos vinculados às suas disciplinas, incluindo informações de matrícula e contato. O arquivo é gerado em tempo real no formato nativo CSV.' 
                      : 'Exporte a base completa de alunos cadastrados, incluindo informações de matrícula, contato e status da conta. O arquivo é gerado em tempo real no formato nativo CSV.'}
                  </p>
                  
                  <button 
                    onClick={handleDownloadAlunos}
                    disabled={baixandoAlunos}
                    className="w-full bg-[#0A0F1C] hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {baixandoAlunos ? 'Gerando e Baixando...' : (
                      <><Download className="w-4 h-4 mr-2" /> Baixar CSV (Alunos)</>
                    )}
                  </button>
                </div>

                {/* Card Matriz Curricular */}
                <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-start hover:border-blue-300 hover:shadow-md transition-all bg-gray-50/30">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Matriz Curricular</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1">
                    {isProfessor
                      ? 'Exporta a relação das disciplinas ministradas por você, contendo horários das aulas e períodos vigentes.'
                      : 'Exporta a relação completa de disciplinas cadastradas no sistema, contendo professores vinculados, horários das aulas e períodos vigentes.'}
                  </p>
                  
                  <button 
                    onClick={handleDownloadDisciplinas}
                    disabled={baixandoDisciplinas}
                    className="w-full bg-[#0A0F1C] hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {baixandoDisciplinas ? 'Gerando e Baixando...' : (
                      <><Download className="w-4 h-4 mr-2" /> Baixar CSV (Disciplinas)</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sessão 2: Dashboards Analíticos */}
          {abaAtiva === 'dashboards' && (
            <div className="flex flex-col gap-6 transition-opacity duration-300">
              
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Evolução Histórica da Frequência</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {isProfessor 
                        ? 'Acompanhamento mês a mês da taxa de presença em suas turmas' 
                        : 'Acompanhamento mês a mês da taxa de presença acadêmica global'}
                    </p>
                  </div>
                </div>

                {carregandoDashboard ? (
                  // Estado de Carregamento Esqueleto Elegante
                  <div className="w-full h-80 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <Activity className="w-8 h-8 text-blue-300 animate-pulse mb-3" />
                    <span className="text-gray-400 font-medium">Buscando dados no servidor...</span>
                  </div>
                ) : dadosEvolucao.length === 0 ? (
                  // Estado Vazio (Nenhuma frequência registrada)
                  <div className="w-full h-80 flex items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    Nenhum registro consolidado encontrado para o gráfico.
                  </div>
                ) : (
                  // O Motor Analítico em Ação (Recharts)
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dadosEvolucao}
                        margin={{ top: 20, right: 30, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        
                        <XAxis 
                          dataKey="periodo" 
                          tick={{ fill: '#6B7280', fontSize: 13 }}
                          tickMargin={12}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        
                        <YAxis 
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                          tick={{ fill: '#6B7280', fontSize: 13 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        
                        <Line 
                          name={isProfessor ? "Sua Taxa de Frequência" : "Taxa Global de Frequência"}
                          type="monotone" 
                          dataKey="taxaFrequencia" 
                          stroke="#2563EB" 
                          strokeWidth={4}
                          dot={{ r: 6, fill: '#FFFFFF', stroke: '#2563EB', strokeWidth: 3 }}
                          activeDot={{ r: 8, fill: '#2563EB', stroke: '#BFDBFE', strokeWidth: 4 }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
            </div>
          )}

          {/* Sessão 3: Histórico de Atividades */}
          {abaAtiva === 'atividades' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-opacity duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Histórico de Atividades</h2>
                  <p className="text-sm text-gray-500 mt-1">Trilha de auditoria das ações realizadas no sistema.</p>
                </div>
              </div>

              {carregandoAtividades ? (
                <div className="flex justify-center p-8 text-gray-400">Carregando atividades...</div>
              ) : atividades.length === 0 ? (
                <div className="flex justify-center p-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  Nenhuma atividade recente encontrada.
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto pr-4">
                  <div className="relative border-l-2 border-gray-100 ml-3 md:ml-6 space-y-8 pb-4">
                    {atividades.map((ativ) => (
                      <div key={ativ.id} className="relative pl-6 sm:pl-8 group">
                        <div className="absolute -left-1.5 bg-blue-500 rounded-full w-3 h-3 ring-4 ring-white mt-1.5"></div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-1 gap-2">
                          <div className="font-bold text-gray-900">{ativ.acao}</div>
                          <time className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            {new Date(ativ.dataHora).toLocaleString('pt-BR')}
                          </time>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{ativ.descricao}</div>
                        <div className="text-xs font-medium text-blue-600 mt-2">
                          Autor: <span className="font-bold">{ativ.usuarioNome}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sessão 4: Alertas de Infrequência */}
          {abaAtiva === 'alertas' && !isProfessor && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-opacity duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-50 text-red-600 p-2.5 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Alertas de Infrequência</h2>
                  <p className="text-sm text-gray-500 mt-1">Monitore os alunos que estão em risco de reprovação por falta</p>
                </div>
              </div>

              {carregandoAlertas ? (
                <div className="py-20 text-center text-gray-500">
                  Verificando registros de faltas...
                </div>
              ) : erroAlertas ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Erro na Consulta</h3>
                  <p className="text-sm text-gray-500">{erroAlertas}</p>
                </div>
              ) : alertas.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <BellOff className="w-16 h-16 text-emerald-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Tudo limpo por aqui!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Não há nenhum alerta de infrequência pendente no momento.
                  </p>
                </div>
              ) : (
                // Tabela Preenchida
                <div className="overflow-x-auto">
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
                        <tr
                          key={alerta.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {alerta.alunoNome}
                          </td>
                          <td className="py-4 px-4">
                            {alerta.disciplinaNome}
                          </td>
                          <td className="py-4 px-4 text-red-600 font-medium">
                            {alerta.mensagem}
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            {new Date(alerta.dataCriacao).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleResolverAlerta(alerta.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium text-xs transition-colors border border-blue-200 cursor-pointer"
                              title="Marcar como resolvido"
                            >
                              <Check className="w-4 h-4" />
                              Marcar como resolvido
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
