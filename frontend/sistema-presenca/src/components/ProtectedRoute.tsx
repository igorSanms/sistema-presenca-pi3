import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const perfil = localStorage.getItem('@SistemaPresenca:perfil');

  if (!perfil || !allowedRoles.includes(perfil)) {
    return <Navigate to="/painel" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
