# Base de Conhecimento Operacional — OnboardIA
**Versão:** 1.0  
**Data de referência:** novembro de 2026  
**Tipo:** índice, escopo e orientação de consulta  
**Organização fictícia de referência:** Operação Atlas — Gestão de Despesas e Viagens  
**Uso:** treinamento, demonstração e avaliação do RAG do OnboardIA

## 1. Aviso de escopo e confiabilidade
Este conjunto de documentos é uma base de conhecimento inteiramente fictícia, criada para demonstrar uma operação B2B de onboarding de uma plataforma SaaS de gestão de despesas e viagens corporativas. A organização "Operação Atlas" não é uma empresa real. Os procedimentos, limites, prazos, exemplos, nomes, políticas e números são hipotéticos.

Esta documentação não representa políticas internas, manuais, integrações, SLAs, regras comerciais ou orientações oficiais da VExpenses. Não utilize os exemplos como orientação contábil, tributária, jurídica ou financeira. Em uma operação real, a política vigente do cliente, o contrato, a legislação aplicável e as orientações oficiais da plataforma sempre prevalecem.

## 2. Como utilizar esta base
A base foi separada por assunto para favorecer recuperação semântica. Cada arquivo deve ser enviado ao mesmo processo de onboarding de demonstração se a versão atual do OnboardIA estiver filtrando a busca RAG pelo identificador do onboarding.

Arquivos disponíveis:
- `01_manual_onboarding_ponta_a_ponta.md`: visão geral do ciclo de onboarding.
- `02_cadastro_empresa_parametrizacao.md`: dados da organização e configurações iniciais.
- `03_colaboradores_departamentos_centros_custo.md`: estrutura organizacional e cadastro de pessoas.
- `04_politicas_despesas_reembolsos.md`: regras ilustrativas de despesas e reembolsos.
- `05_cartoes_corporativos.md`: emissão, uso, bloqueio e conciliação de cartões.
- `06_fluxos_aprovacao_alcadas.md`: desenho de aprovadores e níveis de autorização.
- `07_viagens_corporativas.md`: solicitação, aprovação e prestação de contas de viagens.
- `08_validacao_planilhas_documentos.md`: regras de qualidade de dados e validação.
- `09_troubleshooting_operacional.md`: diagnóstico de problemas comuns.
- `10_comunicacao_cliente_templates.md`: comunicação clara e modelos de mensagens.
- `11_seguranca_privacidade_lgpd.md`: princípios de segurança e tratamento de dados.
- `12_metricas_sla_melhoria_continua.md`: indicadores e melhoria de processos.
- `13_glossario_faq.md`: termos e perguntas frequentes.
- `14_casos_praticos_resolvidos.md`: cenários para testar raciocínio, RAG e agentes.

## 3. Hierarquia de decisão
Quando houver conflito entre informações, siga esta ordem:
1. Lei e regulamentação aplicáveis, com orientação de profissionais habilitados.
2. Contrato e aditivos assinados com o cliente.
3. Política formal aprovada pelo próprio cliente.
4. Configuração efetivamente aprovada e registrada no sistema.
5. Procedimentos operacionais vigentes da organização fictícia.
6. Exemplos e cenários didáticos desta base.

Um exemplo didático nunca deve ser tratado como autorização para alterar uma configuração real.

## 4. Princípios operacionais
- Não inventar dados ausentes.
- Não presumir que um campo vazio significa "não se aplica".
- Diferenciar erro confirmado, alerta e informação ainda não verificada.
- Registrar a origem de cada informação importante.
- Preservar o documento original recebido.
- Solicitar esclarecimento quando documentos divergirem.
- Não aprovar cadastros, despesas, reembolsos ou viagens automaticamente.
- Não enviar mensagens ao cliente sem revisão humana.
- Não expor dados pessoais além do necessário.
- Manter trilha de auditoria para alterações relevantes.

## 5. Vocabulário de status
**Não iniciado:** etapa ainda não começou.  
**Em andamento:** há trabalho em execução.  
**Aguardando cliente:** depende de informação ou ação do cliente.  
**Aguardando área interna:** depende de outra equipe.  
**Em revisão:** informação recebida e aguardando conferência.  
**Pendente de correção:** foi encontrada uma inconsistência que impede o avanço.  
**Bloqueado:** existe impedimento que exige decisão ou escalonamento.  
**Concluído:** critérios de aceite da etapa foram atendidos e registrados.  
**Cancelado:** processo encerrado sem implantação.

## 6. Como o copiloto deve responder
Ao responder uma pergunta sobre esta base:
1. Identifique o assunto e a etapa do processo.
2. Recupere trechos relevantes da documentação.
3. Responda diretamente, sem extrapolar o conteúdo recuperado.
4. Diferencie regra documentada de sugestão.
5. Cite o nome do documento e a seção de referência quando possível.
6. Se não houver informação suficiente, diga explicitamente o que falta.
7. Se houver divergência, apresente os dois dados e recomende validação humana.

## 7. Perguntas de teste recomendadas
- Quais são as etapas do onboarding e seus critérios de conclusão?
- Quais campos são obrigatórios no cadastro de uma empresa?
- O que fazer quando um colaborador não tem centro de custo?
- Qual é o limite diário ilustrativo de alimentação na política de exemplo?
- Quem pode aprovar uma despesa acima da alçada do gestor?
- Como tratar uma planilha com e-mails duplicados?
- Qual é a diferença entre erro impeditivo e alerta?
- Como deve ser comunicada uma pendência ao cliente?
- O que fazer quando a política enviada contradiz o formulário?
- Quais indicadores ajudam a identificar gargalos de onboarding?

## 8. Limitações
Esta base não descreve telas reais, endpoints oficiais, integrações privadas ou funcionalidades proprietárias de qualquer fornecedor. Os nomes de módulos e etapas são genéricos. A existência de uma informação neste material não comprova que ela exista em um produto comercial específico.
