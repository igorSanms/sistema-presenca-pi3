import type { ReactNode } from 'react';
import { Calendar, GraduationCap, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

interface DiaSemanaProps {
  dia: string;
  quantidadeAulas: number;
  children?: ReactNode; // Aqui dentro injetaremos os AulaCards
}

export function DiaSemana({ dia, quantidadeAulas, children }: DiaSemanaProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full">
      
      {/* Cabeçalho do Dia (Escuro) */}
      <div className="bg-[#0A0F1C] p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white mb-1">
            <Calendar className="w-4 h-4" />
            <h3 className="font-bold text-base">{dia}</h3>
          </div>
          <p className="text-gray-400 text-xs">{quantidadeAulas} {quantidadeAulas === 1 ? 'aula' : 'aulas'}</p>
        </div>
      </div>

      {/* Corpo do Dia */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {quantidadeAulas === 0 || !children ? (
          // Estado Vazio (Empty State)
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-gray-400">
            <GraduationCap className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">Sem aulas</p>
          </div>
        ) : (
          // Estado Cheio
          children
        )}
      </div>
    </div>
  );
}