import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function PrivateRoute() {
  const { isAuthenticated } = useContext(AuthContext);

  // Se não estiver autenticado, manda de volta pro login.
  // O "replace" apaga o histórico, impedindo que o usuário clique em "Voltar" no navegador e fure o bloqueio.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se tiver token, renderiza as telas filhas (Outlet) normais do sistema
  return <Outlet />;
}