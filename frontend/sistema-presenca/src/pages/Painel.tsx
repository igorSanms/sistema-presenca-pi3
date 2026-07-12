import { useState, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { DiaSemana } from '../components/DiaSemana';
import { AulaCard } from '../components/AulaCard';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface DisciplinaResponse {
  id: string;
  nome: string;
  professorId: string;
  professorNome: string;
  horarios: string;
}

export function Painel() {
  const [disciplinas, setDisciplinas] = useState<DisciplinaResponse[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

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

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  const getAulasDoDia = (dia: string) => {
    const aulas: any[] = [];
    disciplinas.forEach(d => {
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

  // Calcula a data no formato YYYY-MM-DD respeitando o weekOffset selecionado
  const getDataDoDia = (diaNome: string) => {
    const dataAlvo = new Date();
    // Adiciona o offset de semanas à data de hoje
    dataAlvo.setDate(dataAlvo.getDate() + (weekOffset * 7));
    
    // getDay() retorna 0 (Domingo) a 6 (Sábado)
    const diaAtualIndex = dataAlvo.getDay(); 
    const mapaDias: Record<string, number> = {
      "Domingo": 0, "Segunda": 1, "Terça": 2, "Quarta": 3, "Quinta": 4, "Sexta": 5, "Sábado": 6
    };
    
    const targetDia = mapaDias[diaNome];
    const diff = targetDia - diaAtualIndex;
    
    const targetDate = new Date(dataAlvo);
    targetDate.setDate(dataAlvo.getDate() + diff);
    
    // Ajuste de fuso horário
    const offset = targetDate.getTimezoneOffset();
    const localTargetDate = new Date(targetDate.getTime() - (offset * 60 * 1000));
    
    return localTargetDate.toISOString().split('T')[0];
  };

  const getWeekLabel = () => {
    if (weekOffset === 0) return "Semana Atual";
    if (weekOffset === 1) return "Próxima Semana";
    if (weekOffset === -1) return "Semana Passada";
    return weekOffset > 0 ? `${weekOffset} semanas à frente` : `${Math.abs(weekOffset)} semanas atrás`;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Título e Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Grade de Aulas</h1>
            
            {/* Navegação de Semanas */}
            <div className="flex items-center bg-white border border-gray-200 rounded-md p-1 shadow-sm">
              <button 
                onClick={() => setWeekOffset(prev => prev - 1)} 
                className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 text-sm text-gray-700 font-medium min-w-[140px] text-center select-none">
                {getWeekLabel()}
              </span>
              <button 
                onClick={() => setWeekOffset(prev => prev + 1)} 
                className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Visualize as aulas organizadas por dia da semana</p>
        </div>
        
        <div className="w-40">
          <Link to="/disciplinas/nova">
            <Button variant="secondary" className="bg-[#0A0F1C] hover:bg-gray-800 text-white w-full py-2 rounded-md font-medium text-sm flex justify-center items-center">
              <Plus className="w-4 h-4 mr-2" /> Nova Disciplina
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-white shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar disciplinas..."
          />
        </div>

        <select className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-transparent shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-700">
          <option value="">Todas Categorias</option>
        </select>

        <select className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-transparent shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-700">
          <option value="">Todos os Níveis</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">{disciplinas.length} disciplinas encontradas</p>

      {/* Grade de Aulas (CSS Grid Responsivo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        
        {diasSemana.map((dia) => {
          const aulasDoDia = getAulasDoDia(dia);
          const dataCalculada = getDataDoDia(dia);

          return (
            <DiaSemana key={dia} dia={dia} quantidadeAulas={aulasDoDia.length}>
              {aulasDoDia.map((aula, index) => (
                <AulaCard 
                  key={`${aula.id}-${index}`}
                  disciplinaId={aula.id}
                  disciplina={aula.nome}
                  nivel="Geral"
                  horario={aula.horarioRender}
                  professor={aula.professorNome}
                  categoria="Disciplina"
                  dataAula={dataCalculada}
                />
              ))}
            </DiaSemana>
          );
        })}

      </div>
    </div>
  );
}