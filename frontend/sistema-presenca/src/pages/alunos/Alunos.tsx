import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { alunoService, type AlunoData } from '../../services/alunoService';

export function Alunos() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<AlunoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const perfil = localStorage.getItem('@SistemaPresenca:perfil');

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      const dados = await alunoService.listarTodos();
      setAlunos(dados || []); 
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      alert('Não foi possível carregar a lista de alunos.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno ${nome}?`)) {
      try {
        await alunoService.excluir(id);
        setAlunos(alunos.filter(aluno => aluno.id !== id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir aluno. Pode haver dados vinculados a ele.');
      }
    }
  };

  const alunosFiltrados = alunos.filter(aluno => {
    const termo = termoBusca.toLowerCase();
    return (
      (aluno.nome && aluno.nome.toLowerCase().includes(termo)) ||
      (aluno.id && aluno.id.toLowerCase().includes(termo)) ||
      (aluno.email && aluno.email.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1310px] mx-auto w-full">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gerenciar Alunos</h1>
          <p className="text-sm text-gray-500 mt-1">Cadastre e gerencie os alunos do sistema</p>
        </div>
        
        {perfil === 'Coordenacao' && (
          <div className="w-40">
            <Button variant="secondary" onClick={() => navigate('/alunos/novo')} className="bg-[#0A0F1C] hover:bg-gray-800 text-white w-full py-2 rounded-md font-medium text-sm flex justify-center items-center">
              <Plus className="w-4 h-4 mr-2" /> Novo Aluno
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-100 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="Buscar por nome, email ou matrícula..."
          />
        </div>

        <p className="text-sm text-gray-500 mb-4">{alunosFiltrados.length} {alunosFiltrados.length === 1 ? 'aluno encontrado' : 'alunos encontrados'}</p>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Carregando alunos do banco de dados...</div>
        ) : alunosFiltrados.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum aluno encontrado</h3>
            <p className="text-sm text-gray-500 mb-6">Ajuste os parâmetros de busca ou crie um novo registro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm font-bold text-gray-900">
                  <th className="pb-3 px-4">Matrícula</th>
                  <th className="pb-3 px-4">Nome</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Telefone</th>
                  <th className="pb-3 px-4 text-center">Presenças</th>
                  <th className="pb-3 px-4 text-center">Faltas</th>
                  <th className="pb-3 px-4 text-center">Justificativas</th>
                  <th className="pb-3 px-4 text-center">Total Aulas</th>
                  {perfil === 'Coordenacao' && <th className="pb-3 px-4 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {alunosFiltrados.map((aluno) => {
                  const matricula = aluno.matricula || (aluno.id ? aluno.id.substring(0, 8).toUpperCase() : 'NOVO');
                  
                  return (
                    <tr key={aluno.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-bold">{matricula}</td>
                      <td className="py-4 px-4">{aluno.nome}</td>
                      <td className="py-4 px-4 text-gray-500">{aluno.email}</td>
                      <td className="py-4 px-4 text-gray-500">{aluno.telefone || 'Não informado'}</td>
                      <td className="py-4 px-4 text-center text-green-600 font-medium">{aluno.presencas || 0}</td>
                      <td className="py-4 px-4 text-center text-red-600 font-medium">{aluno.faltasReais || 0}</td>
                      <td className="py-4 px-4 text-center text-blue-600 font-medium">{aluno.faltasJustificadas || 0}</td>
                      <td className="py-4 px-4 text-center font-medium">{(aluno.presencas || 0) + (aluno.faltasReais || 0) + (aluno.faltasJustificadas || 0)}</td>
                      {perfil === 'Coordenacao' && (
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-3 text-gray-400">
                            <button onClick={() => navigate(`/alunos/${aluno.id}/disciplinas`)} title="Grade Curricular" className="hover:text-gray-900 transition-colors">
                              <BookOpen className="w-4 h-4" />
                            </button>
                            <button onClick={() => navigate(`/alunos/editar/${aluno.id}`)} title="Editar Aluno" className="hover:text-blue-600 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleExcluir(aluno.id!, aluno.nome)} title="Excluir Aluno" className="hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}