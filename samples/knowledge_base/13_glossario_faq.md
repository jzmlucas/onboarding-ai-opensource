# Glossário e Perguntas Frequentes
**Versão:** 1.0 | **Área:** Conhecimento Operacional | **Natureza:** material educativo

## 1. Glossário
**Alçada:** limite de autoridade para aprovar uma solicitação.  
**Aprovador:** usuário autorizado a decidir sobre uma solicitação.  
**Auditoria:** registro e análise de atividades para verificar conformidade e rastreabilidade.  
**Centro de custo:** unidade gerencial usada para classificar e analisar gastos.  
**Chunk:** fragmento de texto criado para indexação e recuperação em sistemas RAG.  
**Customer Success:** área orientada a ajudar clientes a alcançar resultados com o produto.  
**Dados mestres:** dados de referência usados por diferentes processos, como colaboradores, unidades e centros de custo.  
**Embedding:** representação numérica de conteúdo usada para comparar similaridade semântica.  
**Escalonamento:** encaminhamento de um problema para nível ou equipe responsável.  
**Handoff:** passagem estruturada de contexto entre equipes.  
**LLM:** modelo de linguagem de grande escala capaz de interpretar e gerar texto.  
**Onboarding:** processo de implantação e início de uso de um produto ou serviço.  
**Pendência:** item que precisa de informação, correção, decisão ou ação antes de avançar.  
**Política de despesas:** conjunto de regras que orienta despesas corporativas.  
**RAG:** técnica que recupera informações de uma base externa e fornece contexto ao modelo generativo.  
**Retrabalho:** repetição de atividade devido a erro, falta de informação ou necessidade de correção.  
**SLA:** acordo ou meta formal de nível de serviço.  
**Segregação de funções:** separação de atividades para reduzir conflito de interesse e risco.  
**Substituto:** pessoa formalmente autorizada a assumir uma atividade durante ausência do responsável.  
**Trilha de auditoria:** histórico de quem fez o quê, quando e por qual motivo.

## 2. Perguntas frequentes

### O que é onboarding?
É o processo estruturado que prepara o cliente para utilizar uma solução, incluindo descoberta, coleta de dados, configuração, testes, treinamento e acompanhamento inicial.

### Qual é a diferença entre onboarding e suporte?
Onboarding é normalmente proativo e orientado à implantação e adoção inicial. Suporte tende a resolver dúvidas e problemas durante o uso. As responsabilidades podem se sobrepor conforme a organização.

### O que fazer quando falta uma informação?
Registrar a pendência, indicar o campo ausente, explicar por que é necessário, definir responsável e solicitar confirmação. Não preencher por suposição.

### O que fazer quando dois documentos divergem?
Registrar as versões, comparar os dados, identificar o responsável pela decisão e pedir confirmação. Não escolher silenciosamente um dos documentos.

### A IA pode aprovar um cadastro?
Não neste processo. A IA pode identificar riscos e sugerir correções, mas a decisão final permanece com a pessoa autorizada.

### O que é um erro impeditivo?
É uma inconsistência que impede avançar com segurança ou qualidade. Exemplo: falta de aprovador obrigatório em uma configuração que depende dele.

### O que é um alerta?
É um achado que merece atenção, mas pode ser válido após confirmação. Exemplo: um usuário sem gestor em uma estrutura que permite esse caso.

### Por que não usar somente IA para validar planilhas?
Porque regras objetivas são mais previsíveis e auditáveis em código. IA é útil para interpretar contexto, mas não deve substituir validações determinísticas.

### O que é RAG?
É uma arquitetura que busca trechos relevantes em documentos e os fornece ao LLM para responder com base em conhecimento recuperado.

### Como reduzir alucinações no RAG?
Usar fontes aprovadas, chunks coerentes, recuperação adequada, instrução para admitir ausência de evidência, referências, testes e revisão humana.

### O que fazer se a base não responder?
Dizer que a documentação disponível não contém informação suficiente, indicar o dado necessário e encaminhar ao responsável. Não inventar uma regra.

### Qual é a diferença entre departamento e centro de custo?
Departamento representa uma estrutura organizacional. Centro de custo é uma classificação gerencial de gastos. Podem se relacionar, mas não são necessariamente equivalentes.

### O que é uma matriz de aprovação?
É a definição de quem aprova cada tipo ou faixa de solicitação, considerando regras como valor, categoria, unidade e hierarquia.

### Quando escalar um problema?
Quando houver risco de segurança, impacto financeiro, bloqueio crítico, necessidade de permissão especial, falha técnica sem diagnóstico ou falta de autoridade para decidir.

### Como medir eficiência?
Acompanhar tempo por etapa, retrabalho, completude na primeira submissão, pendências, cumprimento de prazo e satisfação, sempre com definições claras.

## 3. Termos que não devem ser confundidos
- Configuração concluída não significa adoção concluída.
- Arquivo recebido não significa arquivo validado.
- Campo preenchido não significa dado correto.
- Formato válido não significa dado verdadeiro.
- Alerta não significa erro.
- Sugestão da IA não significa decisão aprovada.
- SLA interno não é automaticamente compromisso contratual.
- Centro de custo não é necessariamente departamento.
