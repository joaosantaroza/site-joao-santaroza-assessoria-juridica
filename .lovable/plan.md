

## Plano: Nova Especialidade "Auxílio-Acidente" + 5 Artigos

### O que será feito

1. **Nova área de atuação em Especialidades** — card "Auxílio-Acidente" com ícone, descrição e página dedicada com features baseadas no PDF (conversão de auxílio-doença, requisitos, retroativos, acumulação com salário).

2. **5 artigos gerados via IA** sobre o tema, usando o sistema de geração de artigos já existente no admin.

3. **Sugestões adicionais de conteúdo** ao final.

---

### Alterações técnicas

**`src/lib/constants.ts`**
- Adicionar entrada `auxilio_acidente` no objeto `SERVICES` com:
  - Título: "Auxílio-Acidente"
  - Descrição: conversão de auxílio-doença, sequelas permanentes, acumulação com salário
  - Features: Conversão de Benefício, Retroativos do INSS, Perícia Médica, Acumulação com Salário
- Atualizar `ViewType` para incluir `'auxilio_acidente'`

**`src/lib/practiceAreaCategories.ts`**
- Adicionar categorias: `['Previdenciário', 'Auxílio-Acidente', 'INSS', 'Benefício', 'Incapacidade']`
- Adicionar título de artigos: "Artigos sobre Auxílio-Acidente"

**`src/components/PracticeAreasHub.tsx`**
- Adicionar novo `ServiceCard` com ícone `Activity` (já importado em constants) para "Auxílio-Acidente"

**5 Artigos — gerados via Edge Function `generate-article`**
Os artigos serão criados no banco de dados com as seguintes pautas baseadas no PDF:

1. **"O que é o Auxílio-Acidente e quem tem direito?"** — conceito, natureza indenizatória, requisitos do art. 86 da Lei 8.213/91
2. **"Conversão de Auxílio-Doença em Auxílio-Acidente: como funciona"** — procedimento, alta do INSS com sequelas, papel da perícia
3. **"Auxílio-Acidente e trabalho: é possível acumular com salário?"** — natureza cumulativa, vedações, jurisprudência do STJ
4. **"Retroativos do Auxílio-Acidente: como recuperar valores atrasados"** — parcelas não pagas, prazo prescricional, cálculo
5. **"Doenças ocupacionais e Auxílio-Acidente: direitos do trabalhador"** — LER/DORT, frigoríficos, construção civil, nexo causal

Cada artigo será gerado com categorias `['Previdenciário', 'Auxílio-Acidente', 'INSS']`, modo informativo conforme Provimento 205/2021 da OAB, e extensão média (800-1200 palavras).

