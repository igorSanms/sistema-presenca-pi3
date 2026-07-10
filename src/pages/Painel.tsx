import { useState, useEffect, useContext } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { DiaSemana } from '../components/DiaSemana';
import { AulaCard } from '../components/AulaCard';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

interface DisciplinaResponse {
  id: string;
  nome: string;
  professorId: string;
  professorNome: string;
  horarios: string;
}

export function Painel() {
  const navigate = useNavigate();
  const { perfil } = useContext(AuthContext);
  const isCoordenacao = perfil === 'Coordenacao';
  
  const [disciplinas, setDisciplinas] = useState<DisciplinaResponse[]>([]);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    async function loadDisciplinas() {
      try {
        const response = await api.get('/Disciplinas');
        setDisciplinas(response.data);
      } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
      }
    }
    loadDisciplinas();
  }, []);

  const disciplinasFiltradas = disciplinas.filter(disciplina => 
    disciplina.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  const getAulasDoDia = (dia: string) => {
    const aulas: any[] = [];
    disciplinasFiltradas.forEach(d => {
      if (!d.horarios) return;
      
      try {
        const parsed = JSON.parse(d.horarios) as string[];
        parsed.forEach(hStr => {
          if (hStr.startsWith(dia)) {
            const horario = hStr.replace(dia, '').trim();
            aulas.push({ ...d, horarioRender: horario });
          }
        });
      } catch {
        if (d.horarios.includes(dia)) {
          aulas.push({ ...d, horarioRender: d.horarios });
        }
      }
    });
    return aulas;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Grade de Aulas por Dia</h1>
          <p className="text-sm text-gray-500 mt-1">Visualize as disciplinas organizadas por dia da semana</p>
        </div>
        
        {isCoordenacao && (
          <div className="w-44">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/disciplinas/nova')} 
              className="bg-[#0A0F1C] hover:bg-gray-800 text-white w-full py-2.5 rounded-lg font-medium text-sm flex justify-center items-center transition-all"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Disciplina
            </Button>
          </div>
        )}
      </div>
      
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-white shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Buscar disciplinas..."
        />
      </div>

      <p className="text-sm text-gray-500">{disciplinasFiltradas.length} disciplinas encontradas</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {diasSemana.map((dia) => {
          const aulasDoDia = getAulasDoDia(dia);
          return (
            <DiaSemana key={dia} dia={dia} quantidadeAulas={aulasDoDia.length}>
              {aulasDoDia.map((aula, index) => (
                <AulaCard 
                  key={`${aula.id}-${index}`}
                  id={aula.id} 
                  disciplina={aula.nome}
                  nivel="Geral"
                  horario={aula.horarioRender}
                  professor={aula.professorNome}
                  categoria="Disciplina"
                />
              ))}
            </DiaSemana>
          );
        })}
      </div>
    </div>
  );
}