import { useState, useEffect, useContext } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, List } from 'lucide-react';
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
  professorNome?: string;
  horarios: string;
  dataInicio?: string;
  dataFim?: string;
  ativo: boolean;
}

export function Painel() {
  const navigate = useNavigate();
  const { perfil } = useContext(AuthContext);
  const isCoordenacao = perfil === 'Coordenacao';
  
  const [disciplinas, setDisciplinas] = useState<DisciplinaResponse[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  // Data de hoje calculada de forma imune a problemas de timezone
  const hojeDate = new Date();
  const hojeISO = `${hojeDate.getFullYear()}-${String(hojeDate.getMonth() + 1).padStart(2, '0')}-${String(hojeDate.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    async function loadDisciplinas() {
      try {
        const response = await api.get('/Disciplinas');
        setDisciplinas(response.data || []);
      } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
      }
    }
    loadDisciplinas();
  }, []);

  const disciplinasFiltradas = disciplinas.filter(disciplina => 
    disciplina.ativo &&
    disciplina.nome && disciplina.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  const getAulasDoDia = (dia: string, dataISO: string) => {
    const aulas: any[] = [];

    disciplinasFiltradas.forEach(d => {
      if (!d.horarios) return;
      
      // 1. Verificação do Período Letivo
      if (d.dataInicio && d.dataFim && !d.dataInicio.startsWith('0001')) {
        const inicioStr = d.dataInicio.split('T')[0];
        const fimStr = d.dataFim.split('T')[0];
        
        // Se a data do card (dataISO) for antes do início ou depois do fim,
        // interrompe aqui e NÃO mostra essa disciplina neste dia.
        if (dataISO < inicioStr || dataISO > fimStr) {
          return; 
        }
      }

      // 2. Verificação do Dia da Semana e Extração do Horário
      try {
        const parsed = JSON.parse(d.horarios);
        if (Array.isArray(parsed)) {
          parsed.forEach(hStr => {
            if (typeof hStr === 'string' && hStr.startsWith(dia)) {
              const horario = hStr.replace(dia, '').trim();
              aulas.push({ ...d, horarioRender: horario });
            }
          });
        }
      } catch {
        if (typeof d.horarios === 'string' && d.horarios.includes(dia)) {
          aulas.push({ ...d, horarioRender: d.horarios });
        }
      }
    });
    return aulas;
  };

  const getDataDoDia = (diaNome: string) => {
    const dataAlvo = new Date();
    dataAlvo.setDate(dataAlvo.getDate() + (weekOffset * 7));
    
    let diaAtualIndex = dataAlvo.getDay(); 
    if (diaAtualIndex === 0) diaAtualIndex = 7; 

    const mapaDias: Record<string, number> = {
      "Segunda": 1, "Terça": 2, "Quarta": 3, "Quinta": 4, "Sexta": 5, "Sábado": 6, "Domingo": 7
    };
    
    const targetDia = mapaDias[diaNome];
    const diff = targetDia - diaAtualIndex;
    
    const targetDate = new Date(dataAlvo);
    targetDate.setDate(dataAlvo.getDate() + diff);
    
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    
    return {
      dataISO: `${yyyy}-${mm}-${dd}`,
      dataVisual: `${dd}/${mm}/${yyyy}`
    };
  };

  const getWeekLabel = () => {
    if (weekOffset === 0) return "Semana Atual";
    if (weekOffset === 1) return "Próxima Semana";
    if (weekOffset === -1) return "Semana Passada";
    return weekOffset > 0 ? `${weekOffset} semanas à frente` : `${Math.abs(weekOffset)} semanas atrás`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Grade de Aulas por Dia</h1>
            
            <div className="flex items-center bg-white border border-gray-200 rounded-md p-1 shadow-sm">
              <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 text-sm text-gray-700 font-medium min-w-[140px] text-center select-none">
                {getWeekLabel()}
              </span>
              <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Visualize as disciplinas organizadas por dia da semana</p>
        </div>
        
        {isCoordenacao && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/disciplinas')} 
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 px-4 rounded-lg font-medium text-sm flex justify-center items-center transition-all"
            >
              <List className="w-4 h-4 mr-2" /> Ver Disciplinas
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => navigate('/disciplinas/nova')} 
              className="bg-[#0A0F1C] hover:bg-gray-800 text-white py-2.5 px-4 rounded-lg font-medium text-sm flex justify-center items-center transition-all whitespace-nowrap"
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
          const { dataISO, dataVisual } = getDataDoDia(dia);
          const aulasDoDia = getAulasDoDia(dia, dataISO);

          return (
            <DiaSemana 
              key={dia} 
              dia={dia} 
              dataDia={dataVisual} 
              dataISO={dataISO}
              quantidadeAulas={aulasDoDia.length} 
              isHoje={dataISO === hojeISO}
            >
              {aulasDoDia.map((aula, index) => (
                <AulaCard 
                  key={`${aula.id}-${index}`}
                  id={aula.id} 
                  disciplina={aula.nome}
                  nivel="Geral"
                  horario={aula.horarioRender}
                  professor={aula.professorNome || 'Não atribuído'}
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