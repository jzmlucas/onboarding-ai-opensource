# Colaboradores, Departamentos e Centros de Custo
**Versão:** 1.0 | **Área:** Dados Mestres | **Natureza:** procedimento didático

## 1. Objetivo
Orientar a preparação e validação da estrutura organizacional antes da importação de usuários e da configuração de despesas.

## 2. Cadastro de colaborador
Campos recomendados:
- Nome completo.
- E-mail corporativo.
- Identificador interno do colaborador.
- Unidade.
- Departamento.
- Centro de custo principal.
- Cargo ou função.
- Gestor direto.
- Status (ativo/inativo).
- Data de admissão, se necessária ao processo.
- Perfil de acesso.
- Grupos ou projetos, quando aplicáveis.

Evitar coletar dados pessoais que não sejam necessários ao objetivo da implantação. Não solicitar documentos pessoais sensíveis se o processo não exigir.

## 3. E-mail e identificador
- Normalizar espaços antes e depois do e-mail.
- Validar sintaxe.
- Comparar duplicidades sem diferenciar maiúsculas e minúsculas.
- Não corrigir domínio por adivinhação.
- Não substituir e-mail pessoal por corporativo sem confirmação.
- Identificador interno deve ser único dentro do escopo definido pelo cliente.

## 4. Departamentos
Exemplos fictícios:
- Administrativo.
- Financeiro.
- Comercial.
- Marketing.
- Operações.
- Tecnologia.
- Recursos Humanos.
- Jurídico.

A lista é ilustrativa. O cliente deve fornecer a estrutura real. Departamentos podem possuir códigos e hierarquias. Registrar departamento pai quando existir.

## 5. Centros de custo
Centro de custo é uma classificação gerencial usada para atribuir ou analisar gastos. Não é necessariamente igual a departamento. Um departamento pode utilizar vários centros de custo, e um centro de custo pode receber despesas de mais de uma equipe, conforme regra do cliente.

Campos recomendados:
- Código.
- Nome.
- Unidade.
- Responsável.
- Centro pai, se houver.
- Status.
- Vigência inicial e final.
- Observação.

Exemplo fictício:
| Código | Centro de custo | Unidade | Responsável |
| CC-001 | Administração | Matriz | Gestor Administrativo |
| CC-010 | Vendas SP | Matriz | Gerente Comercial |
| CC-020 | Marketing | Matriz | Gerente de Marketing |
| CC-030 | Operações | Filial Campinas | Gerente de Operações |

## 6. Regras de relacionamento
- Todo colaborador deve estar associado a uma unidade válida, quando a estrutura exigir.
- Departamento informado deve existir na lista aprovada.
- Centro de custo deve existir e estar ativo.
- Gestor direto deve ser um usuário válido ou uma referência aprovada.
- Aprovador não deve ser o próprio solicitante quando a política proibir autoaprovação.
- Mudanças de departamento devem respeitar vigência e histórico.

## 7. Colaborador sem centro de custo
Procedimento:
1. Identificar os colaboradores afetados.
2. Verificar se a planilha contém outra coluna que permita identificar a alocação.
3. Não inferir o centro de custo pelo departamento.
4. Registrar a pendência como "aguardando cliente".
5. Solicitar ao responsável do cliente a associação correta.
6. Após retorno, validar se o código existe e está ativo.
7. Atualizar o cadastro preservando o histórico da correção.

Se a política do cliente permitir centro de custo padrão, obter essa regra por escrito antes de aplicá-la.

## 8. Admissão, desligamento e movimentação
**Admissão:** confirmar dados, unidade, departamento, centro de custo, gestor e perfil.  
**Desligamento:** desativar acesso conforme instrução autorizada e política vigente; não apagar histórico transacional.  
**Movimentação:** registrar data efetiva, origem, destino e aprovador da mudança.  
**Afastamento:** seguir procedimento do cliente para suspensão temporária, se aplicável.

## 9. Indicadores de qualidade
- Percentual de registros com campos obrigatórios preenchidos.
- Quantidade de e-mails duplicados.
- Quantidade de centros de custo inexistentes.
- Quantidade de colaboradores sem gestor.
- Quantidade de registros sem unidade.
- Quantidade de usuários inativos ainda marcados como ativos.

## 10. Critérios para importação
A importação só deve avançar quando:
- O layout foi validado.
- As colunas obrigatórias estão presentes.
- Os valores estão nos formatos esperados.
- Duplicidades foram tratadas.
- Departamentos e centros de custo foram reconciliados.
- Pendências impeditivas foram resolvidas.
- O cliente confirmou a versão final.

## 11. Exemplo de solicitação ao cliente
"Identificamos 12 colaboradores sem centro de custo associado. Para evitar uma alocação incorreta de despesas, precisamos que a planilha seja atualizada com o código correspondente. Caso exista uma regra de centro de custo padrão, pedimos que ela seja confirmada formalmente."
