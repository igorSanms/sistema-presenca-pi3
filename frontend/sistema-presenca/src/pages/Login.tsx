import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';

export function Login() {
  const navigate = useNavigate();
  
  // Estados para guardar o que o usuário digita
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados para controle de interface
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede a página de recarregar
    setErro(''); // Limpa erros anteriores

    // Validação básica de front-end
    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true); // Ativa o estado de carregamento
      
      // Chama o serviço passando exatamente o formato que o C# espera
      const resposta = await authService.login({ 
        Email: email, 
        Senha: senha 
      });

      // Sucesso! Vamos imprimir no console para ver o que o backend nos devolveu (ex: Token)
      console.log('Retorno da API:', resposta);
      
      // Temporário até termos a tela de Chamada pronta
      alert('Login bem-sucedido! Verifique o console.');

    } catch (err) {
      console.error('Erro no login:', err);
      // Requisito FA01: Mensagem genérica de erro
      setErro('E-mail ou senha incorretos.');
    } finally {
      setLoading(false); // Desativa o carregamento, independente de sucesso ou falha
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white border border-gray-400 p-8 flex flex-col items-center">
        
        <img src={logoImg} alt="Logo Cursinho Aprendizes" className="w-24 mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Entre com suas credenciais para acessar o sistema
        </p>

        {/* Exibe a mensagem de erro se o estado 'erro' não for vazio */}
        {erro && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {erro}
          </div>
        )}

        <form className="w-full" onSubmit={handleLogin}>
          <Input 
            label="E-mail" 
            type="email" 
            placeholder="Digite seu e-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Input 
            label="Senha" 
            type="password" 
            placeholder="Digite sua senha" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <div className="flex justify-end w-full mb-6 mt-1">
            <Link to="/recuperar-senha" className="text-sm text-[#78A8D1] hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          {/* O botão fica desabilitado enquanto está carregando */}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-sm">
          <span className="text-gray-800">Não tem uma conta? </span>
          <Link to="/cadastro" className="text-[#78A8D1] hover:underline">
            Cadastre-se
          </Link>
        </div>

      </div>
    </div>
  );
}