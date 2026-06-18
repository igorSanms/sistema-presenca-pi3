import { Search, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { DiaSemana } from '../components/DiaSemana';
import { AulaCard } from '../components/AulaCard';
import { Link } from 'react-router-dom';

export function Painel() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Título e Botão de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade de Aulas por Dia</h1>
          <p className="text-sm text-gray-500 mt-1">Visualize as aulas organizadas por dia da semana</p>
        </div>
        
        <div className="w-40">
          <Link to="/disciplinas/nova">
            <Button variant="secondary" className="bg-[#0A0F1C] hover:bg-gray-800 text-white w-full py-2 rounded-md font-medium text-sm flex justify-center items-center">
              <Plus className="w-4 h-4 mr-2" /> Nova Disciplina
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-white shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar disciplinas..."
          />
        </div>

        {/* Selects limpos, aguardando integração dinâmica com a API */}
        <select className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-transparent shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-700">
          <option value="">Todas Categorias</option>
        </select>

        <select className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-transparent shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-700">
          <option value="">Todos os Níveis</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">7 disciplinas encontradas</p>

      {/* Grade de Aulas (CSS Grid Responsivo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        
        {/* Exemplo: Segunda-feira com disciplinas */}
        <DiaSemana dia="Segunda" quantidadeAulas={2}>
          <AulaCard 
            disciplina="Design UX/UI Fundamentos"
            nivel="Iniciante"
            horario="10:00 - 12:00"
            professor="Prof. Carlos Santos"
            categoria="Design"
          />
          <AulaCard 
            disciplina="Desenvolvimento Web Completo"
            nivel="Intermediário"
            horario="19:00 - 21:00"
            professor="Prof. Ana Silva"
            categoria="Programação"
          />
        </DiaSemana>

        {/* Exemplo: Terça-feira (Vazia) */}
        <DiaSemana dia="Terça" quantidadeAulas={0} />

        {/* Exemplo: Quarta-feira (Vazia) */}
        <DiaSemana dia="Quarta" quantidadeAulas={0} />

        {/* Exemplo: Quinta-feira com disciplina */}
        <DiaSemana dia="Quinta" quantidadeAulas={1}>
          <AulaCard 
            disciplina="Python para Data Science"
            nivel="Avançado"
            horario="14:00 - 16:00"
            professor="Prof. Ana Silva"
            categoria="Data Science"
          />
        </DiaSemana>

        {/* Exemplo: Sexta-feira */}
        <DiaSemana dia="Sexta" quantidadeAulas={1}>
          <AulaCard 
            disciplina="Design UX/UI Fundamentos"
            nivel="Iniciante"
            horario="10:00 - 12:00"
            professor="Prof. Carlos Santos"
            categoria="Design"
          />
        </DiaSemana>

        {/* Exemplo: Sábado */}
        <DiaSemana dia="Sábado" quantidadeAulas={2}>
          <AulaCard 
            disciplina="Yoga para Iniciantes"
            nivel="Iniciante"
            horario="07:00 - 08:30"
            professor="Prof. Carlos Santos"
            categoria="Bem-estar"
          />
          <AulaCard 
            disciplina="Fotografia Profissional"
            nivel="Intermediário"
            horario="09:00 - 12:00"
            professor="Prof. Carlos Santos"
            categoria="Arte"
          />
        </DiaSemana>

        {/* Exemplo: Domingo (Vazio) */}
        <DiaSemana dia="Domingo" quantidadeAulas={0} />

      </div>
    </div>
  );
}