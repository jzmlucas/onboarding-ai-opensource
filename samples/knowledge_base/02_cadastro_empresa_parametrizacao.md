# Cadastro da Organização e Parametrização Inicial
**Versão:** 1.0 | **Área:** Configuração | **Natureza:** procedimento didático

## 1. Objetivo
Definir uma sequência de conferência para cadastrar uma organização e preparar suas configurações básicas em uma plataforma fictícia de gestão de despesas.

## 2. Dados cadastrais
Campos recomendados:
- Razão social.
- Nome fantasia.
- CNPJ ou identificador fiscal aplicável.
- País e moeda de operação.
- Endereço principal.
- Fuso horário.
- Idioma.
- Contato administrativo.
- Contato financeiro.
- Administrador principal.
- Unidades ou filiais abrangidas.

### Validações
1. Verificar se o identificador fiscal possui formato esperado.
2. Comparar razão social com documento cadastral fornecido.
3. Conferir se o nome fantasia está consistente entre formulário e contrato.
4. Confirmar moeda e fuso horário com o cliente.
5. Não inferir endereço ou dados legais a partir de nome comercial.
6. Não utilizar dados de uma filial para preencher outra sem confirmação.

Um identificador com formato válido não comprova, por si só, que a empresa existe ou que os dados pertencem ao cliente. Validação cadastral formal deve utilizar fonte autorizada e procedimento apropriado.

## 3. Unidades e filiais
Quando houver mais de uma unidade, registrar:
- Nome da unidade.
- Identificador fiscal, quando aplicável.
- Endereço.
- Responsável.
- Departamentos associados.
- Centros de custo.
- Regras específicas.
- Status de ativação.

**Regra:** não presumir que unidades diferentes compartilham a mesma política, aprovadores ou limites. Confirmar se a política é centralizada ou descentralizada.

## 4. Configurações regionais
Confirmar:
- Moeda padrão.
- Fuso horário.
- Formato de data.
- Separador decimal.
- Idioma.
- Países de operação.
- Formato de identificadores fiscais.

Exemplo fictício: uma organização brasileira pode usar BRL, data DD/MM/AAAA e fuso America/Sao_Paulo. Isso é apenas um exemplo, não uma configuração universal.

## 5. Perfis de acesso
Papéis ilustrativos:
- **Administrador da organização:** administra configurações e usuários conforme autorização.
- **Gestor:** acompanha e aprova solicitações de sua alçada.
- **Financeiro:** revisa despesas e relatórios conforme escopo.
- **Colaborador:** cria solicitações e presta contas.
- **Auditor/Consulta:** consulta dados autorizados sem permissão de alteração.

Aplicar menor privilégio: conceder apenas as permissões necessárias. Não conceder perfil administrativo apenas para facilitar um teste.

## 6. Checklist de parametrização
| Item | Evidência esperada | Bloqueia ativação? |
|---|---|---|
| Dados da organização | Formulário conferido | Sim |
| Unidade principal | Dados confirmados | Conforme escopo |
| Moeda e fuso | Confirmação do cliente | Sim |
| Administrador | Responsável identificado | Sim |
| Departamentos | Relação validada | Conforme escopo |
| Centros de custo | Relação validada | Conforme política |
| Categorias | Política aprovada | Conforme escopo |
| Perfis | Matriz de acesso | Sim |
| Aprovadores | Matriz aprovada | Sim |
| Testes | Evidência registrada | Sim |

## 7. Erros comuns
**Razão social divergente:** comparar documentos, formulário e contrato; solicitar confirmação formal.  
**Unidade duplicada:** conferir identificador fiscal e nome; não excluir sem entender o vínculo.  
**Moeda incorreta:** interromper parametrização financeira e solicitar confirmação.  
**Administrador sem acesso:** verificar e-mail, convite, status do usuário e perfil; não compartilhar senha.  
**Fuso horário incorreto:** validar com o cliente e testar horários em ambiente seguro.

## 8. Perguntas de descoberta
- A empresa possui filiais?
- Cada filial terá administradores próprios?
- As políticas serão iguais em todas as unidades?
- Há colaboradores que atuam em mais de uma unidade?
- O financeiro centraliza a conferência?
- Existe necessidade de relatórios por entidade?
- Quem pode criar ou alterar centros de custo?

## 9. Critério de conclusão
O cadastro está pronto para avançar quando os dados essenciais foram conferidos, as unidades foram identificadas, os responsáveis foram definidos e as configurações regionais e de acesso foram aprovadas. Qualquer exceção deve estar registrada com justificativa e responsável.
