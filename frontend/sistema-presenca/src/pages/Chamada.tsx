import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';

interface AlunoChamada {
  alunoId: string;
  nome: string;
  status: 0 | 1 | 2 | null;
  observacao: string;
}

export function Chamada() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const hojeDate = new Date();
  const hojeISO = `${hojeDate.getFullYear()}-${String(hojeDate.getMonth() + 1).padStart(2, '0')}-${String(hojeDate.getDate()).padStart(2, '0')}`;
  
  // 👉 Ativado o setDataAula para permitir alterar o dia da chamada dinamicamente
  const [dataAula, setDataAula] = useState(location.state?.data || hojeISO); 
  const [alunos, setAlunos] = useState<AlunoChamada[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  
  const [isEdicao, setIsEdicao] = useState(false);

  useEffect(() => {
    async function loadDadosDaChamada() {
      try {
        setLoadingDados(true);
        
        // 1. Busca TODOS os alunos cadastrados no sistema
        const alunosResponse = await api.get('/Alunos');
        const listaAlunos = alunosResponse.data || [];

        // 2. Busca se já existe uma frequência do dia
        let frequenciaData: any[] = [];
        try {
          const frequenciaResponse = await api.get('/Frequencia', {
            params: { data: dataAula } 
          });
          frequenciaData = frequenciaResponse.data || [];
        } catch (err: any) {
          console.log('Nenhuma chamada anterior encontrada. Iniciando lista limpa.');
        }

        // Se já tiver dados, ativa o modo de edição ao invés de bloquear
        if (frequenciaData.length > 0) {
          setIsEdicao(true);
        } else {
          setIsEdicao(false); // Garante que volta a ser nova chamada se mudar para um dia limpo
        }

        // 3. Faz o Merge visual
        const alunosMapeados = listaAlunos.map((alunoBase: any) => {
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
          }
          
          return {
            alunoId: baseId,
            nome: baseNome,
            status: statusConvertido,
            observacao: (registro?.observacao || registro?.Observacao) || ''
          };
        });

        setAlunos(alunosMapeados);
      } catch (error) {
        console.error('Erro ao carregar os dados da chamada:', error);
        alert('Erro ao buscar a lista de alunos do sistema.');
      } finally {
        setLoadingDados(false);
      }
    }
    
    if (dataAula) {
      loadDadosDaChamada();
    }
  }, [dataAula]);

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

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const payload = {
        data: dataAula, 
        alunos: alunos.map(a => ({
          alunoId: a.alunoId,
          status: a.status === 1 ? 1 : a.status === 2 ? 2 : 0, 
          observacao: a.observacao || ''
        }))
      };

      await api.post('/Frequencia', payload);
      alert(isEdicao ? 'Chamada atualizada com sucesso!' : 'Chamada salva com sucesso!');
      
      window.dispatchEvent(new Event('alertaResolvido'));
      
      setIsEdicao(true);
      // navigate('/painel');
      window.location.href = '/painel';
    } catch (error: any) {
      console.error("Erro ao salvar chamada:", error?.response?.data);
      alert('Erro ao salvar chamada. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const total = alunos.length;
  const ausentes = alunos.filter(a => a.status === 1).length;
  const justificados = alunos.filter(a => a.status === 2).length;
  const presentes = total - ausentes - justificados;

  if (loadingDados) {
    return <div className="py-20 text-center text-gray-500 font-medium">Sincronizando dados com o servidor...</div>;
  }

  return (
    <div className="max-w-[1310px] mx-auto w-full pb-10">
      <button onClick={() => navigate('/painel')} className="flex items-center gap-2 text-gray-900 font-medium mb-6 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar para Grade de Aulas
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 capitalize">Chamada do Dia</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão de frequência unificada • {total} alunos cadastrados no cursinho</p>
      </div>

      {isEdicao && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Modo de Edição</h4>
            <p className="text-xs mt-0.5">A chamada de hoje já foi registrada. Qualquer alteração feita e salva agora irá atualizar os dados no sistema.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow-sm gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Data da Aula</label>
          <div className="relative">
            {/* 👉 Input modificado para tipo "date" interativo e conectado ao estado */}
            <input 
              type="date" 
              value={dataAula}
              onChange={(e) => setDataAula(e.target.value)}
              className="bg-white border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none min-w-[200px]"
            />
          </div>
        </div>

        <div className="flex gap-8 text-center bg-white">
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Presentes</p><p className="text-3xl font-bold text-green-600">{presentes}</p></div>
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Ausentes</p><p className="text-3xl font-bold text-red-600">{ausentes}</p></div>
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Justificados</p><p className="text-3xl font-bold text-blue-600">{justificados}</p></div>
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total</p><p className="text-3xl font-bold text-gray-900">{total}</p></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Lista de Presença</h3>
        <p className="text-sm text-gray-500 mb-6">Marque "Ausente" ou "Justificativa" quando necessário. Alunos sem marcação são considerados Presentes.</p>

        {alunos.length === 0 ? (
          <div className="py-12 text-center border border-gray-100 rounded-xl bg-gray-50 text-gray-500">
            Nenhum aluno encontrado no sistema. Cadastre os alunos primeiro.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                  <th className="py-3 px-4 w-28">Matrícula</th>
                  <th className="py-3 px-4 w-48">Nome do Aluno</th>
                  <th className="py-3 px-4 w-24 text-center">Ausente</th>
                  <th className="py-3 px-4 w-32 text-center">Justificativa</th>
                  <th className="py-3 px-4 w-32 text-center">Status</th>
                  <th className="py-3 px-4 w-64">Observações</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {alunos.map((aluno) => (
                  <tr key={aluno.alunoId} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono text-gray-500">
                      {aluno.alunoId ? aluno.alunoId.substring(0, 8).toUpperCase() : ''}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900">{aluno.nome}</td>
                    
                    <td className="py-4 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={aluno.status === 1} 
                        onChange={(e) => handleStatusChange(aluno.alunoId, e.target.checked ? 1 : 0)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={aluno.status === 2} 
                        onChange={(e) => handleStatusChange(aluno.alunoId, e.target.checked ? 2 : 0)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </td>

                    <td className="py-4 px-4 text-center">
                      {aluno.status === 1 ? (
                        <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Ausente</span>
                      ) : aluno.status === 2 ? (
                        <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Justificado</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Presente</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <input 
                        type="text" 
                        placeholder="Adicionar observação..."
                        value={aluno.observacao || ''}
                        onChange={(e) => handleObsChange(aluno.alunoId, e.target.value)}
                        className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-1 focus:ring-blue-500 rounded-md px-3 py-2 text-xs transition-all"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
          <Button 
            variant="secondary" 
            className="bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 px-8 flex items-center justify-center rounded-md w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold" 
            onClick={handleSave} 
            disabled={loading || alunos.length === 0}
          >
            <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : isEdicao ? 'Atualizar Chamada' : 'Salvar Chamada'}
          </Button>
        </div>
      </div>
    </div>
  );
}