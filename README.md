# Sistema para gerenciar presença (PI III - Equipe 5)

##  Stack 
* **Backend:** C# ASP.NET Core (.NET 10) + Entity Framework Core
* **Frontend:** React + TypeScript + Vite + Tailwind CSS
* **Banco de dados:** PostgreSQL (via Docker)

---

### Pré-requisitos
1. [Node.js](https://nodejs.org/) (versão LTS recomendada)
2. [.NET 10 SDK](https://dotnet.microsoft.com/download)
3. [Docker](https://www.docker.com/)
4. [Bruno](https://www.usebruno.com/) (Para testar e interagir com a API)
5. Git

### 1. Clonando o Repositório
Rode no terminal

```bash
git clone https://github.com/alisonpSWE/sistema-presenca.git
cd sistema-presenca
```

### 2. Subindo o Banco de Dados (Docker)
rode o comando abaixo na raiz do projeto:

```bash
docker compose up -d
```

*O banco de dados estará rodando em segundo plano na porta 5432 com as credenciais configuradas no arquivo docker-compose.yml.*

### 3. Rodando o Back-end (API C#)
Abra um novo terminal na raiz do projeto:

```bash
cd backend
dotnet run
```

*A API estará disponível localmente (geralmente em http://localhost:5249 ou https://localhost:5000).*
> 💡 Acesse a URL da API com /swagger no final (ex: http://localhost:5249/swagger) para visualizar a interface da API.
> 
> 🐶 Testes com Bruno: Nosso projeto utiliza o Bruno como cliente de API (alternativa ao Postman/Insomnia). Para realizar requisições, abra o aplicativo do Bruno, clique em "Open Collection" e selecione a pasta da collection do projeto disponível no repositório.

### 4. Rodando o Front-end (React)
Abra outro terminal na raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

*Acesse o link gerado no terminal para ver a interface.*

---

## ⚠️ Regras de Contribuição

Para que o projeto flua sem conflitos e sobreposição de trabalho, siga estritamente o fluxo abaixo:

1. **NUNCA faça push diretamente na branch main.**

2. **Atualize-se sempre:** Antes de começar a programar, garanta que sua versão local está atualizada:
```bash
git checkout main
git pull origin main
```

3. **Crie sua Branch:** Para cada nova funcionalidade ou correção, crie uma branch separada (use feature/ para novas entregas ou fix/ para correção de bugs):
```bash
git checkout -b feature/nome-da-sua-tarefa
```
4. **Comite e Envie:** Faça commits pequenos e descritivos:
```bash
git add .
git commit -m "feat: descreva o que você construiu"
git push origin feature/nome-da-sua-tarefa
```

6. **Revisão de Código (Pull Request):** Vá até o repositório no GitHub, abra um Pull Request (PR) da sua branch para a main. Peça para outro membro da equipe revisar seu código. **A funcionalidade só entra no main após a aprovação!**
