import { useState, useEffect } from 'react';
import { Calendar, FileText, RefreshCw, GraduationCap, Users, UserCheck, History, Bell, LogOut } from 'lucide-react';
import api from '../services/api';
import type { StudentObservation } from '../types/relatorio';

export function Relatorios() {
  const [viewMode, setViewMode] = useState<'por-data' | 'todas'>('por-data');
  const [date, setDate] = useState('2026-06-18');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentObservation[]>([]);

  useEffect(() => {
    async function loadRelatorios() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<StudentObservation[]>(
          `/Relatorios/observacoes?mode=${viewMode}&date=${date}`
        );
        setData(response.data);
      } catch (err) {
        console.error('Erro ao buscar relatórios:', err);
        setError('Não foi possível carregar os relatórios. Tente novamente mais tarde.');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadRelatorios();
  }, [viewMode, date]);

  // Cálculos de contadores com base nos dados reais retornados
  const totalObservations = data.reduce((acc, current) => acc + (current.observations?.length || 0), 0);
  const studentsWithObservations = data.filter(student => student.observations?.length > 0).length;

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR (NAV) */}
      <nav className="w-full bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0f172a] text-white p-2 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-950 leading-tight">Sistema Acadêmico</h1>
            <span className="text-xs text-gray-400 font-normal">Gestão de Cursos, Alunos e Professores</span>
          </div>
        </div>

        {/* Links de Menu */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg">
            <GraduationCap className="w-3.5 h-3.5" /> Cursos
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg">
            <Users className="w-3.5 h-3.5" /> Alunos
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg">
            <UserCheck className="w-3.5 h-3.5" /> Professores
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-gray-900 shadow-sm border border-gray-200/40 rounded-lg">
            <FileText className="w-3.5 h-3.5 text-gray-900" /> Relatórios
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg">
            <History className="w-3.5 h-3.5" /> Histórico
          </button>
        </div>

        {/* Perfil e Notificações */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Bell className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 text-right">
            <div>
              <p className="text-xs font-bold text-gray-900 leading-none">Administrador</p>
              <span className="text-[11px] text-gray-400">admin@sistema.com</span>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-gray-900">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* COMPONENTE DE RELATÓRIOS */}
      <div className="p-6 w-full max-w-[1400px] mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          
          {/* CABEÇALHO DO RELATÓRIO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <FileText className="w-5 h-5 text-gray-700" /> Relatório de Observações
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Visualize todas as observações registradas nas chamadas
              </p>
            </div>

            {/* CONTROLES DE ABAS */}
            <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-center">
              <button
                onClick={() => setViewMode('por-data')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'por-data' 
                    ? 'bg-black text-white shadow-sm' 
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Por Data
              </button>
              <button
                onClick={() => setViewMode('todas')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'todas' 
                    ? 'bg-black text-white shadow-sm' 
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Todas
              </button>
            </div>
          </div>

          {/* SEÇÃO DINÂMICA DE FILTROS / CONTADORES */}
          <div className="bg-[#f1f3f5] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {viewMode === 'por-data' ? (
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-bold text-gray-700 mb-1">Selecione a Data</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-8 flex-1">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total de Observações</span>
                  <span className="text-2xl font-black text-gray-900">{loading ? '...' : totalObservations}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alunos com Observações</span>
                  <span className="text-2xl font-black text-gray-900">{loading ? '...' : studentsWithObservations}</span>
                </div>
              </div>
            )}

            {viewMode === 'por-data' && (
              <div className="text-center px-6 border-t sm:border-t-0 sm:border-l border-gray-300/60 pt-4 sm:pt-0">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Observações</span>
                <span className="text-2xl font-black text-gray-900">{loading ? '...' : totalObservations}</span>
              </div>
            )}
          </div>

          {/* RENDEREIZAÇÃO DOS ESTADOS (LOADING / ERRO / VAZIO / LISTA) */}
          {loading ? (
            <div className="py-20 flex justify-center items-center text-gray-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Carregando observações...
            </div>
          ) : error ? (
            /* TRATAMENTO DE ERRO DE CONEXÃO/API */
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-red-500">{error}</p>
            </div>
          ) : data.length === 0 ? (
            /* ESTADO VAZIO REAL */
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="text-gray-300 mb-4">
                <FileText className="w-14 h-14 stroke-[1.2]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Nenhuma observação encontrada</h3>
              <p className="text-sm text-gray-400 mt-1">
                {viewMode === 'por-data' 
                  ? 'Não há observações registradas para esta data' 
                  : 'Não há observações registradas no sistema'}
              </p>
            </div>
          ) : (
            /* LISTA DE ALUNOS REAL */
            <div className="space-y-6">
              {data.map((student) => (
                <div key={student.id} className="border border-gray-200/70 rounded-xl p-5 bg-white">
                  
                  {/* Top Card do Aluno */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{student.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Matrícula: {student.registration} • <span className="text-gray-400/80">{student.email}</span>
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {student.observations?.length || 0} {(student.observations?.length === 1) ? 'observação' : 'observações'}
                    </span>
                  </div>

                  {/* Lista Interna de Blocos de Notas */}
                  <div className="space-y-3">
                    {student.observations?.map((obs) => (
                      <div key={obs.id} className="bg-gray-50/70 border border-gray-100 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {obs.date}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {obs.createdAt}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed pl-5 font-normal">
                          {obs.text}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}