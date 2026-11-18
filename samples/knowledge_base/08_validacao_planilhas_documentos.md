# Validação de Planilhas e Documentos
**Versão:** 1.0 | **Área:** Qualidade de Dados | **Natureza:** guia operacional

## 1. Objetivo
Padronizar a conferência de arquivos recebidos durante o onboarding e reduzir erros de importação e retrabalho.

## 2. Princípio
A validação deve combinar regras determinísticas com revisão contextual. Regras programadas identificam formatos, campos ausentes e duplicidades. IA pode ajudar a interpretar cabeçalhos, textos e divergências, mas não deve decidir silenciosamente qual dado é correto.

## 3. Checklist geral
- Arquivo abre corretamente.
- Tipo e extensão são permitidos.
- Nome e versão são identificáveis.
- Cabeçalhos estão presentes.
- Colunas obrigatórias existem.
- Não há linhas vazias inesperadas.
- Tipos de dados são consistentes.
- Datas têm formato reconhecível.
- Valores numéricos não contêm texto inesperado.
- Não existem duplicidades não explicadas.
- Referências a unidades, departamentos e centros de custo existem.
- Conteúdo não apresenta divergências com documentos aprovados.

## 4. Regras para planilha de colaboradores
Campos obrigatórios ilustrativos:
- nome_completo
- email
- identificador
- unidade
- departamento
- centro_custo

Validações:
1. Nome não pode estar vazio.
2. E-mail deve ter formato válido.
3. E-mail duplicado deve ser sinalizado.
4. Identificador deve ser único no escopo definido.
5. Unidade deve existir na lista aprovada.
6. Departamento deve existir.
7. Centro de custo deve existir e estar ativo.
8. Status deve pertencer ao conjunto permitido.
9. Gestor deve ser referência válida, quando obrigatório.
10. Linhas com dados incompletos devem ser separadas para correção.

## 5. Severidade
**Crítica:** pode causar acesso indevido, associação financeira incorreta ou configuração insegura. Bloquear avanço.  
**Alta:** impede importação ou operação de parte relevante dos usuários. Corrigir antes da etapa dependente.  
**Média:** gera inconsistência localizada ou exige confirmação.  
**Baixa:** melhoria de padronização sem impacto imediato.

## 6. Erro, alerta e dúvida
- **Erro:** regra objetiva violada. Exemplo: e-mail ausente em coluna obrigatória.
- **Alerta:** situação incomum que pode ser válida. Exemplo: colaborador sem gestor em uma estrutura que talvez não exija gestor.
- **Dúvida:** documentos não permitem determinar a resposta. Exemplo: centro de custo aparece com dois nomes.
- **Sugestão:** oportunidade de melhoria. Exemplo: padronizar abreviações.

## 7. Divergência entre arquivos
Exemplo: `colaboradores_v1.xlsx` informa 95 pessoas e `colaboradores_final.xlsx` informa 102.
Procedimento:
1. Registrar os dois nomes e datas dos arquivos.
2. Verificar se um substitui formalmente o outro.
3. Comparar diferenças.
4. Solicitar confirmação ao responsável.
5. Marcar a versão aprovada.
6. Evitar misturar linhas de versões diferentes sem autorização.

## 8. Dados duplicados
Duplicidade pode ser:
- Duplicidade exata: mesma linha repetida.
- Duplicidade provável: mesmo e-mail com nome diferente.
- Duplicidade de identificador: código repetido.
- Duplicidade legítima: pessoa vinculada a mais de uma unidade, conforme regra.

Não remover registros automaticamente. Classificar e solicitar confirmação quando a legitimidade não for clara.

## 9. Datas e valores
- Confirmar formato DD/MM/AAAA ou ISO, conforme padrão acordado.
- Identificar datas impossíveis.
- Não interpretar `03/04/2026` sem saber o padrão regional.
- Confirmar moeda.
- Distinguir separador decimal e separador de milhar.
- Não converter valores estrangeiros sem taxa e regra definidas.

## 10. Arquivos PDF e texto
- Verificar se o texto é selecionável ou se exige OCR.
- Registrar páginas ilegíveis.
- Identificar título, versão e data.
- Comparar anexos e referências.
- Não considerar que a extração automática capturou tabelas perfeitamente.
- Revisar números, datas, nomes e limites críticos.

## 11. Uso de IA
A IA pode:
- Sugerir mapeamento de colunas.
- Resumir documentos.
- Apontar contradições prováveis.
- Gerar perguntas de esclarecimento.
- Explicar erros em linguagem simples.

A IA não pode:
- Inventar campos faltantes.
- Corrigir valores financeiros sem confirmação.
- Escolher uma versão oficial sem evidência.
- aprovar política ou cadastro.
- substituir validação de formato por opinião textual.

## 12. Relatório de validação
Um relatório deve conter:
- Nome do arquivo.
- Data de recebimento.
- Versão.
- Total de linhas ou páginas.
- Regras executadas.
- Erros por severidade.
- Alertas.
- Dúvidas.
- Linhas afetadas.
- Recomendação.
- Responsável pela revisão.
- Status final.

## 13. Critério de aceite
O arquivo é aceito quando passou pelas regras aplicáveis, as inconsistências impeditivas foram corrigidas, dúvidas foram respondidas e a versão aprovada está identificada.
