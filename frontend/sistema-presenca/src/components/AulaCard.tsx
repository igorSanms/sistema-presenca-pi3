import { Clock, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AulaCardProps {
  id: string; 
  disciplina: string;
  nivel: string;
  horario: string;
  professor: string;
  categoria: string;
}

export function AulaCard({ id, disciplina, nivel, horario, professor, categoria }: AulaCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/disciplinas/editar/${id}`)} 
      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white shadow-sm cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <h4 className="text-sm font-bold text-gray-900 leading-tight">{disciplina}</h4>
        <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap">
          {nivel}
        </span>
      </div>

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

      <span className="inline-block border border-gray-200 text-gray-600 text-[10px] font-medium px-2 py-1 rounded">
        {categoria}
      </span>
    </div>
  );
}