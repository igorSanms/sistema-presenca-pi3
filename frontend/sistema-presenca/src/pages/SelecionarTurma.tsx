import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TurmaContext } from '../contexts/TurmaContext';
import { Layers, Plus, Edit2, Trash2, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { NovaTurmaModal } from '../components/NovaTurmaModal';

export function SelecionarTurma() {
  const { turmas, setTurmaAtiva, carregarTurmas } = useContext(TurmaContext);
  
  //  extração do "perfil" aqui
  const { nome, perfil, signOut } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState('');

  // variável de controle
  const isCoordenacao = perfil === 'Coordenacao';

  // Atualiza a lista sempre que entra nessa tela
  useEffect(() => {
    carregarTurmas();
  }, []);

  const handleSelecionarTurma = (turma: any) => {
    setTurmaAtiva(turma);
    navigate('/painel');
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleIniciarEdicao = (turma: any) => {
    setEditandoId(turma.id);
    setNovoNome(turma.nome);
  };

  const handleSalvarEdicao = async (id: string) => {
    if (!novoNome.trim()) return;
    try {
      await api.put(`/Turmas/${id}`, { nome: novoNome });
      setEditandoId(null);
      await carregarTurmas();
    } catch (error) {
      alert('Erro ao editar nome da turma.');
    }
  };

  const handleExcluirTurma = async (id: string, nomeTurma: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a "${nomeTurma}"?\nIsso removerá os alunos e disciplinas vinculados a ela. Professores não serão afetados.`)) {
      try {
        await api.delete(`/Turmas/${id}`);
        // Se a turma excluída era a que estava salva no navegador, limpamos
        const turmaSalva = localStorage.getItem('@SistemaPresenca:turmaAtiva');
        if (turmaSalva && JSON.parse(turmaSalva).id === id) {
          localStorage.removeItem('@SistemaPresenca:turmaAtiva');
        }
        await carregarTurmas();
      } catch (error) {
        alert('Erro ao excluir turma.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Olá, {nome || 'Usuário'}!</h1>
          <p className="text-gray-600 mt-1">
            {isCoordenacao 
              ? 'Selecione uma turma para acessar o sistema ou crie uma nova.' 
              : 'Selecione a sua turma para acessar o sistema.'}
          </p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-medium">
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {turmas.map((turma) => (
          <div key={turma.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40">
            {editandoId === turma.id ? (
              <div className="flex flex-col gap-2 h-full justify-center">
                <input 
                  type="text" 
                  value={novoNome} 
                  onChange={(e) => setNovoNome(e.target.value)} 
                  autoFocus
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleSalvarEdicao(turma.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold w-full">Salvar</button>
                  <button onClick={() => setEditandoId(null)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-bold w-full">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div 
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={() => handleSelecionarTurma(turma)}
                >
                  <div className="bg-blue-50 p-2.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{turma.nome}</h3>
                    <span className="text-xs text-green-600 font-bold uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full">Ativa</span>
                  </div>
                </div>

                {/* 👉 3. Esconde os botões de Editar e Excluir se for Professor */}
                {isCoordenacao && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-auto">
                    <button onClick={() => handleIniciarEdicao(turma)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Editar Nome">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleExcluirTurma(turma.id, turma.nome)} className="text-gray-400 hover:text-red-600 transition-colors" title="Excluir Turma">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Esconde o botão de Criar Nova Turma se for Professor */}
        {isCoordenacao && (
          <button 
            onClick={() => setModalOpen(true)}
            className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center h-40 text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all gap-2"
          >
            <Plus className="w-8 h-8" />
            <span className="font-bold">Criar Nova Turma</span>
          </button>
        )}
      </div>

      <NovaTurmaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}