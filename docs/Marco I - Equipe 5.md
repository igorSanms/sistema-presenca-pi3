**![][image1]**   
**UNIVERSIDADE FEDERAL DO CEARÁ**  
**CAMPUS DE CRATEÚS**   
**PROFESSOR: BRUNO RICCELLI DOS SANTOS SILVA**

  

Equipe: 

* ALISON PEREIRA SILVA  
* ANA RUTH SOARES DE ARAÚJO  
* DAVYD ALVES VIANA  
* JOSE IARLEY LIMA COSTA MELO  
* IGOR SANTANA SAMPAIO


  
Link Github: [GitHub](https://github.com/alisonpSWE/sistema-presenca.git)

# Marco I 

# **Documento de Visão e Escopo do Projeto**

##  **Apresentação**

Este documento tem como propósito apresentar a visão e escopo de um projeto para desenvolvimento de um sistema web para o gerenciamento de presença para de um curso comunitário gratuito. Aqui estarão descritos o objetivo do desenvolvimento do sistema, o problema a ser solucionado, o que o sistema deve contemplar ao final da implementação e a solução encontrada pela equipe responsável, focando na simplicidade operacional.

## **Descrição do Problema**

Gestores de instituições de ensino ou instrutores independentes frequentemente realizam o controle de frequência de forma manual ou através de planilhas eletrônicas genéricas (como o Excel). A falta de uma ferramenta dedicada e automatizada cria uma barreira para quem busca otimizar processos sem lidar com a complexidade de grandes sistemas de gestão escolar. Atualmente, isso resulta em um alto índice de erro humano no registro de presença, dificuldade em gerar relatórios de evasão em tempo real e uma sobrecarga administrativa desnecessária que consome o tempo que deveria ser dedicado ao ensino.

## **Visão**

Criar uma aplicação web intuitiva e responsiva, focada na simplicidade cognitiva, que centralize a experiência do usuário na “Chamada do Dia”. A ferramenta busca automatizar o registro de presença e oferecer a coordenação um controle de assiduidade simplificado, gerando relatórios de frequência e alertas de limite de falta de forma automática. O objetivo é remover a burocracia do preenchimento manual e das planilhas, permitindo que a coordenação tenha uma visão clara do engajamento dos alunos e da situação de cada turma em poucos cliques.

##  **Proposta de Solução**

Sistema web com (Front-end e Back-end) que conte com os seguintes serviços:

* **Chamada Digital Unificada:** Lista dinâmica de alunos do preparatório para registro de presença com um clique, otimizada para o fluxo de aulas diárias.  
* **Gestão de Perfis (Hierarquia):** Área autenticada com distinção entre Coordenação e Professor  
* **Controle de Assiduidade Automatizado:** Processamento automático do histórico de faltas e presenças por aluno, eliminando a necessidade de cálculos manuais no Excel.  
* **Layout Responsivo:** Interface otimizada para dispositivos móveis.

##  **Escopo do Projeto (O que será feito)**

* **Implementação do Back-end de Gestão:** Motor do sistema para processamento de frequências, gerenciamento de matrículas;  
* **Sistema de Autenticação e Controle de Acesso:** Estrutura de permissões segura, configurada para **Coordenação** (gestão total) e preparada para o perfil Professor (lançamento de chamada);  
* **Banco de Dados Centralizado:** Armazenamento seguro de dados dos alunos e histórico de presença para auditoria e consultas futuras;  
* **Módulo "Chamada do Dia":** Tela inicial otimizada com a lista completa de alunos do preparatório para marcação rápida (check-in);  
* **Gestão de Alunos:** Tela para cadastro, edição e visualização do status de cada estudante matriculado;  
* **Módulo de Relatórios:** Geração de relatórios de assiduidade e listas de presença por período;  
* **Infraestrutura Moderna:** Entrega da aplicação utilizando **Docker**, garantindo facilidade na implantação e manutenção do ambiente.  
    
  


##  **Fora do Escopo (O que o sistema NÃO fará)**

Para garantir a simplicidade e o foco total na gestão de presença, as seguintes funcionalidades não fazem parte desta versão do projeto:

* **Gestão Financeira e Pagamentos:** O sistema não realizará o processamento de mensalidades, não terá integração com gateways de pagamento (Pix, Cartão) e não emitirá boletos ou notas fiscais.  
* **Pagamento de Professores:** Não haverá módulo para cálculo de horas-aula, folha de pagamento ou repasses financeiros para o corpo docente. O foco é estritamente pedagógico (frequência).  
* **Controle de Estoque:** O sistema não gerenciará materiais físicos do curso (apostilas, fardamentos ou materiais de escritório). Não haverá contagem de inventário ou controle de entrada e saída de itens.  
* **Portal do Aluno:** O sistema é de uso administrativo interno (Coordenação/Professor). Não haverá interface para que o aluno consulte suas próprias faltas ou baixe materiais de estudo.  
* **Notificações Automáticas:** Não está previsto o envio automatizado de mensagens (WhatsApp, SMS ou E-mail) para os pais ou alunos informando sobre ausências ou avisos gerais.  
* **Gestão de Notas e Avaliações:** O escopo limita-se à assiduidade (presença). Não contempla o lançamento de notas de simulados, boletins ou cálculos de desempenho acadêmico.  
* **Geração de Relatórios:** O sistema não terá módulos para exportação de arquivos (PDF ou Excel) ou geração de relatórios gerenciais complexos. O foco é a consulta direta na tela do sistema.

# **Levantamento inicial de requisitos**

### **1\. Contexto e Visão Geral**

Gestores de cursos preparatórios frequentemente realizam o controle de assiduidade de forma rudimentar, utilizando planilhas eletrônicas (Excel) que demandam preenchimento manual e dificultam a consulta rápida ao histórico de um aluno. A complexidade de softwares de gestão acadêmica robustos é uma barreira para quem busca apenas uma transição digital focada em agilidade e organização.

O projeto visa o desenvolvimento de uma aplicação web intuitiva e responsiva, focada na **simplicidade operacional**. O sistema centralizará o fluxo de trabalho na tela **"Chamada do Dia"**, otimizando o registro de frequência da turma unificada. A aplicação contará com dois níveis de permissão: a **Coordenação**, com controle total sobre o cadastro e consulta de dados; e o **Professor**, com acesso focado no lançamento da presença, permitindo que a instituição tenha um histórico digital centralizado e de fácil acesso, eliminando a dependência de arquivos de planilhas isolados.

**Atores do sistema**  
**Administrador:** Responsabilidades de gerenciamento completo do sistema, incluindo a criação de disciplinas, adição e remoção de professores e alunos, além da possibilidade de realizar a chamada.   
**Professor:** Ações de realização da chamada diária e inserção de observações sobre os alunos (opcional).

## **2\. Requisitos Funcionais (Qtd: 10\)**

**RF001: Autenticação e Controle de Acesso**  
**Atores:** Coordenação, Professor  
**Descrição:**    
O sistema deve permitir que os usuários realizem login através de e-mail e senha. O sistema deve gerenciar o controle de acesso de forma hierárquica, onde o perfil "Coordenação" possui privilégios de administrador (gestão de alunos, professores, disciplinas e histórico total), e o perfil "Professor" possui acesso restrito às funcionalidades operacionais de sala de aula (realização de chamadas e inserção de observações).  
**Fluxo Normal \- Acesso ao Sistema:**

1. O usuário acessa a tela de login.  
2. O usuário preenche os campos de e-mail e senha.  
3. O sistema valida as credenciais informadas no banco de dados.  
4. O sistema identifica o nível de permissão (perfil) do usuário.  
5. O sistema redireciona o usuário para a interface correspondente ao seu perfil (ex:"Chamada do Dia" para Professor e Coordenação).

**Fluxos Alternativos:**  
**FA01 \- Credenciais Inválidas:**  
O sistema exibe uma mensagem genérica: "E-mail ou senha incorretos" e mantém o usuário na tela de login.  
**Critérios de Aceitação:**  
1\) Cenário: Login bem-sucedido do Professor

* **Dado** que o Professor está na tela de login  
* **Quando** preenche e-mail e senha válidos já cadastrados  
* **E** clica no botão de entrar  
* **Então** o sistema cria uma sessão segura  
* **E** redireciona o Professor para realizar a tela inicial

---

**RF002: Cadastro de Pessoas (Professores e Alunos)**  
**Atores: Coordenação**  
**Descrição:**  
O sistema permite que o perfil de Coordenação cadastre e gerencie as pessoas envolvidas no curso. Para Professores, registra-se Nome, e-mail, telefone e área de atuação. Para Alunos, registra-se Nome, e-mail, telefone, além de inicializar os contadores de Presença, Falta e Justificativa vinculados ao histórico do estudante.  
**Fluxo Normal \- Cadastro de Aluno:**

1. O usuário (Coordenação) acessa a área de "Gestão de Alunos".  
2. O usuário clica em "Novo Aluno".  
3. O usuário preenche as informações obrigatórias (Nome e telefone).  
4. O usuário clica em "Cadastrar".  
5. O sistema valida os dados, cria o registro do aluno com contadores de frequência zerados e exibe mensagem de sucesso

**Fluxos Alternativos:**  
**FA01 \- E-mail já cadastrado:**  
O sistema impede o cadastro e exibe a mensagem: "Este e-mail já está em uso por outro aluno/professor".  
**Critérios de Aceitação:**  
1\) Cenário: Cadastro de aluno concluído

* **Dado** que a Coordenação está na tela de cadastro de alunos  
* **Quando** preenche todos os campos obrigatórios corretamente  
* **E** clica em salvar  
* **Então** o sistema salva os dados do novo aluno  
* **E** inicializa seus contadores de faltas e presenças em zero

---

**RF003: Realizar Chamada Unificada e Observações**  
**Atores:** Professor, Coordenação  
**Descrição:**  
O sistema deve fornecer uma interface de chamada ("Chamada do Dia") que exibe a lista unificada de alunos. O registro de presença é único por dia, possuindo efeito sobre todas as aulas daquela data. Durante o ato da chamada, o usuário pode inserir notas de texto curtas (observações diárias) relacionadas ao comportamento ou aviso sobre um aluno específico.  
**Fluxo Normal \- Realizar Chamada:**

1. O usuário acessa o módulo "Chamada do Dia".  
2. O sistema carrega automaticamente a lista de todos os alunos ativos para a data corrente.  
3. O usuário marca o status de cada aluno (Presença, Falta ou Justificativa).   
4. (Opcional) O usuário escreve no campo observação ao lado de aulas matriculadas e insere uma nota de texto.  
5. O usuário clica em "Salvar Chamada".  
6. O sistema salva os registros e atualiza os contadores de assiduidade de todos os alunos processados.

**Fluxos Alternativos:**  
**FA01 \- Chamada já realizada na data:**  
O sistema carrega a lista já preenchida e altera o botão para "Atualizar Chamada",   
permitindo correções.  
**Critérios de Aceitação:**  
1\) Cenário: Salvamento de chamada diária

* **Dado** que a lista de alunos do dia está carregada na tela  
* **Quando** o Professor finaliza a marcação de presenças e faltas  
* **E** clica em "Finalizar Chamada"  
* **Então** o sistema atualiza o histórico de frequência do dia  
* **E** processa a contagem individual de faltas para acionar alertas, se necessário

---

**RF004: Justificar Ausência**  
**Atores**: Coordenação  
Descrição:  
O sistema deve permitir que a Coordenação altere o status de uma falta registrada anteriormente para "Justificada" (ex: atestado médico). Faltas sinalizadas como justificadas não são contabilizadas no limite de alertas de evasão do aluno.  
**Fluxo Normal \- Justificativa:**

1. O usuário acessa o histórico da chamada de uma data passada.  
2. O usuário localiza o registro de ausência (Falta).  
3. O usuário altera o status de "Falta" para "Justificativa".  
4. O sistema recalcula imediatamente os contadores de "Faltas Reais" do aluno, subtraindo esta ocorrência.

**Critérios de Aceitação:**  
1\) Cenário: Abono de falta via justificativa

* **Dado** que um aluno possui uma falta registrada  
* **Quando** a Coordenação altera esse registro para "Falta Justificada"  
* **Então** o sistema atualiza o status no banco de dados  
* **E** deduz essa falta do contador de faltas para o sistema de alertas

---

**RF005: Sistema de Alertas Progressivos**  
**Atores:** Sistema, Coordenação  
**Descrição:**  
O sistema deve monitorar o acúmulo de Faltas Reais (não justificadas) de cada aluno. Ao atingir limites predefinidos, o sistema deve gerar notificações automáticas na interface (dashboard) exclusivas para a Coordenação tomarem decisões pedagógicas.  
**Fluxo Normal \- Emissão de Alerta:**

1. O Professor finaliza uma chamada, registrando novas faltas.  
2. O sistema processa a soma de faltas totais de cada aluno.  
3. Se o aluno atingir 3 faltas reais, o sistema gera o "Alerta 1" (Intervenção/Conversa).  
4. Se o aluno atingir 4 faltas reais, o sistema gera o "Alerta 2" (Risco de Desligamento).  
5. A Coordenação visualiza os alertas destacados na tela inicial.

**Critérios de Aceitação:**  
1\) Cenário: Geração de Alerta de 3 Faltas

* **Dado** que o aluno acumulou exatamente sua 3a falta não justificada  
* **Quando** a chamada do dia for salva  
* **Então** o sistema cria um Alerta de Nível 1 no painel da Coordenação

---

**RF006: Gestão de Disciplinas**   
**Atores:** Coordenação   
**Descrição:**   
O sistema deve permitir que a Coordenação cadastre, edite e exclua as disciplinas ofertadas no curso. O cadastro deve conter as informações: nome, descrição, professor responsável, duração, categoria, nível, preço, dias da semana e horários de início e término. **Fluxo Normal \- Cadastro de Disciplina:**

1. A coordenação acessa a tela de "Gestão de Disciplinas" e clica em "Nova Disciplina".  
2. O usuário preenche todos os dados obrigatórios e seleciona os dias da semana.  
3. O usuário seleciona o Professor responsável a partir de uma lista de professores cadastrados.  
4. O usuário clica em "Salvar".  
5. O sistema valida as informações e salva a disciplina no banco de dados. 

**Fluxos Alternativos:**   
**FA01 \- Professor não selecionado:** O sistema impede o salvamento e exibe um alerta indicando que a disciplina precisa obrigatoriamente estar vinculada a um professor cadastrado.   
**Critérios de Aceitação:**   
**1\) Cenário: Cadastro de disciplina com sucesso**   
**Dado** que a Coordenação está na tela de nova disciplina   
**Quando** preenche os dados, dias da semana e seleciona um professor válido   
**E** clica em "Salvar"  
**Então** o sistema armazena a disciplina **E** a disponibiliza na grade curricular do sistema  
---

**RF007: Consulta ao Histórico de Chamadas Anteriores**   
**Atores:** Coordenação   
**Descrição:**   
O sistema deve permitir que a Coordenação consulte listas de presenças de dias anteriores utilizando um filtro de data. Isso permite a visualização de quem estava presente, quem faltou e a leitura das observações deixadas pelos professores naqueles dias.   
**Fluxo Normal \- Consulta de Histórico:**

1. A Coordenação acessa a aba "Histórico".  
2. O usuário seleciona uma data específica no calendário.  
3. O sistema busca no banco de dados e exibe a lista unificada de alunos daquele dia com seus respectivos status (Presente, Falta, Justificada) e observações. 

**Fluxos Alternativos:**   
**FA01 \- Data sem chamada registrada:**   
O sistema exibe a mensagem "Nenhuma chamada foi registrada para esta data".   
**Critérios de Aceitação:**   
**1\) Cenário: Visualização de chamada passada**   
**Dado** que a Coordenação deseja rever uma chamada   
**Quando** seleciona uma data anterior no calendário   
**Então** o sistema exibe o status de presença exato de todos os alunos naquele dia específico  
---

**RF008: Edição e Remoção de Cadastros (Alunos e Professores)** 

**Atores:** Coordenação   
**Descrição:**   
O sistema deve permitir a atualização de dados cadastrais (telefone, e-mail) de alunos e professores, bem como a remoção de perfis. Alunos inativados (que saíram do curso) não devem aparecer na lista da "Chamada do Dia".

**Fluxo Normal \- Remoção de Aluno:**

1. A Coordenação acessa a lista de Alunos.  
2. O usuário busca pelo aluno desejado e clica em "Excluir".  
3. O sistema atualiza e remove o aluno da geração das próximas listas de chamada. 

**Fluxos Alternativos:**   
**FA01 \- Edição com e-mail inválido:** Ao tentar salvar um dado atualizado com formato de e-mail incorreto, o sistema bloqueia a ação e pede a correção do campo.   
**Critérios de Aceitação:**   
**1\) Cenário: Remoção de Aluno**   
**Dado** que um aluno desistiu (ou excedeu limite de falta)   
**Quando** a Coordenação clica em excluir  
**Então** o aluno deixa de aparecer na tela de “Chamada do Dia”  
**E** todo o seu histórico de faltas e presenças some do Banco de Dados  
---

**RF009: Visualização do Perfil Individual do Aluno** 

**Atores:** Coordenação   
**Descrição:**   
O sistema deve possuir uma tela de detalhes para cada aluno, onde a Coordenação possa visualizar rapidamente as informações de contato (telefone, e-mail) e um painel de estatísticas mostrando a contagem total de presenças, faltas reais e faltas justificadas ao longo do curso.   
**Fluxo Normal \- Visualizar Perfil:**

1. A Coordenação acessa a lista de Alunos.  
2. O sistema abre o Perfil dos Alunos, calculando e exibindo as contagens exatas de assiduidade baseadas no histórico. 

**Critérios de Aceitação:**   
**1\) Cenário: Consulta de assiduidade do aluno**   
**Dado** que a Coordenação precisa ver a situação de um aluno  
**Quando** clica no perfil desse aluno   
**Então** o sistema exibe a soma atualizada de suas presenças e faltas na tela  
---

**RF010: Recuperação de Senha de Acesso** 

**Atores:** Professor, Coordenação   
**Descrição:**   
O sistema deve fornecer um mecanismo seguro para redefinição de senha caso o usuário esqueça suas credenciais, através do envio de um link de recuperação para o e-mail cadastrado. **Fluxo Normal \- Solicitação de Recuperação:**

1. Na tela de login, o usuário clica em "Esqueci minha senha".  
2. O usuário informa seu e-mail cadastrado e clica em "Enviar link".  
3. O sistema verifica se o e-mail existe na base de dados.  
4. O sistema gera um token e envia um e-mail com o link de redefinição. 

**Fluxos Alternativos:**   
**FA01 \- E-mail não encontrado:**   
Por segurança, o sistema exibe uma mensagem genérica "Se o e-mail estiver cadastrado, um link de recuperação será enviado", para não revelar quais e-mails estão no banco de dados.   
**Critérios de Aceitação:**   
**1\) Cenário: Solicitação de redefinição de senha**   
**Dado** que o usuário esqueceu a senha   
**Quando** solicita a recuperação preenchendo um e-mail válido  
**Então** o sistema envia as instruções para o e-mail informado de forma automática

## **3\. Requisitos Não Funcionais (Qtd: 6\)**

### **3.1. Usabilidade e Desempenho**

* **RNF01 (Simplicidade):** Interface de chamada em lista única para marcação em massa (foco em velocidade).  
* **RNF02 (Responsividade):** Layout *Mobile First* para tablets e smartphones.  
* **RNF03 (Eficiência):** Abertura da lista de alunos e salvamento da chamada em menos de 2 segundos.

### **3.2. Segurança e Tecnologia**

* **RNF04 (Hash de Senha):** Criptografia de senhas (BCrypt ou Argon).  
* **RNF05 (Arquitetura):** Aplicação Web com separação entre Front-end e Back-end (API).  
* **RNF06 (Conteinerização):** Entrega via Docker.

## **4\. Priorização de Requisitos**

* **Essenciais (MVP):** RF001, RF002 (Alunos), RF003, RF004, RF005 (Alerta de 3 e 4 faltas), RNF01, RNF06.  
* **Importantes:** RF002 (Professores), RNF02.  
* **Desejáveis:** Gestão de perfil de usuário pelo próprio usuário.

# 

# 

# 

# **Diagrama de Casos de Uso**

# 

# **Casos textual** 

**Caso Textual 1:**   
**Titulo:** Realizar Login (Refere-se ao UC01)   
**Objetivo:** Autenticar o usuário via e-mail e senha para conceder acesso ao sistema. **Pré-condição:** Usuário deve estar cadastrado e na tela de login.   
**Fluxo:** Usuário acessa a tela de Login \-\>   
Usuário preenche e-mail e senha \-\>   
Login **\<\<include\>\>** Validação de informação \-\>   
Login **\<\<extends\>\>** Exibir erro de validação (caso dados incorretos) \-\>   
Acesso liberado e redirecionado para a tela inicial.   
**Pós-condição:** Usuário autenticado com sucesso.  
---

**Caso Textual 2:**   
**Título:** Recuperar Senha (Refere-se ao UC02)   
**Objetivo:** Permitir que o usuário redefina suas credenciais de acesso esquecidas. **Pré-condição:** Usuário deve estar na tela de Login e possuir um e-mail cadastrado.   
**Fluxo:** Usuário clica em "Esqueci minha senha" \-\>   
Recuperar senha **\<\<include\>\>** Validação de informação \-\>   
Recuperar senha **\<\<include\>\>** Atualizar informação \-\>   
Atualizar informação **\<\<include\>\>** Confirmação de e-mail \-\>  
Usuário salva a nova senha.   
**Pós-condição:** Credenciais redefinidas e e-mail de confirmação enviado.  
---

**Caso Textual 3:**   
**Titulo:** Fazer Chamada (Agrupa UC03, UC04 e UC05)   
**Objetivo:** Registrar a presença, falta ou justificativa de cada aluno, podendo inserir observações.   
**Pré-condição:** Usuário logado (Coordenação ou Professor) na tela "Chamada do Dia". **Fluxo:** Usuário acessa a lista de alunos do dia \-\>  
Usuário marca o status de frequência \-\>   
Fazer chamada **\<\<extends\>\>** Inserir observação (optativo) \-\>  
Usuário clica em salvar \-\>   
Chamada registrada com sucesso.   
**Pós-condição:** Frequência salva e contadores de faltas dos alunos atualizados.  
---

**Caso Textual 4:**   
**Titulo:** Gerenciar Alunos e Professores (Agrupa UC08 e UC09)   
**Objetivo:** Cadastrar, consultar, editar ou excluir informações da base de usuários. **Pré-condição:** Usuário logado com perfil de Coordenação na área de gestão.   
**Fluxo:** Coordenação acessa a lista de alunos/professores \-\>   
Coordenação preenche ou edita o formulário de dados \-\>   
Gerenciar pessoas **\<\<include\>\>** Validação de informação \-\>   
Gerenciar pessoas **\<\<extends\>\>** Exibir erro de validação (se o e-mail já existir) \-\> Informações salvas.  
**Pós-condição:** Base de dados de alunos e professores atualizada.  
---

**Caso Textual 5:**   
**Titulo:** Gerenciar Disciplinas (Refere-se ao UC10)   
**Objetivo:** Permitir o cadastro, edição e exclusão das matérias do curso.   
**Pré-condição:** Usuário logado com perfil de Coordenação na área de disciplinas.   
**Fluxo:** Coordenação acessa painel de Disciplinas \-\>   
Coordenação preenche informações (nome, duração, horários) \-\>   
Gerenciar Disciplinas **\<\<include\>\>** Validação de informação \-\>   
Disciplina criada/editada com sucesso.   
**Pós-condição:** Grade de disciplinas do preparatório atualizada.  
---

**Caso Textual 6:**  
**Titulo:** Consultar e Editar Histórico de Chamada (Agrupa UC06 e UC07)   
**Objetivo:** Navegar por datas passadas para visualizar presenças ou justificar ausências. **Pré-condição:** Usuário logado com perfil de Coordenação.   
**Fluxo:** Coordenação acessa o Histórico de Chamadas \-\>   
Coordenação seleciona uma data passada \-\>  
Sistema exibe a lista de presença daquele dia \-\>   
Consultar Histórico **\<\<extends\>\>** Editar histórico de chamada (para justificar uma falta) \-\> Alteração confirmada.   
**Pós-condição:** Registros exibidos na tela e contador de faltas reais do aluno ajustado (se houver edição).  
---

**Caso Textual 7:**   
**Titulo:** Visualizar Alertas de Falta (Refere-se ao UC11)   
**Objetivo:** Acompanhar as notificações automáticas de evasão escolar.   
**Pré-condição:** Usuário logado com perfil de Coordenação.   
**Fluxo:** Coordenação acessa o painel de alertas \-\>  
Sistema exibe notificações de alunos com 3 ou 4 faltas \-\>   
Visualizar Alertas **\<\<extends\>\>** Consultar Perfil do Aluno (caso a coordenação queira ver os detalhes) \-\>   
Coordenação marca o alerta como lido. **Pós-condição:** Coordenação ciente da necessidade de intervenção.  
---

**Caso Textual 8:**   
**Titulo:** Gerenciar Perfil (Refere-se ao UC13)   
**Objetivo:** Permitir ao usuário logado alterar seus próprios dados de cadastro. **Pré-condição:** Usuário logado no sistema.   
**Fluxo:** Usuário acessa as configurações de perfil \-\>  
Usuário altera e-mail, telefone ou senha \-\>   
Gerenciar Perfil **\<\<include\>\>** Validação de informação \-\>   
Dados salvos com sucesso.   
**Pós-condição:** Credenciais de acesso do próprio usuário atualizadas.

# 

# **Modelo ER**

# 

# **Protótipo de alta fidelidade**

Link para o Figma : [Figma](https://www.figma.com/design/5Yj1MC434PrHJU1nRnoknG/Projeto-integrador-III?node-id=0-1&t=bhpx8gG0jHNHOfo9-1)  


[image1]: <data:image/png;base64,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>