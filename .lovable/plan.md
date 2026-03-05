

# Corrigir Erros de Build + Exportacao de Relatorios em PDF e CSV

## Parte 1: Corrigir erros de build (pre-requisito)

Existem dois erros de build que precisam ser corrigidos antes de qualquer nova funcionalidade:

### 1.1 CSS @import deve vir antes de outras declaracoes
O arquivo `src/index.css` tem `@import url(...)` na linha 5, depois dos `@tailwind`. Mover o `@import` para a linha 1 (antes dos `@tailwind`).

### 1.2 PWA: arquivo muito grande para pre-cache
O asset `ebook-gestante-capa.png` (2.55 MB) excede o limite padrao de 2 MB do Workbox. Solucao: adicionar `maximumFileSizeToCacheInBytes: 3 * 1024 * 1024` na configuracao do workbox em `vite.config.ts`, e excluir PNGs grandes do glob de pre-cache.

**Arquivo:** `vite.config.ts` - adicionar `maximumFileSizeToCacheInBytes: 3 * 1024 * 1024` dentro de `workbox`
**Arquivo:** `src/index.css` - mover `@import url(...)` para antes dos `@tailwind`

---

## Parte 2: Exportacao de Relatorios em PDF e CSV

### O que sera feito
Adicionar botoes de exportacao no painel admin para gerar relatorios em PDF e CSV de tres conjuntos de dados:
- **Leads de E-books** (ja tem CSV, adicionar PDF)
- **Agendamentos** (adicionar CSV e PDF)
- **Analytics/WhatsApp** (ja tem CSV, adicionar PDF)

### Abordagem tecnica
Geracao de PDF sera feita 100% no frontend usando uma utilidade leve que cria PDFs com a API nativa do Canvas + Blob, sem dependencias externas pesadas. O PDF tera o visual institucional (cores Navy/Bronze, logotipo).

### Novo arquivo: `src/lib/exportUtils.ts`
Utilidades compartilhadas para exportacao:
- `exportToCSV(headers, rows, filename)` - funcao generica de CSV (refatorar o codigo existente)
- `exportToPDF(title, headers, rows, filename)` - gera PDF tabelar usando a abordagem de construcao manual de documento PDF (string-based, sem lib externa)
- O PDF incluira: cabecalho com nome do escritorio, data de geracao, tabela formatada, rodape com pagina

### Modificacoes em `src/pages/Admin.tsx`
1. **Aba Agenda**: Adicionar botoes "Exportar CSV" e "Exportar PDF" no cabecalho da tabela de agendamentos
2. **Aba Leads**: Adicionar botao "Exportar PDF" ao lado dos botoes CSV existentes
3. **Aba Leads (WhatsApp)**: Adicionar botao "Exportar PDF" ao lado do CSV existente
4. Refatorar as funcoes de CSV existentes para usar `exportToCSV` do novo utilitario

### Formato do PDF
- Cabecalho: "Joao Santaroza Advocacia - [Tipo do Relatorio]"
- Data de geracao
- Tabela com dados formatados
- Cores: fundo de cabecalho navy (#273A5F), texto branco
- Rodape com numero da pagina

### Detalhes de implementacao

**Exportacao de Agendamentos (CSV)**:
- Colunas: Nome, Area, Data, Horario, Status, Telefone, E-mail
- Nome do arquivo: `agendamentos-YYYY-MM-DD.csv`

**Exportacao de Agendamentos (PDF)**:
- Mesmas colunas, formatadas em tabela
- Nome do arquivo: `agendamentos-YYYY-MM-DD.pdf`

**Exportacao de Leads (PDF)**:
- Versao segura (PII mascarado) e versao completa
- Colunas: Nome, Telefone, E-book, Data
- Nome do arquivo: `leads-ebooks-YYYY-MM-DD.pdf`

**Exportacao WhatsApp (PDF)**:
- Resumo por area (area, quantidade, percentual)
- Nome do arquivo: `whatsapp-analytics-YYYY-MM-DD.pdf`

### Arquivos a criar
- `src/lib/exportUtils.ts` - utilidades de exportacao CSV e PDF

### Arquivos a modificar
- `vite.config.ts` - fix maximumFileSizeToCacheInBytes
- `src/index.css` - fix @import order
- `src/pages/Admin.tsx` - adicionar botoes de exportacao PDF e refatorar CSV

