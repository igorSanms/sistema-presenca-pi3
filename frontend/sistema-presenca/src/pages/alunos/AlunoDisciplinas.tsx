import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { alunoService } from '../../services/alunoService';
import { api } from '../../services/api';

interface Disciplina {
  id: string;
  nome: string;
}

export function AlunoDisciplinas() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [alunoNome, setAlunoNome] = useState('Carregando...');
  const [matriculaVisual, setMatriculaVisual] = useState('');
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDados() {
      try {
        setLoading(true);
        // 1. Busca os dados reais do aluno para o cabeçalho
        const dadosAluno = await alunoService.buscarPorId(id!);
        setAlunoNome(dadosAluno.nome);
        setMatriculaVisual(dadosAluno.id ? dadosAluno.id.substring(0, 8).toUpperCase() : 'NOVO');
        
        // 2. Busca o catálogo completo de disciplinas da instituição
        const responseDis = await api.get('/Disciplinas');
        setDisciplinas(responseDis.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados da grade:', error);
        setAlunoNome('Aluno não encontrado');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDados();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <button onClick={() => navigate('/alunos')} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar para Alunos
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Disciplinas de {alunoNome}</h1>
            <p className="text-sm text-gray-500 mt-1">Matrícula: {matriculaVisual} • Vinculado automaticamente à grade unificada do cursinho.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 font-medium">Sincronizando disciplinas registradas...</div>
        ) : disciplinas.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-gray-100 rounded-xl bg-gray-50/50">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma disciplina localizada</h3>
            <p className="text-sm text-gray-500">Cadastre disciplinas no Painel para que apareçam na grade dos alunos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-900">
                  <th className="py-4 px-6">Identificador</th>
                  <th className="py-4 px-6">Nome da Matéria</th>
                  <th className="py-4 px-6 text-center">Vínculo</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {disciplinas.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs">{m.id.substring(0, 8).toUpperCase()}</td>
                    <td className="py-4 px-6 font-bold">{m.nome}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Matriculado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}