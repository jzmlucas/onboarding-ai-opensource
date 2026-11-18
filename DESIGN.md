---
name: OnboardIA
description: Workspace claro com destaque violeta, conforme referência fornecida.
colors:
  primary: "#5746e8"
  canvas: "#f5f5fb"
  outer: "#dce0eb"
  surface: "#ffffff"
  ink: "#29283e"
  muted: "#716d83"
typography:
  headline:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 750
    letterSpacing: -0.03em
  body:
    fontFamily: Inter
    fontSize: 13px
rounded:
  card: 14px
  shell: 24px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
---

# OnboardIA

## Overview
Direção aprovada pela imagem de referência: sidebar branca, superfícies lavanda,
cartões brancos e destaque violeta. Os conteúdos continuam sendo os dados reais
do produto de onboarding, sem métricas ou pessoas inventadas da referência.

## Colors
Violeta para ações e navegação ativa. Verde, amarelo e vermelho ficam reservados
aos estados operacionais. Texto secundário deve manter contraste legível.

## Typography
Inter variável hospedada em `frontend/public/fonts`, com licença OFL incluída.
Títulos de 28px (24px no celular), conteúdo de 13px, apoio de 12px.

## Layout
Shell de até 1600px com margem externa de 32px. Sidebar de 224px; abaixo de
720px, rail de 64px com nomes acessíveis nos links. Grades viram uma coluna.
Copiloto e Base de conhecimento selecionam o contexto do cliente antes do conteúdo.

## Elevation & Depth
Cartões brancos sobre fundo lavanda, com sombra discreta e sem borda sobreposta.

## Shapes
Cartões com raio de 14px e botões de 9px. Pill apenas para status.

## Components
Banner violeta na visão geral. Links ativos com fundo lavanda e texto violeta.
Campos com foco de 2px, estados de carregamento, erro e vazio explícitos.
Chat e documentos reutilizam OnboardingWorkspace para manter o mesmo fluxo.

## Do's and Don'ts
Preservar os dados e funções existentes. Não sinalizar um provedor de IA como
ativo sem confirmação. Não usar dados fictícios para preencher o dashboard.
