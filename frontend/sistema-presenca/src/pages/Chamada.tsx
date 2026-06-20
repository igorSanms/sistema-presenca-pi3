import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

// Interface que reflete o retorno e envio para a API
interface AlunoChamada {
  alunoId: string;
  nome: string;
  status: 0 | 1 | 2 | null;
  observacao: string;
}

export function Chamada() {
  const navigate = useNavigate();
  // Pega o "dia" da URL (ex: /chamada/segunda)
  const { dia } = useParams();
  
  // Estado dataAula inicializado com a data de hoje YYYY-MM-DD
  const hoje = new Date().toISOString().split('T')[0];
  const [dataAula, setDataAula] = useState(hoje);
  const [alunos, setAlunos] = useState<AlunoChamada[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca de Dados (GET)
  useEffect(() => {
    async function loadFrequencia() {
      try {
        const response = await api.get(`/Frequencia/${dataAula}`);
        setAlunos(response.data);
      } catch (error) {
        console.error('Erro ao buscar chamada:', error);
      }
    }
    
    if (dataAula) {
      loadFrequencia();
    }
  }, [dataAula]);

  // Lógica para alternar os checkboxes convertendo para o status da API
  const toggleStatus = (id: string, campo: 'ausente' | 'justificativa') => {
    setAlunos(alunos.map(aluno => {
      if (aluno.alunoId === id) {
        if (campo === 'ausente') {
          // Se já era falta (1), anula. Se não, vira falta (1)
          return { ...aluno, status: aluno.status === 1 ? null : 1 };
        } else if (campo === 'justificativa') {
          // Se já era justificada (2), anula. Se não, vira justificada (2)
          return { ...aluno, status: aluno.status === 2 ? null : 2 };
        }
      }
      return aluno;
    }));
  };

  const handleObsChange = (id: string, obs: string) => {
    setAlunos(alunos.map(aluno => aluno.alunoId === id ? { ...aluno, observacao: obs } : aluno));
  };

  // Salvamento (POST)
  const handleSave = async () => {
    try {
      setLoading(true);
      
      const payload = {
        data: dataAula,
        // Mapeando apenas os alunos que tiveram o status definido
        alunos: alunos
          .filter(a => a.status !== null)
          .map(a => ({
            alunoId: a.alunoId,
            status: a.status,
            observacao: a.observacao || ''
          }))
      };

      await api.post('/Frequencia', payload);
      alert('Chamada salva com sucesso!');
      navigate('/painel');
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
      alert('Erro ao salvar chamada. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  // Matemática dinâmica para o placar no topo
  const total = alunos.length;
  const ausentes = alunos.filter(a => a.status === 1).length;
  const justificados = alunos.filter(a => a.status === 2).length;
  const presentes = total - ausentes - justificados;

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <button onClick={() => navigate('/painel')} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar para Grade de Aulas
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 capitalize">Chamada - {dia || 'Segunda'}</h1>
        <p className="text-sm text-gray-500 mt-1">2 aulas programadas • {total} alunos</p>
      </div>

      {/* Placar de Resumo */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow-sm gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data da Aula</label>
          <div className="relative">
            <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input 
              type="date" 
              value={dataAula}
              onChange={(e) => setDataAula(e.target.value)}
              className="bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        <div className="flex gap-8 text-center bg-white">
          <div><p className="text-xs text-gray-500 font-medium mb-1">Presentes</p><p className="text-2xl font-bold text-green-600">{presentes}</p></div>
          <div><p className="text-xs text-gray-500 font-medium mb-1">Ausentes</p><p className="text-2xl font-bold text-red-600">{ausentes}</p></div>
          <div><p className="text-xs text-gray-500 font-medium mb-1">Justificados</p><p className="text-2xl font-bold text-blue-600">{justificados}</p></div>
          <div><p className="text-xs text-gray-500 font-medium mb-1">Total</p><p className="text-2xl font-bold text-gray-900">{total}</p></div>
        </div>
      </div>

      {/* Tabela de Alunos */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Lista de Presença</h3>
        <p className="text-sm text-gray-500 mb-6">Marque "Ausente" ou "Justificativa" quando necessário. Sem marcação = Presente</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm font-bold text-gray-900">
                <th className="pb-3 px-4 w-28">Matrícula</th>
                <th className="pb-3 px-4 w-48">Nome do Aluno</th>
                <th className="pb-3 px-4 min-w-[200px]">Aulas Matriculado</th>
                <th className="pb-3 px-4 w-24 text-center">Ausente</th>
                <th className="pb-3 px-4 w-32 text-center">Justificativa</th>
                <th className="pb-3 px-4 w-32 text-center">Status</th>
                <th className="pb-3 px-4 w-64">Observações</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {alunos.map((aluno) => (
                <tr key={aluno.alunoId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium">
                    {aluno.alunoId ? aluno.alunoId.substring(0, 8).toUpperCase() : ''}
                  </td>
                  <td className="py-4 px-4 font-bold">{aluno.nome}</td>
                  <td className="py-4 px-4 text-gray-500">-</td>
                  
                  {/* Checkbox Ausente */}
                  <td className="py-4 px-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={aluno.status === 1} 
                      onChange={() => toggleStatus(aluno.alunoId, 'ausente')}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                  </td>
                  
                  {/* Checkbox Justificativa */}
                  <td className="py-4 px-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={aluno.status === 2} 
                      onChange={() => toggleStatus(aluno.alunoId, 'justificativa')}
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
    </div>
  );
}