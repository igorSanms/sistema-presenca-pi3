import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, UserSquare, BarChart, History, Bell, LogOut, GraduationCap } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export function Header() {
  const { signOut, perfil } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItemClass = (path: string) => 
    `flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
      isActive(path) 
        ? 'text-gray-900 bg-gray-100' // Fundo cinza se estiver ativo
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' // Sem fundo se não estiver
    }`;

  const handleLogout = () => {
    signOut(); // Limpa o token e o localStorage
    navigate('/login'); // Joga o usuário de volta pra porta de entrada
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
        <Link to="/relatorios" className={navItemClass('/relatorios')}>
          <BarChart className="w-4 h-4" /> Relatórios
        </Link>
        <Link to="/historico" className={navItemClass('/historico')}>
          <History className="w-4 h-4" /> Histórico
        </Link>
      </nav>

      {/* Ações do Usuário */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="text-right hidden sm:block">
            {/* Como não pegamos o nome do banco ainda, usamos o perfil */}
            <p className="text-sm font-medium text-gray-900">{perfil === '0' ? 'Coordenação' : 'Administrador'}</p>
            <p className="text-xs text-gray-500">admin@sistema.com</p>
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