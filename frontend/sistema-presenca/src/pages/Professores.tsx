import { useState, useEffect } from 'react';
import { Search, User, Mail, BookOpen, Plus, Trash2, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Professor {
  id: string;
  nome: string;
  email: string;
  areaAtuacao: string;
}

interface Coordenador {
  id: string;
  nome: string;
  email: string;
}

export function Professores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [coordenadores, setCoordenadores] = useState<Coordenador[]>([]);
  const [busca, setBusca] = useState('');

  // Hidratação simultânea via Promise.all para carregar ambos os conjuntos de dados
  useEffect(() => {
    async function loadProfissionais() {
      try {
        const [profResponse, coordResponse] = await Promise.all([
          api.get('/Auth/professores'),
          api.get('/Auth/coordenadores')
        ]);
        setProfessores(profResponse.data);
        setCoordenadores(coordResponse.data);
      } catch (error) {
        console.error('Erro ao carregar profissionais institucionais:', error);
      }
    }
    loadProfissionais();
  }, []);

  const perfilUsuarioLogado = localStorage.getItem('@SistemaPresenca:perfil');
  const isCoordenacao = perfilUsuarioLogado === 'Coordenacao';

  // Exclusão Inteligente baseada no perfil do alvo
  const handleDelete = async (id: string, perfilAlvo: 'Professor' | 'Coordenacao') => {
    const label = perfilAlvo === 'Professor' ? 'professor' : 'coordenador';
    const endpoint = perfilAlvo === 'Professor' ? `/Auth/professores/${id}` : `/Auth/coordenadores/${id}`;

    if (window.confirm(`Tem certeza que deseja desativar este ${label}? O histórico dele será mantido.`)) {
      try {
        await api.delete(endpoint);
        
        // Remove localmente do respectivo estado para atualizar a UI de forma reativa
        if (perfilAlvo === 'Professor') {
          setProfessores(professores.filter(p => p.id !== id));
        } else {
          setCoordenadores(coordenadores.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error(`Erro ao desativar ${label}:`, error);
        alert(`Erro ao tentar desativar o ${label}.`);
      }
    }
  };

  // Filtragem local baseada na barra de buscas
  const professoresFiltrados = professores.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.email.toLowerCase().includes(busca.toLowerCase()) ||
    p.areaAtuacao.toLowerCase().includes(busca.toLowerCase())
  );

  const coordenadoresFiltrados = coordenadores.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de professores e equipe de coordenação institucional</p>
        </div>
        
        {isCoordenacao && (
          <div className="w-48">
            <Link to="/professores/novo">
              <Button variant="secondary" className="bg-[#0A0F1C] hover:bg-gray-800 text-white w-full py-2 rounded-md font-medium text-sm flex justify-center items-center">
                <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
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
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Buscar profissional por nome ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Seção 1: Corpo Docente */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Corpo Docente (Professores)</h2>
        <hr className="border-gray-200 mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professoresFiltrados.map((prof) => (
            <div key={prof.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate" title={prof.nome}>
                    {prof.nome}
                  </h3>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Docente
                  </span>
                </div>
                {isCoordenacao && (
                  <button
                    onClick={() => handleDelete(prof.id, 'Professor')}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                    title="Desativar Professor"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <hr className="border-gray-100" />

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate" title={prof.email}>{prof.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate" title={prof.areaAtuacao}>{prof.areaAtuacao}</span>
                </div>
              </div>
            </div>
          ))}
          
          {professoresFiltrados.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-400 text-sm">
              Nenhum professor encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Seção 2: Equipe de Coordenação */}
      {isCoordenacao && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Coordenação Acadêmica</h2>
          <hr className="border-gray-200 mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coordenadoresFiltrados.map((coord) => (
              <div key={coord.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate" title={coord.nome}>
                      {coord.nome}
                    </h3>
                    <span className="text-[10px] text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Administrador
                    </span>
                  </div>
                  {isCoordenacao && (
                    <button
                      onClick={() => handleDelete(coord.id, 'Coordenacao')}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      title="Desativar Coordenador"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <hr className="border-gray-100" />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate" title={coord.email}>{coord.email}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {coordenadoresFiltrados.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-400 text-sm">
                Nenhum membro da coordenação encontrado.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
