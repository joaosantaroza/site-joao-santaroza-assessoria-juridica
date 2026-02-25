
# Pagina "Sobre" - E-E-A-T Otimizada

## Objetivo
Criar uma pagina dedicada `/sobre` com foco em demonstrar Experiencia, Especialidade, Autoridade e Confiabilidade (E-E-A-T) do advogado para o Google e visitantes.

## Conteudo da Pagina

A pagina tera as seguintes secoes:

1. **Hero** -- Foto profissional (ja existente em `src/assets/lawyer-photo.jpg`) ao lado do nome, OAB e uma frase de apresentacao
2. **Historia / Bio** -- Texto narrativo sobre a trajetoria do advogado, motivacoes e filosofia de trabalho
3. **Timeline de Carreira** -- Linha do tempo visual com marcos profissionais (formacao, OAB, especializacoes, fundacao do escritorio)
4. **Formacao Academica** -- Cards com graduacao, pos-graduacao e cursos relevantes
5. **Valores do Escritorio** -- Grid com icones e descricoes (Etica, Transparencia, Resultado, Sigilo, Humanizacao)
6. **CTA Final** -- Botao para agendar consulta via ContactModal

## Implementacao Tecnica

### Arquivos a criar
- **`src/pages/About.tsx`** -- Pagina principal com todas as secoes, usando componentes existentes (Navbar, Footer, ContactModal, BreadcrumbsJsonLd, useSEO)

### Arquivos a modificar
- **`src/App.tsx`** -- Adicionar rota `/sobre`
- **`src/components/Navbar.tsx`** -- Adicionar link "Sobre" no menu desktop e mobile

### SEO e Dados Estruturados
- Hook `useSEO` configurado com titulo, descricao otimizada, URL canonica `/sobre` e keywords de E-E-A-T
- `BreadcrumbsJsonLd` com caminho Inicio > Sobre o Advogado
- JSON-LD `Person` schema embutido na pagina com: nome, cargo, OAB (identifier), areas de atuacao (knowsAbout), afiliacao OAB/PR, URL da pagina e imagem -- reforçando o schema que ja existe no `LocalBusinessSchema` como `founder`
- Open Graph type `profile` para compartilhamento social otimizado

### Design
- Seguira o padrao visual existente: cores navy/dourado, tipografia do projeto, componentes Framer Motion para animacoes de entrada
- Responsivo com layout em grid para desktop e stack para mobile
- Timeline com linha vertical e marcadores estilizados

### Dados do Advogado
Os dados serao definidos diretamente na pagina (constantes locais), usando informacoes ja disponiveis em `CONTACT_INFO` (nome, OAB, foto, endereco). Os textos de bio, formacao e timeline serao placeholders editaveis que o usuario podera ajustar depois.
