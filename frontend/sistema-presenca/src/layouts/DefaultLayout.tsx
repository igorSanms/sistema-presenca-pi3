import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export function DefaultLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      
      {/* O Outlet é onde as páginas (Painel, Alunos, etc) serão injetadas */}
      <main className="max-w-[1400px] mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}