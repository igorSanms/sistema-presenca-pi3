import { AppRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { TurmaProvider } from './contexts/TurmaContext';

export default function App() {
  return (
    <AuthProvider>
      <TurmaProvider>
        <AppRoutes />
      </TurmaProvider>
    </AuthProvider>
  );
}