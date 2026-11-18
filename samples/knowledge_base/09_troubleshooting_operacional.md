# Diagnóstico e Resolução de Problemas Operacionais
**Versão:** 1.0 | **Área:** Onboarding e Suporte | **Natureza:** playbook fictício

## 1. Como diagnosticar
Antes de propor uma solução:
1. Entender o impacto.
2. Identificar quem é afetado.
3. Reproduzir o cenário, se seguro.
4. Coletar horário, etapa e mensagem de erro.
5. Verificar se o problema é de configuração, dado, permissão, integração ou indisponibilidade.
6. Consultar procedimento vigente.
7. Registrar hipótese e evidência.
8. Escalonar quando não houver autorização ou conhecimento suficiente.

Não solicitar senha, token, código de autenticação, número completo de cartão ou segredo de API.

## 2. Problemas comuns

### Usuário não recebeu convite
Verificar endereço de e-mail, caixa de spam, status do convite, duplicidade de usuário e se o domínio permite recebimento. Reenviar somente após confirmar o endereço e seguir o procedimento autorizado. Não criar conta duplicada para contornar o problema.

### Usuário não consegue acessar
Verificar se está ativo, se convite foi aceito, se o método de autenticação é o esperado e se o perfil permite acesso. Não pedir senha. Encaminhar redefinição pelo fluxo oficial.

### Colaborador não aparece na lista
Verificar arquivo importado, status, unidade, filtros, duplicidade e resultado do processamento. Confirmar se a importação foi concluída. Não importar repetidamente sem entender o estado anterior.

### Centro de custo não aparece
Verificar código, status, unidade, vigência e associação. Se não existir, solicitar confirmação ao cliente. Não criar um centro de custo com nome parecido sem autorização.

### Aprovação não avança
Identificar aprovador atual, status, regra aplicada, existência de substituto e possível condição pendente. Se o aprovador estiver inativo e não houver substituto formal, escalar ao administrador do cliente.

### Valor ou limite parece incorreto
Comparar política aprovada, versão, vigência, categoria, unidade, moeda e regra de periodicidade. Não corrigir o valor com base em conversa informal não registrada.

### Documento não processa
Verificar formato, tamanho, integridade, senha, páginas digitalizadas, arquivo corrompido e logs de processamento. Solicitar novo arquivo se necessário. Preservar o original.

### Relatório apresenta números diferentes
Verificar período, fuso horário, filtros, status incluídos, atualização dos dados, duplicidades e critérios de cálculo. Registrar a consulta usada para reproduzir a diferença.

## 3. Classificação de incidentes
**P1 — Crítico:** indisponibilidade ampla, risco de segurança ou impacto financeiro relevante. Acionar canal de incidente imediatamente.  
**P2 — Alto:** função importante indisponível para grupo de usuários ou processo crítico bloqueado. Escalonar com prioridade.  
**P3 — Moderado:** problema localizado com alternativa temporária segura. Registrar e acompanhar.  
**P4 — Baixo:** dúvida, melhoria ou problema cosmético sem bloqueio relevante.

A classificação final deve seguir a política de incidentes vigente da organização real.

## 4. Registro mínimo
- Identificador do caso.
- Cliente e processo afetado.
- Data e hora.
- Solicitante.
- Impacto.
- Sintoma observado.
- Passos para reprodução.
- Evidências sem dados secretos.
- Hipótese.
- Ação executada.
- Responsável.
- Próxima atualização.
- Resolução e causa, quando conhecidas.

## 5. Quando escalar
Escalar quando:
- Há suspeita de acesso indevido ou vazamento.
- Há possível fraude.
- O problema envolve pagamento, transação ou cartão.
- A solução exige alteração de regra financeira.
- A integração está indisponível.
- A causa não é conhecida após diagnóstico inicial.
- O problema afeta vários clientes.
- A equipe não possui permissão para agir.

## 6. Comunicação durante incidente
Informar fatos confirmados, impacto conhecido, ações em andamento e próxima atualização. Não especular sobre causa, não prometer horário de resolução sem confirmação e não ocultar risco relevante.
