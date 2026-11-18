# Cartões Corporativos — Ciclo Operacional
**Versão:** 1.0 | **Área:** Operações | **Natureza:** material fictício

## 1. Objetivo
Apresentar um fluxo genérico de administração de cartões corporativos em uma solução de despesas. As funcionalidades variam conforme emissor, contrato e produto contratado.

## 2. Informações para implantação
- Quantidade estimada de cartões.
- Modalidade (físico, virtual ou outra).
- Titular ou responsável.
- Unidade e centro de custo.
- Limite solicitado.
- Periodicidade do limite.
- Categorias ou estabelecimentos permitidos, se suportados.
- Responsável por solicitar.
- Responsável por aprovar.
- Procedimento para perda, roubo ou suspeita de fraude.

## 3. Princípio de controle
O limite solicitado não deve ser tratado como limite aprovado. A equipe deve conferir a autorização do cliente e a capacidade do produto contratado. Configurações financeiras exigem validação humana e registro de aprovação.

## 4. Ciclo de vida
1. Solicitação.
2. Aprovação interna do cliente.
3. Verificação de elegibilidade e dados.
4. Emissão ou provisionamento pelo fluxo autorizado.
5. Entrega ou disponibilização.
6. Ativação pelo titular, quando aplicável.
7. Uso conforme política.
8. Conciliação e prestação de contas.
9. Bloqueio, substituição ou encerramento.

## 5. Cartão não aparece para o usuário
Verificar:
- Se o usuário está ativo.
- Se o cartão foi associado ao titular correto.
- Se a unidade está correta.
- Se o status do cartão permite visualização.
- Se o usuário possui permissão adequada.
- Se há atraso de sincronização ou incidente conhecido.

Não solicitar senha, código de segurança ou número completo do cartão em mensagens de suporte.

## 6. Transação recusada
Possíveis causas a investigar:
- Limite insuficiente.
- Cartão bloqueado ou ainda não ativado.
- Categoria ou estabelecimento não permitido.
- Dados de cobrança incorretos.
- Restrição do emissor.
- Falha temporária de processamento.
- Regra de segurança.

Procedimento:
1. Registrar data, horário, valor aproximado e contexto mínimo necessário.
2. Não solicitar dados secretos do cartão.
3. Conferir status e limite por ferramenta autorizada.
4. Verificar se há incidente.
5. Encaminhar ao emissor ou área responsável quando necessário.
6. Informar ao cliente o próximo passo sem prometer prazo não confirmado.

## 7. Perda, roubo ou suspeita de fraude
Orientar o titular a utilizar imediatamente o canal oficial de bloqueio indicado pelo emissor ou administrador autorizado. Abrir registro de incidente, informar horário e escopo, e seguir o procedimento de segurança. Não esperar a conclusão de uma análise de onboarding para orientar bloqueio emergencial.

## 8. Conciliação
A conciliação pode comparar:
- Transação.
- Titular.
- Data.
- Valor.
- Categoria.
- Centro de custo.
- Comprovante.
- Aprovação.
- Status de contestação.

Diferenças devem ser classificadas como pendência de comprovante, divergência de valor, classificação incorreta, transação desconhecida ou possível duplicidade.

## 9. Boas práticas
- Aplicar menor privilégio.
- Revisar acessos em movimentações e desligamentos.
- Não compartilhar cartões ou credenciais.
- Não armazenar dados completos de cartão em planilhas comuns.
- Manter trilha de aprovação.
- Revisar limites periodicamente com o cliente.
