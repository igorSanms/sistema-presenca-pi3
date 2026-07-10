import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Trash2, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { alunoService } from '../../services/alunoService';

// Tipos para nossa simulação
interface Disciplina {
  id: number;
  nome: string;
  categoria: string;
  nivel: string;
}

interface Matricula {
  id: number;
  disciplina: Disciplina;
  dataMatricula: string;
}

// Simulação do Banco de Dados de Disciplinas Disponíveis
const DISCIPLINAS_MOCK: Disciplina[] = [
  { id: 1, nome: 'Python para Data Science', categoria: 'Data Science', nivel: 'Avançado' },
  { id: 2, nome: 'Marketing Digital Avançado', categoria: 'Marketing', nivel: 'Intermediário' },
  { id: 3, nome: 'Banco de Dados PostgreSQL', categoria: 'Programação', nivel: 'Intermediário' },
  { id: 4, nome: 'Yoga para Iniciantes', categoria: 'Bem-estar', nivel: 'Iniciante' },
  { id: 5, nome: 'Desenvolvimento Web Completo', categoria: 'Programação', nivel: 'Intermediário' },
  { id: 6, nome: 'Design UX/UI Fundamentos', categoria: 'Design', nivel: 'Iniciante' },
];

export function AlunoDisciplinas() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [alunoNome, setAlunoNome] = useState('Carregando...');
  const [matriculaVisual, setMatriculaVisual] = useState('');
  
  // Estados para as matrículas e o modal
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca o nome do aluno real na API
  useEffect(() => {
    const buscarDadosAluno = async () => {
      try {
        const dados = await alunoService.buscarPorId(id!);
        setAlunoNome(dados.nome);
        setMatriculaVisual(dados.id ? dados.id.substring(0, 8).toUpperCase() : 'NOVO');
      } catch (error) {
        console.error('Erro ao carregar aluno:', error);
        setAlunoNome('Aluno não encontrado');
      }
    };
    buscarDadosAluno();
  }, [id]);

  // Função para simular a matrícula
  const matricularAluno = (disciplina: Disciplina) => {
    // Verifica se já está matriculado
    if (matriculas.some(m => m.disciplina.id === disciplina.id)) {
      alert('Aluno já matriculado nesta disciplina!');
      return;
    }

    const novaMatricula: Matricula = {
      id: Date.now(),
      disciplina: disciplina,
      dataMatricula: new Date().toLocaleDateString('pt-BR') // Pega a data de hoje formatada
    };

    setMatriculas([...matriculas, novaMatricula]);
    setIsModalOpen(false); // Fecha o modal após o clique
  };

  // Função para simular a exclusão da matrícula
  const removerMatricula = (idMatricula: number) => {
    if (window.confirm('Deseja remover este aluno da disciplina?')) {
      setMatriculas(matriculas.filter(m => m.id !== idMatricula));
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <button onClick={() => navigate('/alunos')} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar para Alunos
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative">
        
        {/* Cabeçalho da Tela */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Disciplinas de {alunoNome}</h1>
            <p className="text-sm text-gray-500 mt-1">Matrícula: {matriculaVisual}</p>
          </div>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)} className="bg-[#0A0F1C] hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center w-auto">
            <Plus className="w-4 h-4 mr-2" /> Matricular em Disciplina
          </Button>
        </div>

        {/* Lógica de Tela Vazia ou Tabela */}
        {matriculas.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-gray-100 rounded-xl bg-gray-50/50">
            <CalendarIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma matrícula</h3>
            <p className="text-sm text-gray-500 mb-6">Este aluno ainda não está matriculado em nenhuma disciplina</p>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)} className="bg-[#0A0F1C] hover:bg-gray-800 text-white px-6 py-2 rounded-md flex items-center justify-center w-auto">
              <Plus className="w-4 h-4 mr-2" /> Matricular em Disciplina
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-900">
                  <th className="py-4 px-6">Disciplina</th>
                  <th className="py-4 px-6">Categoria</th>
                  <th className="py-4 px-6 text-center">Nível</th>
                  <th className="py-4 px-6">Data de Matrícula</th>
                  <th className="py-4 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {matriculas.map((matricula) => (
                  <tr key={matricula.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold">{matricula.disciplina.nome}</td>
                    <td className="py-4 px-6 text-gray-500">{matricula.disciplina.categoria}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {matricula.disciplina.nivel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{matricula.dataMatricula}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => removerMatricula(matricula.id)} title="Remover Matrícula" className="text-red-400 hover:text-red-600 transition-colors">
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

      {/* MODAL DE MATRÍCULA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header do Modal */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Matricular Aluno</h2>
                <p className="text-sm text-gray-500 mt-1">Selecione uma disciplina para matricular {alunoNome}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Disciplinas (Scrollável) */}
            <div className="p-6 overflow-y-auto flex flex-col gap-3">
              {DISCIPLINAS_MOCK.map((disciplina) => (
                <div 
                  key={disciplina.id} 
                  onClick={() => matricularAluno(disciplina)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all bg-white"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{disciplina.nome}</h4>
                    <p className="text-xs text-gray-500 mt-1">{disciplina.categoria}</p>
                  </div>
                  <span className="bg-[#0A0F1C] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {disciplina.nivel}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}