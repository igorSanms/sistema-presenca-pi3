# Sistema para gerenciar presença (PI III - Equipe 5)

##  Stack 
* **Backend:** C# ASP.NET Core (.NET 10) + Entity Framework Core
* **Frontend:** React + TypeScript + Vite + Tailwind CSS
* **Banco de dados:** PostgreSQL
* **Container:** Docker 


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





### 2. Rodando o Sistema Completo (Docker)
Com o Docker aberto, rode o comando abaixo na raiz do projeto:

```bash
docker compose up -d --build

```

*Pronto! A infraestrutura inteira subirá automaticamente:*

* **Banco de Dados:** Porta `5432`
* **API (Backend):** http://localhost:5249/swagger
* **Interface (Frontend):** http://localhost:5173

> Já configurado com **Hot Reload**.

Para parar o sistema, rode:

```bash
docker compose down

```



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
