
# Mapa de Calor de Atividade por Dia/Hora

## Objetivo
Criar um componente de mapa de calor (heatmap) no painel admin que mostre a distribuição de leads e cliques WhatsApp por dia da semana (eixo Y) e hora do dia (eixo X), permitindo identificar os melhores momentos para engajamento.

## Componente: `src/components/admin/ActivityHeatmap.tsx`

- Grid 7 linhas (Seg-Dom) x 24 colunas (0h-23h)
- Cada celula com cor proporcional a intensidade (escala de transparencia usando a cor accent)
- Tooltip ao passar o mouse mostrando: dia, hora e quantidade
- Toggle para alternar entre "Leads" e "WhatsApp"
- Labels nos eixos: dias abreviados em pt-BR no eixo Y, horas no eixo X

### Logica de dados
- Recebe `leads` e `whatsappClicks` como props (mesmos dados ja carregados no Admin)
- Agrupa por `dayOfWeek` (0-6, com `getDay()`) e `hour` (0-23, com `getHours()`)
- Calcula intensidade relativa: `count / maxCount` para mapear opacidade de 0.05 a 1
- Usa `useMemo` para performance

### Visual
- Celulas pequenas (~20x20px) com `border-radius` sutil
- Cor de fundo: accent com opacidade variavel (mais escuro = mais atividade)
- Legenda de intensidade na parte inferior (gradiente de baixo a alto)
- Animacao de entrada com framer-motion (fade-in sequencial por linha)

## Integracao no `src/pages/Admin.tsx`

- Inserir o heatmap na aba "Leads", entre o filtro de periodo WhatsApp e o card de "Leads via WhatsApp por Area" (entre linhas 509 e 511)
- Passar `leads` e `whatsappClicks` como props
- Envolver em um Card com titulo "Mapa de Calor de Atividade" e descricao

## Detalhes tecnicos

- Dias em pt-BR: `['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']`
- Horas exibidas a cada 3h no eixo X para nao poluir: 0h, 3h, 6h, ..., 21h
- Estado local `activeSource` para toggle entre leads/whatsapp
- Tooltip posicionado com CSS absolute, similar ao Sparkline
- Responsivo: scroll horizontal em mobile com `overflow-x-auto`
