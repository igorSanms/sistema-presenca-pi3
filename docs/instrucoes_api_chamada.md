### Integração da API: Módulo "Chamada do Dia"

**Aviso Geral:** Todos os endpoints abaixo são protegidos. É necessário enviar o Token JWT no _Header_ da requisição (`Authorization: Bearer <token>`).

#### 1. Carregar a Lista do Dia

- **Rota:** `GET /api/frequencia/{data}`
- **Descrição:** Retorna a lista de todos os alunos ativos e seus respectivos status para uma data específica. Se o status vier `null`, a chamada daquele aluno ainda não foi feita hoje.
- **Formato da Data na URL:** `YYYY-MM-DD` (ex: `2026-06-04`).

**Exemplo de Resposta (200 OK):**

```json
[
  {
    "alunoId": "e7720c15-509d-4341-8450-0abc1234def5",
    "nome": "João da Silva",
    "status": null,
    "observacao": null
  },
  {
    "alunoId": "f8831d26-61ae-5452-9561-1bcd2345efg6",
    "nome": "Maria Souza",
    "status": 0,
    "observacao": "Chegou no segundo tempo"
  }
]
```

_(Nota sobre o Status: 0 = Presente, 1 = Falta, 2 = Justificada)_

#### 2. Salvar/Atualizar a Chamada (Em Lote)

- **Rota:** `POST /api/frequencia`
- **Descrição:** Recebe a lista de alunos para registrar a frequência do dia. A API já possui lógica interna para não duplicar registros: se o aluno já tiver chamada hoje, ela apenas atualiza e ajusta as estatísticas de evasão automaticamente.

**Exemplo de Corpo da Requisição (JSON):**

```json
{
  "data": "2026-06-04",
  "alunos": [
    {
      "alunoId": "e7720c15-509d-4341-8450-0abc1234def5",
      "status": 1,
      "observacao": "Faltou sem avisar"
    },
    {
      "alunoId": "f8831d26-61ae-5452-9561-1bcd2345efg6",
      "status": 0,
      "observacao": ""
    }
  ]
}
```

**Exemplo de Resposta (200 OK):**

```json
{
  "message": "Chamada registrada e contadores atualizados com sucesso."
}
```
