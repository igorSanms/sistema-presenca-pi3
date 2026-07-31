import { useState, useContext } from 'react';
import { TurmaContext } from '../contexts/TurmaContext';
import { api } from '../services/api';
import { Layers, X } from 'lucide-react';

interface NovaTurmaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaTurmaModal({ isOpen, onClose }: NovaTurmaModalProps) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const { carregarTurmas, setTurmaAtiva } = useContext(TurmaContext);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!nome.trim()) return;
    setLoading(true);
    try {
      // 1. Cria a turma no backend
      const response = await api.post('/Turmas', { nome });
      
      // 2. Recarrega a lista para a turma nova aparecer
      await carregarTurmas();
      
      // 3. Troca o sistema para a turma que acabou de nascer
      setTurmaAtiva(response.data);
      
      // 4. Limpa e fecha
      setNome('');
      onClose();
      window.location.reload();

    } catch (error) {
      console.error('Erro ao criar turma:', error);
      alert('Não foi possível criar a turma. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
            <Layers className="w-5 h-5 text-gray-700" />
            Nova Turma
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Turma
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Turma 2026.2, Turma A, Turma de Programação..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            A nova turma terá seus próprios alunos, professores, cursos e registros de chamada, completamente independentes das outras turmas.
          </p>
        </div>

        {/* Rodapé com Botões */}
        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !nome.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Turma'}
          </button>
        </div>
      </div>
    </div>
  );
}