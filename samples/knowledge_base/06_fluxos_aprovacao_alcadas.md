# Fluxos de Aprovação e Alçadas
**Versão:** 1.0 | **Área:** Governança Operacional | **Natureza:** exemplo fictício

## 1. Objetivo
Orientar o desenho, validação e teste de fluxos de aprovação para despesas e viagens.

## 2. Conceitos
**Solicitante:** pessoa que cria a solicitação.  
**Aprovador:** pessoa autorizada a avaliar e decidir.  
**Alçada:** limite ou escopo de autoridade de aprovação.  
**Aprovador substituto:** pessoa autorizada a atuar em ausência, conforme regra formal.  
**Escalonamento:** encaminhamento a nível superior ou área responsável.  
**Segregação de funções:** separação de responsabilidades para reduzir conflito de interesse.

## 3. Exemplo de matriz fictícia
| Valor da solicitação | Primeira aprovação | Segunda aprovação |
| Até R$ 500 | Gestor direto | Não aplicável |
| R$ 500,01 a R$ 2.000 | Gestor direto | Gerente da área |
| R$ 2.000,01 a R$ 10.000 | Gerente da área | Financeiro |
| Acima de R$ 10.000 | Diretor responsável | Financeiro |

Os valores são exclusivamente ilustrativos. O cliente deve fornecer matriz aprovada, moeda, vigência, exceções e critérios de cálculo.

## 4. Dimensões que podem alterar o fluxo
- Valor.
- Categoria.
- Unidade.
- Centro de custo.
- Projeto.
- Cargo.
- Tipo de solicitação.
- País.
- Urgência.
- Tipo de despesa.
- Solicitante ou área.

A combinação de dimensões pode gerar regras conflitantes. O analista deve testar cenários de fronteira.

## 5. Perguntas obrigatórias
- O valor é avaliado por item ou pelo total da solicitação?
- O fluxo é sequencial ou paralelo?
- O gestor pode aprovar a própria despesa?
- Existe limite por categoria?
- Quem aprova despesas do diretor?
- Existe substituto durante férias?
- O que ocorre quando o aprovador está inativo?
- Qual é a regra para urgências?
- Quem pode alterar a matriz?
- Qual é a data de vigência?

## 6. Regras de segurança
- Evitar autoaprovação quando a política exigir segregação.
- Não criar aprovador fictício para completar o fluxo.
- Não atribuir aprovação a alguém sem autorização.
- Registrar alterações da matriz.
- Validar substituições e vigências.
- Testar limites imediatamente abaixo, iguais e acima da faixa.
- Confirmar comportamento de ausência ou inatividade.

## 7. Testes de fronteira
Para uma faixa fictícia de até R$ 500:
- R$ 499,99: deve seguir a primeira faixa.
- R$ 500,00: deve seguir a primeira faixa, se o limite for inclusivo.
- R$ 500,01: deve seguir a faixa seguinte.

O comportamento exato depende da regra aprovada. A equipe não deve assumir inclusividade sem confirmar.

## 8. Aprovador ausente
1. Identificar solicitação e etapa.
2. Confirmar se existe substituto formal.
3. Verificar período de vigência.
4. Não redirecionar para qualquer gestor disponível.
5. Solicitar decisão do administrador do cliente se não houver substituto.
6. Registrar a solução.

## 9. Fluxo travado
Investigar:
- Aprovador está ativo?
- Usuário possui acesso?
- Regra está publicada e vigente?
- Existe condição não atendida?
- Solicitação está em status correto?
- Há erro de integração ou incidente?
- O fluxo espera aprovação paralela de outra pessoa?

## 10. Critério de aceite
O fluxo está pronto quando a matriz foi aprovada pelo cliente, os usuários foram associados corretamente, os cenários de fronteira foram testados e os resultados foram documentados.
