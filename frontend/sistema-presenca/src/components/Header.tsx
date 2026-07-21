import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, UserSquare, BarChart, Bell, LogOut, GraduationCap, Clock } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';

export function Header() {
  // Puxamos também o token do AuthContext para ler a validade dele
  const { signOut, perfil, nome, email, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  const [alertCount, setAlertCount] = useState(0);
  
  // Estados para o cronômetro da sessão
  const [tempoRestante, setTempoRestante] = useState<string>('');
  const [expirando, setExpirando] = useState(false);

  // Efeito 1: Busca notificações (Seu código original)
  // Efeito 1: Busca notificações
  useEffect(() => {
    const fetchAlertas = async () => {
      // O backend já tem trava, mas garantimos que o front só busque se for Coordenação
      if (perfil === 'Coordenacao') {
        try {
          // Busca os alunos e os alertas ao mesmo tempo para cruzar os dados
          const [alunosResponse, alertasResponse] = await Promise.all([
            api.get('/Alunos'),
            api.get('/Alertas/Ativos')
          ]);

          const listaAlunos = alunosResponse.data || [];
          const alertasData = alertasResponse.data || [];

          // Filtra deixando apenas os alertas de alunos ativos
          const alertasDeAlunosAtivos = alertasData.filter((alerta: any) => {
            // Cruzamento ESTRITO pelo ID único (removemos a falha do nome)
            const alertaAlunoId = alerta.alunoId || alerta.AlunoId;
            
            // Se o alerta não tiver ID de aluno, ele é descartado por segurança
            if (!alertaAlunoId) return false; 

            const alunoExiste = listaAlunos.find((a: any) => (a.id || a.Id) === alertaAlunoId);
            
            return alunoExiste && alunoExiste.ativo !== false && alunoExiste.Ativo !== false;
          });

          // Define o número do sino apenas com os alertas reais
          setAlertCount(alertasDeAlunosAtivos.length);

        } catch (err) {
          console.error("Erro ao carregar notificações de alertas:", err);
        }
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

  // Efeito 2: Cronômetro de Sessão
  useEffect(() => {
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return;

      // Isolamos a lógica em uma função para podermos chamar na hora zero
      const atualizarCronometro = () => {
        const agora = Math.floor(Date.now() / 1000);
        const segundosRestantes = decoded.exp - agora;

        if (segundosRestantes <= 0) {
          setTempoRestante('Expirado');
          setExpirando(true);
          return false; // Avisa que acabou
        } else {
          const h = Math.floor(segundosRestantes / 3600);
          const m = Math.floor((segundosRestantes % 3600) / 60);
          const s = Math.floor(segundosRestantes % 60);
          
          if (h > 0) {
            setTempoRestante(`${h}h ${m.toString().padStart(2, '0')}m`);
          } else {
            setTempoRestante(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
          }
          
          setExpirando(segundosRestantes < 300);
          return true; // Avisa que ainda está rodando
        }
      };

      // 1. Executa IMEDIATAMENTE ao carregar a página (Fim do atraso!)
      const continuar = atualizarCronometro();

      // 2. Se a sessão ainda for válida, liga o motor contínuo a cada segundo
      if (continuar) {
        const interval = setInterval(() => {
          const aindaValido = atualizarCronometro();
          if (!aindaValido) clearInterval(interval); // Para o relógio se expirar
        }, 1000);

        return () => clearInterval(interval);
      }

    } catch (err) {
      console.error("Erro ao decodificar token para o cronômetro", err);
    }
  }, [token]);

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

        {/* Cronômetro de Sessão Novo! */}
        {tempoRestante && (
          <div 
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-500 ${
              expirando 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`} 
            title="Tempo restante até a sessão expirar"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="w-[45px] text-center">{tempoRestante}</span>
          </div>
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