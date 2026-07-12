import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Trash2, X, Save } from 'lucide-react';
import { Button } from '../../components/Button';
import { alunoService } from '../../services/alunoService';
import { api } from '../../services/api';

interface DisciplinaSimplificada {
  id: string;
  nome: string;
}

interface DisciplinaCompleta {
  id: string;
  nome: string;
  professorNome: string;
  horarios: string;
}

export function AlunoDisciplinas() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [alunoNome, setAlunoNome] = useState('Carregando...');
  const [matriculaVisual, setMatriculaVisual] = useState('');
  
  // Lista de disciplinas em que o aluno está matriculado no momento (banco de dados)
  const [matriculas, setMatriculas] = useState<DisciplinaSimplificada[]>([]);
  
  // Catálogo com a totalidade de disciplinas registradas no sistema
  const [todasDisciplinas, setTodasDisciplinas] = useState<DisciplinaCompleta[]>([]);
  
  // Buffer temporário contendo os IDs das disciplinas marcadas no Modal
  const [selecionadasModal, setSelecionadasModal] = useState<string[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Carrega e sincroniza todos os dados dinâmicos do banco
  const loadDados = async () => {
    try {
      // 1. Busca os dados do aluno (retornando também as disciplinas matriculadas)
      const dadosAluno = await alunoService.buscarPorId(id!);
      setAlunoNome(dadosAluno.nome);
      setMatriculaVisual(dadosAluno.id ? dadosAluno.id.substring(0, 8).toUpperCase() : 'NOVO');
      setMatriculas(dadosAluno.disciplinas || []);
      
      // 2. Busca todas as disciplinas cadastradas no sistema
      const responseDis = await api.get('/Disciplinas');
      setTodasDisciplinas(responseDis.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setAlunoNome('Aluno não encontrado');
    }
  };

  useEffect(() => {
    loadDados();
  }, [id]);

  // Abre o modal e inicializa a lista de selecionados com os IDs das matrículas reais do aluno
  const handleAbrirModal = () => {
    setSelecionadasModal(matriculas.map(m => m.id));
    setIsModalOpen(true);
  };

  // Alterna o estado do checkbox (liga/desliga)
  const handleToggleCheckbox = (disciplinaId: string) => {
    setSelecionadasModal(prev => 
      prev.includes(disciplinaId) 
        ? prev.filter(id => id !== disciplinaId) 
        : [...prev, disciplinaId]
    );
  };

  // Envia a lista unificada de IDs para a API sincronizar via PUT
  const handleSalvarMatriculas = async () => {
    try {
      setSalvando(true);
      await api.put(`/Alunos/${id}/Matriculas`, selecionadasModal);
      alert('Matrículas atualizadas com sucesso!');
      setIsModalOpen(false);
      await loadDados(); // Recarrega os dados reais e atualiza a tela
    } catch (error) {
      console.error('Erro ao salvar matrículas:', error);
      alert('Erro ao tentar salvar as matrículas do aluno.');
    } finally {
      setSalvando(false);
    }
  };

  // Remoção direta na lista da tabela principal
  const removerMatricula = async (disciplinaId: string) => {
    if (window.confirm('Deseja remover este aluno da disciplina?')) {
      try {
        // Exclui o ID selecionado da lista e dispara a atualização para o backend
        const novosIds = matriculas.filter(m => m.id !== disciplinaId).map(m => m.id);
        await api.put(`/Alunos/${id}/Matriculas`, novosIds);
        alert('Matrícula removida com sucesso!');
        await loadDados();
      } catch (error) {
        console.error('Erro ao remover matrícula:', error);
        alert('Erro ao tentar remover a matrícula.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <button onClick={() => navigate('/alunos')} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar para Alunos
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Disciplinas de {alunoNome}</h1>
            <p className="text-sm text-gray-500 mt-1">Matrícula: {matriculaVisual}</p>
          </div>
          <Button variant="secondary" onClick={handleAbrirModal} className="bg-[#0A0F1C] hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center w-auto">
            <Plus className="w-4 h-4 mr-2" /> Matricular / Gerenciar
          </Button>
        </div>

        {/* Tabela de Matrículas Ativas */}
        {matriculas.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-gray-100 rounded-xl bg-gray-50/50">
            <CalendarIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma matrícula</h3>
            <p className="text-sm text-gray-500 mb-6">Este aluno ainda não está matriculado em nenhuma disciplina</p>
            <Button variant="secondary" onClick={handleAbrirModal} className="bg-[#0A0F1C] hover:bg-gray-800 text-white px-6 py-2 rounded-md flex items-center justify-center w-auto">
              <Plus className="w-4 h-4 mr-2" /> Vincular Disciplinas
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-900">
                  <th className="py-4 px-6">Disciplina</th>
                  <th className="py-4 px-6">ID da Disciplina</th>
                  <th className="py-4 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {matriculas.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold">{m.nome}</td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs">{m.id}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => removerMatricula(m.id)} title="Remover Matrícula" className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE MATRÍCULA (Catálogo Dinâmico do Banco) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Matricular Aluno</h2>
                <p className="text-sm text-gray-500 mt-1">Marque as disciplinas em que {alunoNome} será matriculado</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Catálogo Geral com Checkboxes */}
            <div className="p-6 overflow-y-auto flex flex-col gap-3 flex-1">
              {todasDisciplinas.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">Nenhuma disciplina cadastrada na instituição.</p>
              ) : (
                todasDisciplinas.map((disciplina) => {
                  const estaMarcada = selecionadasModal.includes(disciplina.id);
                  return (
                    <div 
                      key={disciplina.id} 
                      onClick={() => handleToggleCheckbox(disciplina.id)}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all bg-white hover:shadow-sm ${estaMarcada ? 'border-blue-500 bg-blue-50/5' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={estaMarcada}
                          onChange={() => {}} // Controlado pelo clique do container pai
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none" 
                        />
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{disciplina.nome}</h4>
                          <p className="text-xs text-gray-500 mt-1">Prof. {disciplina.professorNome || 'Sem professor'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-6 border-t border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-gray-300 py-2.5 rounded-lg text-sm text-gray-900 font-medium">
                Cancelar
              </Button>
              <Button onClick={handleSalvarMatriculas} disabled={salvando} className="flex-1 bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center">
                <Save className="w-4 h-4 mr-2" /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}