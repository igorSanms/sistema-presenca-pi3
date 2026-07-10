import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';

export function Cadastro() {
  const navigate = useNavigate();

  // Estados dos campos
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estados de controle
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // 1. Validação de campos vazios
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    // 2. Validação de tamanho mínimo da senha (regra do seu C#: MinLength(6))
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // 3. Validação de senhas idênticas
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      
      // Enviando para a API
      await authService.register({
        Nome: nome,
        Email: email,
        Senha: senha,
        Perfil: 0 // Enviando um perfil fixo temporariamente
      });

      alert('Cadastro realizado com sucesso! Faça login.');
      navigate('/login'); // Redireciona o usuário para logar

    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      // Se o backend mandar uma mensagem de erro específica (ex: "Email já cadastrado")
      if (err.response && err.response.data && err.response.data.message) {
        setErro(err.response.data.message);
      } else {
        setErro('Erro ao realizar cadastro. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white border border-gray-400 p-8 flex flex-col items-center">
        
        <img src={logoImg} alt="Logo Cursinho Aprendizes" className="w-24 mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Crie sua conta
        </h1>

        {erro && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {erro}
          </div>
        )}

        <form className="w-full" onSubmit={handleRegister}>
          <Input 
            label="Nome" 
            type="text" 
            placeholder="Digite seu nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          
          <Input 
            label="E-mail" 
            type="email" 
            placeholder="Digite seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input 
            label="Senha" 
            type="password" 
            placeholder="No mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <Input 
            label="Confirmar Senha" 
            type="password" 
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />

          <div className="mt-6">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>

        <div className="mt-4 w-full text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-800 hover:underline">
            Voltar para login
          </Link>
        </div>

      </div>
    </div>
  );
}