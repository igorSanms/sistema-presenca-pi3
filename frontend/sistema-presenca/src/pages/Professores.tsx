import { useState, useEffect } from 'react';
import { Search, User, Mail, BookOpen, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Professor {
  id: string;
  nome: string;
  email: string;
  areaAtuacao: string;
}

export function Professores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function loadProfessores() {
      try {
        const { data } = await api.get('/Auth/professores');
        setProfessores(data);
      } catch (error) {
        console.error('Erro ao carregar professores:', error);
      }
    }
    loadProfessores();
  }, []);

  const professoresFiltrados = professores.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.email.toLowerCase().includes(busca.toLowerCase()) ||
    p.areaAtuacao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professores</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão do corpo docente</p>
        </div>
        
        <div className="w-44">
          <Link to="/professores/novo">
            <Button variant="secondary" className="bg-[#0A0F1C] hover:bg-gray-800 text-white w-full py-2 rounded-md font-medium text-sm flex justify-center items-center">
              <Plus className="w-4 h-4 mr-2" /> Novo Professor
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Buscar professor por nome, email ou área..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professoresFiltrados.map((prof) => (
          <div key={prof.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
            
            {/* Topo do Card: Avatar e Nome */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0A0F1C] text-white rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-lg font-bold text-gray-900 truncate" title={prof.nome}>
                  {prof.nome}
                </h3>
              </div>
            </div>

            {/* Divisória sutil */}
            <hr className="border-gray-100" />

            {/* Informações: Email e Área */}
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
          <div className="col-span-full py-10 text-center text-gray-500">
            Nenhum professor encontrado.
          </div>
        )}
      </div>

    </div>
  );
}
