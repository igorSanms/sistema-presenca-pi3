import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export function ConfirmacaoEnvio() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Container principal (Notar o rounded-xl para ficar com a borda mais arredondada como no Figma) */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center shadow-sm">
        
        {/* Ícone de Sucesso (Círculo Verde + Check) */}
        <div className="w-20 h-20 bg-[#E6F8ED] rounded-full flex items-center justify-center mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-10 h-10 text-[#00B050]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        
        {/* Textos */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          E-mail Enviado!
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center px-4">
          Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
        </p>

        {/* Botão com variante Outline e Ícone de Seta */}
        <div className="w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/login')}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-4 h-4 mr-2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Voltar para o Login
          </Button>
        </div>

      </div>
    </div>
  );
}