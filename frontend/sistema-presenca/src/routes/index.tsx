import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Cadastro } from '../pages/Cadastro';
import { RecuperarSenha } from '../pages/RecuperarSenha';
import { ConfirmacaoEnvio } from '../pages/ConfirmacaoEnvio';
import { AlterarSenha } from '../pages/AlterarSenha';
import { PrivateRoute } from './PrivateRoute';
import { DefaultLayout } from '../layouts/DefaultLayout';
import { Painel } from '../pages/Painel'; // Vamos criar este arquivo no próximo passo
import { NovaDisciplina } from '../pages/NovaDisciplina';
import { EditarDisciplina } from '../pages/EditarDisciplina';
import { Chamada } from '../pages/Chamada';
import { Alunos } from '../pages/alunos/Alunos';
import { NovoAluno } from '../pages/alunos/NovoAluno';
import { EditarAluno } from '../pages/alunos/EditarAluno';
import { AlunoDisciplinas } from '../pages/alunos/AlunoDisciplinas';
import { Professores } from '../pages/Professores';
import { NovoProfessor } from '../pages/NovoProfessor';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas (Qualquer um acessa) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/confirmacao" element={<ConfirmacaoEnvio />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />

        {/* Rotas Privadas (Só entra com Token) */}
        <Route element={<PrivateRoute />}>
          {/* Todas as rotas aqui dentro herdam o Header por causa do DefaultLayout */}
          <Route element={<DefaultLayout />}>
          <Route path="/painel" element={<Painel />} />
          <Route path="/disciplinas/nova" element={<NovaDisciplina />} />
          <Route path="/disciplinas/editar/:id" element={<EditarDisciplina />} />
          <Route path="/chamada/:dia" element={<Chamada />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/alunos/novo" element={<NovoAluno />} />
          <Route path="/alunos/editar/:id" element={<EditarAluno />} />
          <Route path="/alunos/:id/disciplinas" element={<AlunoDisciplinas />} />
          <Route path="/professores" element={<Professores />} />
          <Route path="/professores/novo" element={<NovoProfessor />} />
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}