# Segurança da Informação, Privacidade e LGPD
**Versão:** 1.0 | **Área:** Segurança e Privacidade | **Natureza:** guia educativo

## 1. Objetivo
Estabelecer princípios de cuidado com informações empresariais e dados pessoais durante o onboarding e o uso de ferramentas de IA.

Este material é educativo e não substitui avaliação jurídica, encarregado de dados, política de segurança ou orientação oficial da organização.

## 2. Princípios de tratamento
- Finalidade: tratar dados para objetivo definido.
- Adequação: compatibilidade com a finalidade informada.
- Necessidade: coletar o mínimo necessário.
- Transparência: explicar o uso de dados.
- Segurança: proteger contra acesso e uso não autorizados.
- Prevenção: reduzir riscos antes de incidentes.
- Responsabilização: demonstrar medidas adotadas.

## 3. Dados que exigem cuidado
- Nome, e-mail e identificador de colaborador.
- Dados de despesas e deslocamentos.
- Informações financeiras.
- Dados de cartão.
- Documentos empresariais.
- Informações de acesso.
- Dados pessoais sensíveis, quando presentes.

Não incluir dados pessoais sensíveis em prompts de IA se não forem estritamente necessários e autorizados.

## 4. Uso seguro de IA generativa
Antes de enviar conteúdo a um modelo:
1. Verificar se o provedor e o uso foram autorizados.
2. Remover ou mascarar dados desnecessários.
3. Não enviar senhas, tokens ou segredos.
4. Considerar retenção e uso dos dados pelo provedor.
5. Restringir o contexto ao necessário.
6. Registrar o propósito da análise.
7. Revisar a saída antes de utilizá-la.

Para demonstrações, utilizar dados sintéticos. Não utilizar documentos reais de clientes em contas pessoais ou ambientes não aprovados.

## 5. Segredos e credenciais
Nunca armazenar em documentos RAG:
- Chaves de API.
- Senhas.
- Tokens OAuth.
- Códigos de autenticação.
- Chaves privadas.
- Segredos de webhook.
- Dados completos de cartão.

Segredos devem ficar em gerenciador apropriado ou variável de ambiente protegida. Não devem aparecer em logs, mensagens ou relatórios.

## 6. Controle de acesso
- Aplicar menor privilégio.
- Revisar permissões periodicamente.
- Remover acesso quando não for mais necessário.
- Separar dados de clientes diferentes.
- Evitar contas compartilhadas.
- Utilizar autenticação forte conforme política.
- Registrar operações administrativas.

## 7. Retenção e descarte
A retenção deve seguir contrato, finalidade, obrigação aplicável e política aprovada. Não manter arquivos indefinidamente por conveniência. Descarte deve ser seguro e documentado quando exigido.

## 8. Incidente de segurança
Se houver suspeita de vazamento, acesso indevido, perda de dispositivo ou exposição de segredo:
1. Não apagar evidências.
2. Registrar o que foi observado.
3. Acionar imediatamente o canal de segurança.
4. Seguir instruções de contenção.
5. Não investigar além da própria autorização.
6. Não comunicar terceiros sem orientação.
7. Preservar informações necessárias para apuração.

## 9. Dados em ambientes de demonstração
Usar nomes, e-mails, CNPJs, valores e documentos fictícios. Identificar claramente os dados como sintéticos. Não copiar planilhas reais para o ambiente de entrevista.

## 10. Regras para o OnboardIA
- A IA não deve executar ações financeiras.
- A IA não deve aprovar despesas.
- A IA não deve enviar comunicações sem confirmação.
- A IA deve limitar respostas ao contexto autorizado.
- A IA deve sinalizar quando não há evidência.
- A aplicação deve separar dados por cliente/processo.
- O acesso aos documentos deve ser controlado.
