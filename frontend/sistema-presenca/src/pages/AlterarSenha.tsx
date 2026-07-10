import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function AlterarSenha() {
  const navigate = useNavigate();

  // Função simulada para o envio do formulário
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // No futuro (Etapa 4), aqui chamaremos a API do backend para atualizar a senha.
    // Por enquanto, apenas redirecionamos para o login.
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Container principal */}
      <div className="w-full max-w-md bg-white border border-gray-400 p-8 flex flex-col items-center">
        
        {/* Título */}
        <h1 className="text-xl font-bold text-gray-900 mb-8 mt-4 text-center">
          Alterar Senha
        </h1>

        {/* Formulário */}
        <form className="w-full" onSubmit={handleSavePassword}>
          <Input 
            label="Nova Senha" 
            type="password" 
            placeholder="Digite a nova senha"
          />

          <Input 
            label="Confirme Nova Senha" 
            type="password" 
            placeholder="Repita a nova senha"
          />

          {/* O botão fica um pouco menor nesta tela pelo protótipo, mas 
              manteremos o w-full do nosso componente para consistência móvel. 
              Se quiser ele menor, podemos envelopar numa div. */}
          <div className="mt-6 flex justify-center">
            <div className="w-40">
              <Button type="submit" variant="primary">
                Salvar
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}