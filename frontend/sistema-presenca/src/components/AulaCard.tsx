import { Clock, GraduationCap, ClipboardCheck, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AulaCardProps {
  disciplinaId?: string;
  disciplina: string;
  nivel: string;
  horario: string;
  professor: string;
  categoria: string;
  dataAula?: string;
  dataInicio?: string;
  dataFim?: string;
}

export function AulaCard({ disciplinaId, disciplina, nivel, horario, professor, categoria, dataAula, dataInicio, dataFim }: AulaCardProps) {
  const navigate = useNavigate();
  
  // Regra Crítica de RBAC (Role-Based Access Control)
  const perfil = localStorage.getItem('@SistemaPresenca:perfil');
  const isCoordenacao = perfil === 'Coordenacao';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white shadow-sm flex flex-col">
      <div className="flex-1">
        {/* Título */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <h4 className="text-sm font-bold text-gray-900 leading-tight">{disciplina}</h4>
        </div>

        {/* Informações (Horário e Professor) */}
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {horario}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <GraduationCap className="w-3.5 h-3.5" />
            {professor}
          </div>
        </div>
      </div>

      {/* Rodapé: Ações e Botão de Chamada Inteligente */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
        <div>
          {isCoordenacao && disciplinaId && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/disciplinas/editar/${disciplinaId}`);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar Disciplina"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {disciplinaId && dataAula && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/chamada', { 
                state: { data: dataAula, disciplinaId, horario } 
              });
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" /> Fazer Chamada
          </button>
        )}
      </div>
    </div>
  );
}