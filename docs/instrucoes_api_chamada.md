
###  Integração da API: Módulo "Chamada do Dia" e Assiduidade

**Aviso Geral:** Todos os endpoints abaixo são protegidos. É necessário enviar o Token JWT no *Header* da requisição (`Authorization: Bearer <token>`).

#### 1. Carregar a Lista do Dia

* **Rota:** `GET /api/frequencia/{data}`
* **Descrição:** Retorna a lista de todos os alunos ativos e seus respectivos status para uma data específica. Se o status vier `null`, a chamada daquele aluno ainda não foi feita hoje.
* **Formato da Data na URL:** `YYYY-MM-DD` (ex: `2026-06-04`).

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

*(Nota sobre o Status: 0 = Presente, 1 = Falta, 2 = Justificada)*

#### 2. Salvar/Atualizar a Chamada (Em Lote)

* **Rota:** `POST /api/frequencia`
* **Descrição:** Recebe a lista de alunos para registrar a frequência do dia. A API já possui lógica interna para não duplicar registros: se o aluno já tiver chamada hoje, ela apenas atualiza e ajusta as estatísticas de evasão automaticamente.

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

#### 3. Justificar Ausência Anterior

* **Rota:** `PUT /api/frequencia/justificar`
* **Acesso Restrito:** Apenas perfil `Coordenacao`.
* **Descrição:** Permite à coordenação transformar um registro de "Falta" em "Justificada" (ex: recebimento de atestado médico). O sistema recalcula automaticamente os contadores do aluno para removê-lo da zona de risco de evasão escolar.

**Exemplo de Corpo da Requisição (JSON):**

```json
{
  "alunoId": "e7720c15-509d-4341-8450-0abc1234def5",
  "data": "2026-06-04",
  "observacao": "Atestado médico entregue na secretaria."
}

```

**Exemplo de Resposta (200 OK):**

```json
{
  "message": "Falta justificada com sucesso. Contadores atualizados."
}

```

#### 4. Obter Alertas Progressivos de Evasão

* **Rota:** `GET /api/alertas`
* **Acesso Restrito:** Apenas perfil `Coordenacao`.
* **Descrição:** Retorna a lista de alunos que acumularam 3 ou mais faltas não justificadas, ordenados pelos casos mais críticos. Nível 1 indica 3 faltas. Nível 2 indica 4 ou mais faltas.

**Exemplo de Resposta (200 OK):**

```json
[
  {
    "alunoId": "f70d7088-15ac-4684-9354-55271b01cd12",
    "nome": "João da Silva",
    "faltasReais": 4,
    "nivelAlerta": 2
  },
  {
    "alunoId": "c44b9231-88bc-4123-1122-3def4567abc8",
    "nome": "Ana Souza",
    "faltasReais": 3,
    "nivelAlerta": 1
  }
]

```
