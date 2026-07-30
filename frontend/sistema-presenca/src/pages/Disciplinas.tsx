import { useState, useEffect, useContext } from 'react';
import { Search, Plus, BookOpen, User, Calendar, Clock, Pencil, Ban, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

interface Disciplina {
  id: string;
  nome: string;
  professorId: string;
  professorNome: string;
  horarios: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean; // 👉 O nosso novo campo do banco de dados!
}

export function Disciplinas() {
  const navigate = useNavigate();
  const { perfil } = useContext(AuthContext);
  const isCoordenacao = perfil === 'Coordenacao';

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  const carregarDisciplinas = async () => {
    try {
      const response = await api.get('/Disciplinas');
      setDisciplinas(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chama a nossa nova rota PATCH para ligar/desligar a disciplina
  const handleToggleStatus = async (id: string, statusAtual: boolean, nome: string) => {
    const acao = statusAtual ? 'desativar' : 'reativar';
    if (window.confirm(`Tem certeza que deseja ${acao} a disciplina "${nome}"?`)) {
      try {
        await api.patch(`/Disciplinas/${id}/toggle`);
        // Atualiza a lista na tela sem precisar recarregar a página
        setDisciplinas(disciplinas.map(d => 
          d.id === id ? { ...d, ativo: !d.ativo } : d
        ));
      } catch (error) {
        console.error(`Erro ao ${acao} disciplina:`, error);
        alert(`Erro ao ${acao} a disciplina.`);
      }
    }
  };

  const disciplinasFiltradas = disciplinas.filter(d =>
    d.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (d.professorNome && d.professorNome.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1310px] mx-auto w-full pb-10">
      
      {/* Botão Voltar */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/painel')} className="flex items-center gap-2 text-gray-900 font-medium hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Voltar ao Painel
        </button>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Disciplinas</h1>
          <p className="text-sm text-gray-500 mt-1">Visualize, edite ou desative as disciplinas do sistema</p>
        </div>
        
        {isCoordenacao && (
          <div className="w-48">
            <Link to="/disciplinas/nova">
              <Button variant="secondary" className="bg-[#0A0F1C] hover:bg-gray-800 text-white w-full py-2.5 rounded-lg font-medium text-sm flex justify-center items-center transition-all">
                <Plus className="w-4 h-4 mr-2" /> Nova Disciplina
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          placeholder="Buscar por disciplina ou professor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 font-medium">Carregando disciplinas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {disciplinasFiltradas.map((disciplina) => (
            <div 
              key={disciplina.id} 
              className={`bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md ${disciplina.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50/30'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${disciplina.ativo ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold truncate max-w-[200px] ${disciplina.ativo ? 'text-gray-900' : 'text-gray-500 line-through'}`} title={disciplina.nome}>
                      {disciplina.nome}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${disciplina.ativo ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {disciplina.ativo ? 'Ativa' : 'Desativada'}
                    </span>
                  </div>
                </div>

                {isCoordenacao && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/disciplinas/editar/${disciplina.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Editar Disciplina"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(disciplina.id, disciplina.ativo, disciplina.nome)}
                      className={`p-2 rounded-full transition-colors ${disciplina.ativo ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-red-400 hover:text-green-600 hover:bg-green-50'}`}
                      title={disciplina.ativo ? 'Desativar Disciplina' : 'Reativar Disciplina'}
                    >
                      {disciplina.ativo ? <Ban className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              <hr className={disciplina.ativo ? 'border-gray-100' : 'border-red-100'} />

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{disciplina.professorNome || 'Não atribuído'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">
                    {new Date(disciplina.dataInicio).toLocaleDateString('pt-BR')} até {new Date(disciplina.dataFim).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 truncate" title={disciplina.horarios}>
                    {disciplina.horarios}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {disciplinasFiltradas.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-gray-400 text-sm">
              Nenhuma disciplina encontrada.
            </div>
          )}
        </div>
      )}
    </div>
  );
}