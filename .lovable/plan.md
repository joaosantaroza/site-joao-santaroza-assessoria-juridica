
# Transformar o Site em PWA Instalavel

## O que sera feito
O site sera transformado em um Progressive Web App (PWA) que pode ser instalado no celular como um aplicativo nativo, com suporte a funcionamento offline e notificacoes push para novos artigos.

## Etapas

### 1. Instalar e configurar o plugin PWA no Vite
- Instalar `vite-plugin-pwa`
- Configurar em `vite.config.ts` com manifest, service worker (Workbox), e estrategias de cache
- Adicionar `/~oauth` ao `navigateFallbackDenylist` para nao interferir com autenticacao
- Definir o manifesto com nome, cores, icones e configuracao de display standalone

### 2. Criar icones do PWA
- Criar icones em `public/` nos tamanhos 192x192 e 512x512 (usando o favicon existente como base)
- Adicionar meta tags de PWA no `index.html` (theme-color, apple-touch-icon, etc.)

### 3. Criar pagina `/instalar`
- Nova pagina `src/pages/Install.tsx` com instrucoes visuais de como instalar o app
- Botao que dispara o prompt nativo de instalacao (evento `beforeinstallprompt`)
- Instrucoes especificas para iOS (Share → Adicionar a Tela Inicio) e Android
- Adicionar rota no `App.tsx`

### 4. Componente de prompt de instalacao
- Criar `src/components/PWAInstallPrompt.tsx` - um banner/toast que aparece para usuarios mobile sugerindo instalar o app
- Mostrar apenas uma vez (salvar no localStorage)

### 5. Notificacoes Push para novos artigos
- Criar edge function `push-subscribe` para salvar subscricoes push no banco
- Criar tabela `push_subscriptions` (endpoint, keys, created_at) com RLS
- Criar edge function `send-push-notification` que envia notificacoes via Web Push API
- Gerar par de chaves VAPID e salvar como secrets
- No frontend, solicitar permissao de notificacao e registrar a subscricao
- No admin, ao publicar um artigo, disparar notificacao push para todos os inscritos

### 6. Integracao no site
- Adicionar botao "Ativar Notificacoes" no footer ou navbar
- Mostrar badge de "Novo" para artigos nao lidos apos push

## Arquivos a criar
- `src/pages/Install.tsx` - pagina de instalacao
- `src/components/PWAInstallPrompt.tsx` - prompt de instalacao
- `src/hooks/usePWA.ts` - hook para gerenciar instalacao e notificacoes
- `supabase/functions/push-subscribe/index.ts` - salvar subscricoes
- `supabase/functions/send-push-notification/index.ts` - enviar notificacoes

## Arquivos a modificar
- `vite.config.ts` - adicionar vite-plugin-pwa
- `index.html` - meta tags PWA
- `src/App.tsx` - adicionar rota /instalar
- `src/components/Navbar.tsx` - botao de notificacoes

## Banco de dados
- Nova tabela `push_subscriptions` com colunas: id, endpoint, p256dh, auth, created_at
- RLS: insert publico (via service_role), select/delete para admins

## Secrets necessarios
- `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` - chaves para Web Push (serao geradas automaticamente pela edge function na primeira execucao ou fornecidas pelo usuario)

## Resultado
- App instalavel em qualquer celular (Android e iOS)
- Funciona offline com cache dos artigos ja visitados
- Usuarios recebem notificacao push quando um novo artigo e publicado
