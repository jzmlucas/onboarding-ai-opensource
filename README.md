# OnboardIA

Aplicação de demonstração para equipes de implantação B2B e Customer Success. Reúne processos de onboarding, documentos, verificações de planilhas e um copiloto que consulta o material enviado.

> **Demonstração com dados fictícios.** Os clientes, políticas, valores e documentos em `samples/` são exemplos inventados. O projeto não é afiliado à VExpenses nem se conecta a serviços internos da empresa.

## O que este MVP resolve

Informações de uma implantação podem ficar espalhadas entre arquivos, mensagens e planilhas. O OnboardIA demonstra um lugar para organizar o processo, localizar orientações e identificar itens que precisam de revisão.

Você pode cadastrar empresas, enviar documentos, acompanhar a fila de processamento, consultar trechos relevantes com busca semântica, conferir algumas verificações automáticas de planilhas, receber sugestões de pendências, preparar rascunhos de comunicação e analisar relatos recebidos pelo WhatsApp via Evolution API.

A IA não aprova cadastros nem altera configurações. No canal WhatsApp conectado, ela pode fazer o atendimento inicial automático, com respostas baseadas no contexto recuperado; analistas podem revisar as conversas, respostas e recomendações no OnboardIA. Este MVP serve para demonstração técnica e experimentação. Não está pronto para armazenar dados reais ou confidenciais e não substitui uma plataforma de gestão de despesas.

## Requisitos

- Docker Desktop com Docker Compose v2 instalado e em execução.
- Git para clonar o repositório.
- Internet na primeira execução para baixar imagens, dependências e o modelo de embeddings.
- Chave válida do Gemini para geração de respostas, ou espaço em disco para instalar o modelo local Ollama.

## Instalação no Windows

Abra o PowerShell e clone o repositório:

```powershell
git clone https://github.com/jzmlucas/onboarding-ai-opensource.git
cd onboarding-ai-opensource
Copy-Item .env.example .env
notepad .env
```

Se você já recebeu os arquivos do projeto, abra o PowerShell na pasta do projeto e execute apenas os comandos `Copy-Item` e `notepad`.

No arquivo `.env`, configure:

1. `GEMINI_API_KEY`: chave do Gemini para geração de respostas e transcrição de áudio. Se pretende usar somente Ollama, deixe vazia.
2. `POSTGRES_PASSWORD`: senha local para o banco.
3. `DATABASE_URL`: substitua a senha dentro da URL pela mesma senha. Exemplo: `postgresql+psycopg://onboardia:minha-senha@postgres:5432/onboardia`.
4. `INTERNAL_API_KEY`: substitua o valor de exemplo por uma chave aleatória. O worker e a API recebem esse mesmo valor.
5. `EVOLUTION_API_KEY` e `EVOLUTION_WEBHOOK_SECRET`: configure valores aleatórios. A senha em `EVOLUTION_DATABASE_URL` deve corresponder a `EVOLUTION_POSTGRES_PASSWORD`.

Para o Docker Compose local, mantenha `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`, `API_CORS_ORIGINS=http://localhost:3000` e as URLs internas usando os nomes dos serviços como `postgres`, `redis` e `api`. Não publique nem compartilhe o arquivo `.env`.

Construa e inicie:

```powershell
docker compose up -d --build
docker compose ps
```

A primeira construção pode levar alguns minutos porque instala dependências grandes. Abra o app em <http://localhost:3000>. A API e a sua documentação estão em <http://localhost:8000/docs>; o health check está em <http://localhost:8000/api/v1/health>.

## Como usar

### 1. Crie um onboarding

Na página inicial, selecione **Novo onboarding**, informe o nome da empresa, salve e abra o processo. Os campos adicionais são opcionais conforme indicado no formulário.

### 2. Adicione documentos

No menu, abra **Base de conhecimento**, selecione o processo e envie documentos. São aceitos PDF, DOCX, XLSX, XLSM, CSV, TXT e Markdown, com limite padrão de 25 MB.

A tela mostra os estados **Na fila**, **Processando**, **Processado** e **Falhou**. Em documentos processados, expanda **Ver análise**; em caso de falha, expanda **Ver erro de processamento**.

O arquivo é registrado pela API e colocado numa fila Redis. O worker Node.js consome essa fila e solicita à API que extraia o conteúdo, divida o texto em trechos, gere embeddings e salve os resultados no PostgreSQL com pgvector. Algumas verificações de planilhas são determinísticas: podem identificar certos cabeçalhos ausentes, e-mails repetidos e centros de custo vazios. Elas não certificam a planilha inteira.

### 3. Consulte o copiloto

Abra **Copiloto IA**, selecione o mesmo processo e escreva uma pergunta clara. Por exemplo:

- “Quais informações estão faltando na planilha?”
- “Qual limite diário aparece na política de exemplo? Cite a fonte.”
- “Prepare um rascunho de e-mail pedindo os dados pendentes.”

A busca usa os documentos indexados no processo escolhido e, quando encontra trechos relevantes, mostra as fontes. A resposta gerativa precisa de Gemini ou Ollama. Sem um provedor disponível, extração, indexação e verificações fixas ainda podem funcionar, mas o copiloto ou a análise generativa podem falhar.

### 4. Atendimento inicial pelo WhatsApp

Cada onboarding pode guardar o número WhatsApp do contato do cliente, com código do país, como `+5511999999999`. Configure-o no formulário de cadastro ou no cartão **Canal de atendimento WhatsApp** dentro do processo. Esse número associa a mensagem recebida ao onboarding; a conta conectada à Evolution é o número compartilhado da equipe.

O Docker Compose inclui a Evolution API, seu PostgreSQL e sua configuração de webhook. Depois de iniciar os serviços, abra **Conectar WhatsApp** na navegação lateral e selecione **Gerar QR Code**. A tela cria a instância configurada em `EVOLUTION_INSTANCE` quando necessário, exibe o QR e acompanha o estado até confirmar a conexão. No celular da equipe, abra WhatsApp > **Aparelhos conectados** > **Conectar aparelho** e leia o QR Code. A chave da Evolution fica somente no servidor.

Também é possível conectar uma instância manualmente pelo Swagger em <http://localhost:8080/docs>, usando `POST /instance/create` com `{"instanceName":"onboardia","integration":"WHATSAPP-BAILEYS","qrcode":true}` e a chave `EVOLUTION_API_KEY` no campo `apikey`.

Cadastre o telefone do contato do cliente no onboarding e envie uma mensagem **desse telefone para o número da equipe conectado**. O webhook ignora mensagens enviadas pela própria conta, grupos, remetentes não cadastrados e tipos não suportados; mensagens repetidas são deduplicadas. No Copiloto, escolha o onboarding com WhatsApp cadastrado: a seção **Atendimento pelo WhatsApp** fica abaixo do chat do copiloto e atualiza periodicamente.

Mensagens recebidas entram na fila BullMQ. Áudios passam por transcrição Gemini, com Ollama como fallback local. O atendimento recupera trechos dos documentos daquele onboarding e combina com um resumo persistente da conversa e as mensagens recentes. A IA identifica a dúvida, responde pelo WhatsApp conectado e salva a resposta e a triagem para revisão no onboarding ou na área **Copiloto IA**.

As respostas devem ficar limitadas ao contexto disponível. Quando não houver evidência suficiente, a IA deve dizer que não conseguiu confirmar e pedir esclarecimento, sem inventar políticas, prazos ou ações concluídas. O analista acompanha resumo, categoria, urgência preliminar, impacto, informações a confirmar, recomendações, fontes e memória persistente. A IA não aprova cadastros nem executa ações no sistema.

Para habilitar o fallback local de análise e transcrição, inicie o perfil Ollama e baixe ambos os modelos:

```powershell
docker compose --profile local-llm up -d ollama
docker compose exec ollama ollama pull qwen2.5:3b
docker compose exec ollama ollama pull lfm3-audio:2b
```

Áudio no fallback local é convertido pelo FFmpeg no container da API. Se os provedores configurados falharem, o relato aparece com status de falha e detalhes para nova investigação pelos logs; nenhuma decisão é tomada automaticamente.

## Arquivos de demonstração

Os arquivos em `samples/` são exemplos fictícios e **não são carregados automaticamente**. Envie-os pela Base de conhecimento ao processo desejado. Para fazer perguntas sobre vários arquivos, envie-os todos para o mesmo processo; a busca é filtrada pelo processo selecionado.

### `samples/demo/`

Cenário compacto do Grupo Aurora:

- `funcionarios.csv`: planilha de exemplo para experimentar as verificações automáticas;
- `politica_despesas.md`: política ilustrativa de despesas e reembolsos;
- `fluxo_aprovacao.md`: exemplo de aprovadores por departamento.

### `samples/knowledge_base/`

Coleção fictícia de orientações operacionais:

- `00_LEIA_PRIMEIRO.md`: aviso de ficção, escopo, índice, hierarquia de decisão e perguntas sugeridas;
- `manual_onboarding.md`: manual resumido;
- `02_cadastro_empresa_parametrizacao.md`: cadastro e parametrização;
- `03_colaboradores_departamentos_centros_custo.md`: colaboradores e estrutura organizacional;
- `04_politicas_despesas_reembolsos.md`: despesas e reembolsos;
- `05_cartoes_corporativos.md`: cartões;
- `06_fluxos_aprovacao_alcadas.md`: aprovações;
- `07_viagens_corporativas.md`: viagens;
- `08_validacao_planilhas_documentos.md`: validação de planilhas e documentos;
- `09_troubleshooting_operacional.md`: diagnóstico de problemas;
- `10_comunicacao_cliente_templates.md`: modelos de comunicação;
- `11_seguranca_privacidade_lgpd.md`: orientações ilustrativas de privacidade;
- `12_metricas_sla_melhoria_continua.md`: métricas de exemplo;
- `13_glossario_faq.md`: glossário e FAQ;
- `14_casos_praticos_resolvidos.md`: casos didáticos.

Para experimentar a busca, envie `manual_onboarding.md` e um ou mais materiais temáticos ao mesmo onboarding. Depois, pergunte algo respondido pelos documentos e confira as fontes. Políticas, limites, nomes e respostas dos arquivos são fictícios: não os use como orientação real.

## Gemini e Ollama

Gemini é o provedor principal de respostas e transcrição de áudio. Configure `GEMINI_API_KEY` e `GEMINI_MODEL` no `.env`. Uma chave inválida será rejeitada pelo Google. Para mensagem de texto, Ollama é o fallback de geração; para áudio, o fallback usa `OLLAMA_AUDIO_MODEL` (padrão `lfm3-audio:2b`) e FFmpeg para converter o arquivo recebido.

Como alternativa, o projeto pode iniciar Ollama em um perfil opcional. No PowerShell:

```powershell
docker compose --profile local-llm up -d ollama
docker compose exec ollama ollama pull qwen2.5:3b
docker compose exec ollama ollama pull lfm3-audio:2b
docker compose exec ollama ollama list
```

O download do modelo de linguagem pode levar tempo e ocupa espaço adicional. O padrão é `OLLAMA_BASE_URL=http://ollama:11434`. Se mudar a configuração, recrie a API com `docker compose up -d --force-recreate api`.

Embeddings são independentes do modelo gerador. O modelo E5 multilíngue é baixado na primeira indexação ou consulta que precisa dele e permanece no volume `huggingface_cache`. A primeira utilização, portanto, pode ser mais lenta.

## Arquitetura em poucas palavras

- **Frontend:** Next.js, React e TypeScript; contém dashboard, cadastro, Copiloto IA e Base de conhecimento.
- **API:** FastAPI e Python; cuida dos processos, documentos, extração, embeddings e agentes.
- **PostgreSQL + pgvector:** guarda os dados do OnboardIA e permite busca vetorial. A Evolution tem um PostgreSQL separado para a sessão WhatsApp e mensagens de origem.
- **Redis + BullMQ + worker Node.js:** processam documentos e atendimentos recebidos em segundo plano.
- **PostgreSQL:** mantém mensagens, respostas e resumo de memória persistente, isolados por onboarding e telefone do cliente.
- **Evolution API:** conecta o WhatsApp da equipe, encaminha mensagens recebidas ao webhook protegido e envia respostas iniciais da IA.
- **Gemini / Ollama:** geram respostas e rascunhos quando estão configurados.

O copiloto encaminha tarefas para agentes de consulta documental, validação, análise de documentos e rascunho de comunicação. Algumas validações de planilha são regras Python fixas e não usam LLM.

## Persistência e manutenção

```powershell
# Ver serviços e logs
docker compose ps
docker compose logs --tail=100 api
docker compose logs --tail=100 worker

# Parar e iniciar mantendo os dados
docker compose stop
docker compose start

# Atualizar a aplicação
docker compose up -d --build

# Encerrar containers sem apagar volumes
docker compose down
```

PostgreSQL, Redis, uploads e cache de embeddings usam volumes Docker. **`docker compose down -v` apaga os volumes e os dados guardados neles.** Use-o apenas quando quiser realmente começar de novo.

## Limites deste MVP

- Não há autenticação nem isolamento entre organizações. Não exponha o serviço na internet.
- Não envie informações pessoais, financeiras ou confidenciais reais.
- Não há antivírus para uploads, política de retenção de mensagens/áudios e transcrições, backups automáticos, gestão de segredos de produção, TLS ou controle de acesso por documento.
- A extração de PDF depende de texto selecionável; não há OCR para páginas digitalizadas.
- As verificações de planilha cobrem poucos padrões, e a IA pode errar ou deixar passar problemas.
- O copiloto consulta apenas o contexto fornecido e recuperado. Confira as fontes e revise toda recomendação.
- O projeto não integra com VExpenses nem com qualquer sistema real de clientes.

## Solução de problemas

**A página não carrega:** execute `docker compose ps`; confirme se os serviços estão ativos. Veja `docker compose logs --tail=100 api frontend`. Confira `NEXT_PUBLIC_API_URL` e `API_CORS_ORIGINS` no `.env`. Se alterar uma variável `NEXT_PUBLIC_*`, reconstrua o frontend: `docker compose up -d --build frontend`.

**A API não fica saudável:** veja `docker compose logs --tail=100 postgres api`. Confirme que a senha em `POSTGRES_PASSWORD` é a mesma usada em `DATABASE_URL`. Dentro do Compose, o host do banco é `postgres`, não `localhost`.

**Um arquivo continua na fila:** veja `docker compose logs --tail=100 redis worker api`. Confirme que Redis e worker estão ativos.

**Uma mensagem de WhatsApp não recebeu resposta:** confirme que o telefone do cliente está cadastrado no onboarding e envie a mensagem desse telefone para o número pareado da equipe. Na aba **Copiloto IA**, selecione o onboarding correto e veja o estado de análise e envio em **Atendimento pelo WhatsApp**. Consulte `docker compose logs --tail=100 frontend api worker evolution` para erros de webhook ou envio.

**Falha ao baixar embeddings:** verifique a internet e os logs da API. O cache fica no volume `huggingface_cache`. Para verificar o modelo, execute `docker compose exec api uv run python scripts/check_embeddings.py`; ele deve informar vetores de 384 dimensões. Não remova o volume do PostgreSQL para tentar corrigir o cache de embeddings.

**Nenhum provedor de IA disponível:** configure uma chave Gemini válida ou inicie Ollama e baixe o modelo configurado. Indexação e verificações determinísticas podem ser concluídas mesmo se a geração de respostas não estiver disponível.

## Estrutura

```text
backend/                 API, banco, extração, embeddings e agentes
frontend/                interface Next.js, rotas e componentes
worker/                  consumidor da fila BullMQ
samples/demo/             arquivos para demonstração rápida
samples/knowledge_base/   coleção fictícia de consulta operacional
docker-compose.yml        serviços, redes e volumes locais
.env.example              modelo das variáveis de configuração
Makefile                  atalhos para desenvolvimento local
```
