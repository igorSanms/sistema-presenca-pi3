import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Cadastro } from '../pages/Cadastro';
import { RecuperarSenha } from '../pages/RecuperarSenha';
import { ConfirmacaoEnvio } from '../pages/ConfirmacaoEnvio';
import { AlterarSenha } from '../pages/AlterarSenha';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/confirmacao" element={<ConfirmacaoEnvio />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
      </Routes>
    </BrowserRouter>
  );
}