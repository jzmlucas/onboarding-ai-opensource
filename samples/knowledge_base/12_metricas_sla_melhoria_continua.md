# Indicadores, SLAs e Melhoria Contínua
**Versão:** 1.0 | **Área:** Operações e Customer Success | **Natureza:** guia fictício

## 1. Objetivo
Definir indicadores para entender eficiência, qualidade e experiência durante o onboarding.

## 2. Métricas de fluxo
**Tempo de onboarding:** diferença entre início e conclusão, com regra explícita para pausas.  
**Tempo por etapa:** duração de cada fase.  
**Tempo de primeira resposta:** intervalo entre solicitação e primeira resposta útil.  
**Tempo de espera do cliente:** período em que a próxima ação depende do cliente.  
**Tempo de espera interno:** período aguardando outra equipe.

Sempre declarar unidade, período, filtros e exclusões usados no cálculo.

## 3. Métricas de qualidade
- Taxa de cadastros completos na primeira submissão.
- Percentual de arquivos aprovados sem correção.
- Erros por tipo e severidade.
- Duplicidades identificadas.
- Pendências por onboarding.
- Reabertura de etapas.
- Incidentes após ativação.
- Taxa de correções após importação.

## 4. Métricas de experiência
- Satisfação após onboarding.
- Clareza das instruções.
- Facilidade para enviar documentos.
- Percepção de previsibilidade.
- Dúvidas recorrentes.
- Taxa de participação em treinamentos.

Uma nota de satisfação isolada não explica a causa. Combinar números com comentários e entrevistas.

## 5. Métricas de adoção
- Usuários convidados versus ativos.
- Administradores treinados.
- Primeira utilização concluída.
- Uso de funcionalidades principais.
- Volume de dúvidas após ativação.

## 6. Definições e fórmulas ilustrativas
**Taxa de primeira submissão completa**  
= onboardings sem pendência de dados na primeira análise / total de onboardings analisados × 100.

**Taxa de retrabalho**  
= onboardings que precisaram repetir uma etapa / total de onboardings × 100.

**Pendências médias por cliente**  
= total de pendências identificadas / quantidade de onboardings analisados.

**Cumprimento de prazo**  
= etapas concluídas dentro do prazo acordado / total de etapas concluídas × 100.

As fórmulas precisam definir o que conta como "analisado", "pendência", "repetir" e "prazo". Não comparar equipes sem normalizar complexidade e escopo.

## 7. Exemplo fictício
Em um mês, 40 onboardings foram analisados. 26 estavam completos na primeira submissão.
Taxa = 26 / 40 × 100 = 65%.

Se 10 dos 40 precisaram repetir ao menos uma etapa:
Taxa de retrabalho = 10 / 40 × 100 = 25%.

Esses números são exemplos matemáticos, não resultados reais de qualquer empresa.

## 8. Como investigar um gargalo
1. Definir o indicador e o período.
2. Segmentar por etapa, tipo de cliente e complexidade.
3. Identificar onde ocorre maior espera.
4. Ler amostra de casos.
5. Conversar com analistas e clientes.
6. Formular hipótese.
7. Propor mudança pequena e reversível.
8. Definir métrica de sucesso.
9. Testar.
10. Comparar com período ou grupo de referência.
11. Documentar resultado e limitações.

## 9. Exemplo: muitos cadastros voltam para correção
Hipótese: o modelo de planilha não explica o preenchimento de centro de custo.
Ações:
- Revisar instruções.
- Incluir exemplo de linha preenchida.
- Adicionar validação de formato.
- Explicar onde encontrar o código.
- Testar com novos clientes.
Métrica: taxa de planilhas aprovadas na primeira submissão.

## 10. SLA e expectativa
SLA é compromisso de nível de serviço definido entre partes ou internamente. Não inventar SLA. Confirmar:
- início da contagem;
- horário de atendimento;
- calendário útil;
- pausas permitidas;
- severidade;
- dependências;
- canal de comunicação;
- forma de medição.

## 11. Priorização de melhorias
Avaliar:
- Impacto no cliente.
- Frequência.
- Risco.
- Esforço.
- Dependências.
- Facilidade de medir.
- Reversibilidade.

Priorizar problemas recorrentes e de alto impacto, não apenas solicitações mais barulhentas.

## 12. Relatório de melhoria
Registrar problema, evidência, causa provável, hipótese, ação, responsável, prazo, métrica, resultado, limitações e decisão de manter, ajustar ou reverter.
