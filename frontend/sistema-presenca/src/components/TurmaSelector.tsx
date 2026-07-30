import { useState, useContext, useRef, useEffect } from 'react';
import { TurmaContext } from '../contexts/TurmaContext';
import { Layers, ChevronDown, Check, Plus } from 'lucide-react';
import { NovaTurmaModal } from './NovaTurmaModal';
import { AuthContext } from '../contexts/AuthContext';

export function TurmaSelector() {
  const { turmaAtiva, turmas, setTurmaAtiva } = useContext(TurmaContext);
  const { perfil } = useContext(AuthContext); // Para saber se é Coordenação
  
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCoordenacao = perfil === 'Coordenacao';

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Principal do Cabeçalho */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Layers className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-700 text-sm">
          {turmaAtiva ? turmaAtiva.nome : 'Carregando...'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
      </button>

      {/* Dropdown (Lista de Turmas) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-40">
          
          {/* Lista de Turmas Existentes */}
          <div className="max-h-64 overflow-y-auto">
            {turmas.map((turma) => (
              <button
                key={turma.id}
                onClick={() => {
                  setTurmaAtiva(turma);
                  setIsOpen(false);
                  window.location.reload();
                }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
              >
                <span className={`truncate ${turmaAtiva?.id === turma.id ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                  {turma.nome}
                </span>
                {turmaAtiva?.id === turma.id && (
                  <Check className="w-4 h-4 text-gray-800" />
                )}
              </button>
            ))}
          </div>

          {/* Opção de Nova Turma (Apenas Coordenação) */}
          {isCoordenacao && (
            <>
              <div className="h-px bg-gray-100 my-1"></div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-500" />
                Nova Turma
              </button>
            </>
          )}
        </div>
      )}

      {/* Renderiza o Modal oculto aqui */}
      <NovaTurmaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}