

# Implementação Completa: Reajuste Abusivo em Planos de Saúde

O PDF é um relatório estratégico de 18 páginas sobre teses jurídicas, perfis de clientes e prospecção para ações de reajuste abusivo em planos de saúde (ciclo 2025-2026). Seguindo o mesmo padrão aplicado ao Mercado Livre e Auxílio-Acidente, a implementação completa envolve:

---

## 1. Nova Página de Especialidade (`reajuste_plano_saude`)

Criar um novo serviço em `src/lib/constants.ts` com:

- **Ícone**: `HeartPulse` ou novo ícone `Stethoscope`
- **heroSubtitle**: Cenário 2025-2026 — teto ANS de 6,06% vs reajustes de 15-45% em planos coletivos
- **8 features técnicas**:
  - Tese do Falso Coletivo (MEI/PME)
  - Equiparação ao Índice ANS
  - Perícia Atuarial de Sinistralidade
  - Proteção por Faixa Etária (Estatuto do Idoso)
  - Restituição Retroativa (3 anos)
  - Tutela de Urgência (Liminar)
  - Blindagem contra Cancelamento (Tema 1082 STJ)
  - Notificação Extrajudicial Estratégica

- **FAQ jurídico (7 perguntas)** baseado no conteúdo do PDF:
  1. O que é um "falso coletivo" e por que meu plano MEI/PME pode ser ilegal?
  2. Meu plano coletivo pode ter reajuste limitado ao teto da ANS?
  3. A operadora pode cancelar meu plano por eu entrar com ação judicial?
  4. Como provar que o reajuste por sinistralidade é abusivo?
  5. O Estatuto do Idoso protege contra reajustes por faixa etária?
  6. Posso recuperar valores pagos a mais nos últimos anos?
  7. A operadora pode cancelar meu plano durante um tratamento médico?

---

## 2. 5 Artigos de Blog (inserção via migração SQL)

1. **Reajuste Abusivo em Planos de Saúde 2026: Como Identificar e Contestar** — Panorama regulatório, teto ANS vs mercado
2. **Falso Coletivo: Como a Tese Jurídica Protege Famílias com MEI ou PME** — Jurisprudência TJSP/TJRJ, equiparação
3. **Sinistralidade e VCMH: Quando o Reajuste do Plano Coletivo é Ilegal** — Dever de transparência, perícia atuarial, inversão do ônus
4. **Reajuste por Faixa Etária aos 59 Anos: Proteção do Estatuto do Idoso** — Tema 952 STJ, manobra da penúltima faixa
5. **Cancelamento de Plano de Saúde Durante Tratamento: Seus Direitos** — Tema 1082 STJ, tutela de urgência, astreintes

Categorias: `Plano de Saúde`, `Direito do Consumidor`, `Reajuste Abusivo`

---

## 3. E-book de Captura de Leads

Nova Edge Function `generate-reajuste-plano-ebook` com 7 capítulos:
1. Panorama do Mercado de Saúde Suplementar 2025-2026
2. A Tese do Falso Coletivo
3. Sinistralidade e o Dever de Transparência
4. Faixa Etária e o Estatuto do Idoso
5. Proteção contra Cancelamento Unilateral
6. Roadmap Processual: Da Notificação à Liminar
7. Restituição Retroativa e Cálculo de Valores

Capa gerada com branding Navy/Bronze e ícones de saúde.

---

## 4. Pillar Page / Cluster de Conteúdo

- Novo cluster `reajuste-plano-saude` em `contentClusters.ts`
- Rota `/temas/reajuste-plano-saude`
- Categorias em `practiceAreaCategories.ts`

---

## 5. Navegação

- Links na **Navbar** (desktop + mobile) e **Footer** para a pillar page
- Integração do banner do e-book na página de especialidade

---

## Arquivos a modificar/criar

| Arquivo | Ação |
|---|---|
| `src/lib/constants.ts` | Adicionar serviço `reajuste_plano_saude` |
| `src/components/ServicePage.tsx` | FAQ + e-book banner (já suporta via pattern existente) |
| `src/lib/contentClusters.ts` | Novo cluster |
| `src/lib/practiceAreaCategories.ts` | Novas categorias |
| `src/components/Navbar.tsx` | Link na nav |
| `src/components/Footer.tsx` | Link no footer |
| `supabase/functions/generate-reajuste-plano-ebook/index.ts` | **Criar** — Edge Function do e-book |
| `src/assets/ebook-reajuste-plano-capa.png` | **Criar** — Capa do e-book |
| Migração SQL | 5 artigos na tabela `blog_posts` |

