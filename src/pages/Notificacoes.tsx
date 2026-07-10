import { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  Check, 
  CheckCheck, 
  X, 
  AlertTriangle, 
  GraduationCap, 
  Users, 
  UserCheck, 
  FileText, 
  History, 
  LogOut 
} from 'lucide-react';

// Definição da estrutura dos dados para o TypeScript
interface NotificationItem {
  id: number;
  title: string;
  description: string;
  details: string;
  date: string;
  isNew: boolean;
  read: boolean;
}

export default function NotificationsPage() {
  // Inicializando o estado como um array vazio (dados mocados removidos)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Estado da aba ativa limitada estritamente aos dois filtros das telas
  const [activeTab, setActiveTab] = useState<'todas' | 'nao-lidas'>('todas');

  // Contadores dinâmicos para os badges e botões
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtragem da lista com base na aba selecionada
  const displayedNotifications = notifications.filter(n => {
    if (activeTab === 'nao-lidas') return !n.read;
    return true;
  });

  // Funções de ação do usuário
  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true, isNew: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true, isNew: false }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* NAVBAR SUPERIOR */}
      <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200 shadow-sm">
        {/* Logo / Nome do Sistema */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sistema Acadêmico</h1>
            <p className="text-xs text-gray-500">Gestão de Cursos, Alunos e Professores</p>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-sm font-medium text-gray-600">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">
            <FileText size={16} /> Cursos
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">
            <Users size={16} /> Alunos
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">
            <UserCheck size={16} /> Professores
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">
            <FileText size={16} /> Relatórios
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">
            <History size={16} /> Histórico
          </button>
          
          {/* SINO DA NAVBAR COM BADGE VERMELHO */}
          <div className="relative mx-2">
            <button className="p-2 border border-gray-200 bg-white rounded-lg text-gray-700 hover:bg-gray-50 transition">
              <Bell size={18} />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </div>
        </nav>

        {/* Perfil do Usuário */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">Administrador</p>
            <p className="text-xs text-gray-400">admin@sistema.com</p>
          </div>
          <button className="p-2 text-gray-400 hover:text-red-500 transition">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ÁREA CENTRAL */}
      <main className="max-w-6xl mx-auto mt-8 px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
          
          <div>
            {/* Título do Card e Botões de Ação Global */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bell size={20} className="text-gray-700" /> Notificações
                  </h2>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Acompanhe alertas e avisos importantes do sistema</p>
              </div>

              {/* Botões do Canto Superior Direito */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 border border-gray-200 text-xs font-semibold text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    <CheckCheck size={14} /> Marcar todas como lidas
                  </button>
                )}
                {totalCount > 0 && (
                  <button 
                    onClick={clearAll}
                    className="flex items-center gap-2 border border-gray-200 text-xs font-semibold text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    <Trash2 size={14} /> Limpar todas
                  </button>
                )}
              </div>
            </div>

            {/* Abas Alternáveis (Filtros) */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('todas')}
                className={`text-xs font-bold px-4 py-2 rounded-lg border transition ${
                  activeTab === 'todas'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Todas ({totalCount})
              </button>
              <button
                onClick={() => setActiveTab('nao-lidas')}
                className={`text-xs font-bold px-4 py-2 rounded-lg border transition ${
                  activeTab === 'nao-lidas'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Não lidas ({unreadCount})
              </button>
            </div>

            {/* RENDERIZAÇÃO DAS NOTIFICAÇÕES */}
            <div className="space-y-3">
              {displayedNotifications.length > 0 ? (
                displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border border-gray-200 rounded-xl p-5 flex items-start justify-between transition-all ${
                      notification.read ? 'bg-white shadow-sm' : 'bg-gray-50/80'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Ícone de Atenção Lateral */}
                      <div className="mt-0.5 p-1.5 text-orange-500 bg-orange-50 rounded-lg h-fit">
                        <AlertTriangle size={18} />
                      </div>
                      
                      {/* Conteúdo da Notificação */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm">{notification.title}</h3>
                          {notification.isNew && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Nova
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.details}</p>
                        <p className="text-[11px] text-gray-400 mt-2 font-medium">{notification.date}</p>
                      </div>
                    </div>

                    {/* Botões do Canto Direito do Card */}
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          title="Marcar como lida"
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                          <Check size={16} strokeWidth={2.5} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        title="Excluir"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                /* TELA DE ESTADO VAZIO (Quando remove tudo ou filtra sem registros) */
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                  <div className="p-4 text-gray-400 mb-2">
                    <Bell size={44} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {activeTab === 'nao-lidas' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {activeTab === 'nao-lidas' ? 'Você está em dia com todas as notificações' : 'Não há notificações no momento'}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}