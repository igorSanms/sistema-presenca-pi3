import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, UserSquare, BarChart, Bell, LogOut, GraduationCap } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

export function Header() {
  const { signOut, perfil, nome, email } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchAlertas = () => {
      // O backend já tem trava, mas garantimos que o front só busque se for Coordenação
      if (perfil === 'Coordenacao') {
        api.get('/Alertas/Ativos')
          .then(response => {
            if (response.data) {
              setAlertCount(response.data.length);
            }
          })
          .catch(err => console.error("Erro ao carregar notificações de alertas:", err));
      }
    };

    fetchAlertas();

    const handleAlertaResolvido = () => {
      setAlertCount(prev => Math.max(0, prev - 1));
    };

    window.addEventListener('alertaResolvido', handleAlertaResolvido);

    return () => {
      window.removeEventListener('alertaResolvido', handleAlertaResolvido);
    };
  }, [perfil]);

  const navItemClass = (path: string) => 
    `flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
      isActive(path) 
        ? 'text-gray-900 bg-gray-100'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleBellClick = () => {
    navigate('/relatorios?aba=alertas');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo e Título */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-900 p-2 rounded-lg">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Sistema Acadêmico</h1>
          <p className="text-xs text-gray-500">Gestão de Cursos, Alunos e Professores</p>
        </div>
      </div>

      {/* Menu Principal Dinâmico */}
      <nav className="hidden lg:flex items-center gap-6">
        <Link to="/painel" className={navItemClass('/painel')}>
          <BookOpen className="w-4 h-4" /> Disciplinas
        </Link>
        <Link to="/alunos" className={navItemClass('/alunos')}>
          <Users className="w-4 h-4" /> Alunos
        </Link>
        <Link to="/professores" className={navItemClass('/professores')}>
          <UserSquare className="w-4 h-4" /> Professores
        </Link>
        
        {perfil !== 'Professor' && (
          <Link to="/relatorios" className={navItemClass('/relatorios')}>
            <BarChart className="w-4 h-4" /> Relatórios
          </Link>
        )}
      </nav>

      {/* Ações do Usuário */}
      <div className="flex items-center gap-4">
        
        {perfil !== 'Professor' && (
          <button onClick={handleBellClick} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
            <div className="relative">
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </div>
          </button>
        )}
        
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 capitalize">{nome || 'Usuário'}</p>
            <p className="text-xs text-gray-500">{email || 'usuario@sistema.com'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}