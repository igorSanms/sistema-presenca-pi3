import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function RecuperarSenha() {
  // Hook para controlar a navegação via código (programática)
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Container principal */}
      <div className="w-full max-w-md bg-white border border-gray-400 p-8 flex flex-col items-center">
        
        {/* Logo */}
        <img src={logoImg} alt="Logo Cursinho Aprendizes" className="w-24 mb-4" />
        
        {/* Títulos centralizados */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Recuperação de Senha
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Informe seu e-mail e enviaremos instruções para redefinir sua senha, não esqueça de olhar o spam
        </p>

        {/* Formulário */}
        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
          <Input 
            label="E-mail" 
            type="email" 
            placeholder="Digite seu e-mail cadastrado"
          />

          {/* Grupo de botões com espaçamento */}
          <div className="mt-6 flex flex-col gap-3">
            <Button type="submit" variant="primary">
              Resgatar
            </Button>
            
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/login')}
            >
              Voltar para login
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}