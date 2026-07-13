import type { ReactNode } from 'react';
import { Calendar, GraduationCap, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DiaSemanaProps {
  dia: string;
  dataDia?: string;
  dataISO?: string; // Precisamos dessa data para mandar pro backend depois
  quantidadeAulas: number;
  isHoje?: boolean;
  children?: ReactNode; 
}

export function DiaSemana({ dia, dataDia, dataISO, quantidadeAulas, isHoje, children }: DiaSemanaProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full">
      
      {/* Cabeçalho do Dia (Escuro) */}
      <div className="bg-[#0A0F1C] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-white w-full">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>{dia}</span>
              {dataDia && (
                <span className="text-sm text-white/50 font-normal">
                  {dataDia}
                </span>
              )}
            </h3>
          </div>
          {isHoje && (
            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              Hoje
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs">
            {quantidadeAulas} {quantidadeAulas === 1 ? 'aula' : 'aulas'}
          </p>

          {/* Botão de Chamada Único: Só aparece no dia de HOJE */}
          {isHoje && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Passamos apenas a data global do dia, sem atrelar a nenhuma disciplina específica
                navigate('/chamada', { state: { data: dataISO } });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0A0F1C] bg-white rounded-md hover:bg-gray-100 transition-colors shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" /> Fazer Chamada
            </button>
          )}
        </div>
      </div>

      {/* Corpo do Dia */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {quantidadeAulas === 0 || !children ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-gray-400">
            <GraduationCap className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">Sem aulas</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}