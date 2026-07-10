import { useState, useEffect } from 'react';
import { Calendar, History, RefreshCw, Edit2, Check, X } from 'lucide-react';
import api from '../services/api'; 
import type { StudentAttendance, AttendanceStatus } from '../types/chamada';
import type { Lesson } from '../types/chamada';

export function HistoricoChamada() {
  const [date, setDate] = useState('2026-06-18');
  const [responsible, setResponsible] = useState('Coordenação');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar a edição em linha
  const [editingKey, setEditingKey] = useState<{ studentId: string; lessonId: string } | null>(null);
  const [tempStatus, setTempStatus] = useState<AttendanceStatus>('Presente');

  // Buscar os dados do histórico baseados nos filtros (Data / Responsável)
  useEffect(() => {
    async function loadHistorico() {
      setLoading(true);
      try {
        const response = await api.get<StudentAttendance[]>(`/Chamadas/historico?data=${date}&responsavel=${responsible}`);
        setStudents(response.data);
      } catch (error) {
        console.error('Erro ao carregar histórico de chamadas:', error);
        // Apenas limpa os dados em caso de erro, sem injetar dados mockados
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }

    loadHistorico();
  }, [date, responsible]);

  const handleEditClick = (studentId: string, lessonId: string, currentStatus: AttendanceStatus) => {
    setEditingKey({ studentId, lessonId });
    setTempStatus(currentStatus);
  };

  const handleSave = async (studentId: string, lessonId: string) => {
    try {
      setStudents(prev => prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            lessons: student.lessons.map((lesson: Lesson) => {
              if (lesson.id === lessonId) {
                const now = new Date();
                const formattedTime = `${now.toLocaleDateString('pt-BR')} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                return {
                  ...lesson,
                  status: tempStatus,
                  lastModification: `${responsible}\n${formattedTime}`
                };
              }
              return lesson;
            })
          };
        }
        return student;
      }));
      setEditingKey(null);
    } catch (error) {
      console.error('Erro ao atualizar o status:', error);
    }
  };

  const getStatusStyle = (status: AttendanceStatus) => {
    switch (status) {
      case 'Presente': return 'bg-green-50 text-green-600 border border-green-200';
      case 'Ausente': return 'bg-red-50 text-red-500 border border-red-200';
      case 'Justificado': return 'bg-blue-50 text-blue-500 border border-blue-200';
    }
  };

  const totalRecords = students.reduce((acc, current) => acc + current.lessons.length, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* TÍTULO DA SEÇÃO */}
      <div className="mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
          <History className="w-5 h-5 text-gray-700" /> Histórico de Chamadas
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Consulte e edite chamadas realizadas anteriormente</p>
      </div>

      {/* FILTROS */}
      <div className="bg-[#f1f3f5] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <label className="block text-xs font-bold text-gray-700 mb-1">Data da Chamada</label>
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

          <div className="flex-1 min-w-[200px] max-w-xs">
            <label className="block text-xs font-bold text-gray-700 mb-1">Responsável pela Alteração</label>
            <select 
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
            >
              <option value="Coordenação">Coordenação</option>
              <option value="Prof. Carlos Santos">Prof. Carlos Santos</option>
              <option value="Nenhum">Nenhum (Simular tela vazia)</option>
            </select>
          </div>
        </div>

        <div className="text-center px-6 border-t sm:border-t-0 sm:border-l border-gray-300/60 pt-4 sm:pt-0">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registros</span>
          <span className="text-2xl font-black text-gray-900">{loading ? '...' : totalRecords}</span>
        </div>
      </div>

      {/* LISTAGEM OU ESTADO VAZIO */}
      {loading ? (
        <div className="py-20 flex justify-center items-center text-gray-400 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Carregando registros...
        </div>
      ) : students.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="text-gray-300 mb-4">
            <RefreshCw className="w-14 h-14 stroke-[1.2]" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Nenhuma chamada encontrada</h3>
          <p className="text-sm text-gray-400 mt-1">Não há registros de presença para o filtro selecionado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {students.map((student) => (
            <div key={student.id} className="border border-gray-200/70 rounded-xl p-5 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{student.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Matrícula: {student.registration} • <span className="text-gray-400/80">{student.email}</span>
                  </p>
                </div>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {student.lessons.length} {student.lessons.length === 1 ? 'aula' : 'aulas'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-2 font-semibold">Curso/Aula</th>
                      <th className="pb-2 font-semibold w-36">Status</th>
                      <th className="pb-2 font-semibold w-56">Última Modificação</th>
                      <th className="pb-2 font-semibold w-20 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {student.lessons.map((lesson: Lesson) => {
                      const isEditing = editingKey?.studentId === student.id && editingKey?.lessonId === lesson.id;

                      return (
                        <tr key={lesson.id} className="text-gray-700">
                          <td className="py-3 font-medium text-gray-900">{lesson.courseName}</td>
                          <td className="py-3">
                            {isEditing ? (
                              <select
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value as AttendanceStatus)}
                                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                              >
                                <option value="Presente">Presente</option>
                                <option value="Ausente">Ausente</option>
                                <option value="Justificado">Justificado</option>
                              </select>
                            ) : (
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusStyle(lesson.status as AttendanceStatus)}`}>
                                {lesson.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-xs text-gray-400 whitespace-pre-line leading-normal">
                            {lesson.lastModification}
                          </td>
                          <td className="py-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleSave(student.id, lesson.id)} className="text-green-600 hover:text-green-700 p-1">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingKey(null)} className="text-red-500 hover:text-red-600 p-1">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => handleEditClick(student.id, lesson.id, lesson.status as AttendanceStatus)} className="text-gray-400 hover:text-gray-700 p-1">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}