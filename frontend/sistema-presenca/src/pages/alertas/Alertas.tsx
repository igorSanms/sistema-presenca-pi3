import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

interface Alerta {
  alunoId: string;
  nome: string;
  faltasReais: number;
  nivelAlerta: number; // 1 = 3 faltas, 2 = mais de 3 faltas
}

export function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarAlertas();
  }, []);

  const carregarAlertas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/Alertas');
      setAlertas(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
      setError('Não foi possível carregar os alertas de infrequência.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1310px] mx-auto w-full">
      {/* Cabeçalho */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Alertas de Infrequência</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitore os alunos que estão em risco de reprovação por falta
            </p>
          </div>
        </div>
      </div>

      {/* Container da Lista */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Verificando registros de faltas...
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Erro na Consulta</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={carregarAlertas}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium text-sm transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : alertas.length === 0 ? (
          // Empty State
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <ShieldAlert className="w-16 h-16 text-green-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tudo tranquilo!</h3>
            <p className="text-sm text-gray-500">
              Nenhum aluno atingiu o nível de alerta de infrequência.
            </p>
          </div>
        ) : (
          // Tabela Preenchida
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm font-bold text-gray-900">
                  <th className="pb-3 px-4">Aluno</th>
                  <th className="pb-3 px-4 text-center">Faltas Acumuladas</th>
                  <th className="pb-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {alertas.map((alerta) => (
                  <tr
                    key={alerta.alunoId}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {alerta.nome}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-red-600 font-bold text-lg">
                        {alerta.faltasReais}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {alerta.nivelAlerta === 1 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                          Atenção (3 Faltas)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm">
                          Risco Crítico
                        </span>
                      )}
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
