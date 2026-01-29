
# Plano: Adicionar Navegação para /blog ao Clicar em "Artigos"

## Resumo
O card "Artigos e Informativos" na página inicial não está navegando corretamente para a página do blog. O problema é que ele usa `onNavigate('blog')`, mas 'blog' não é um valor válido do tipo de navegação interna. Vou corrigir para usar o React Router, igual ao menu de navegação.

## O que será alterado

### Arquivo: `src/components/HomePage.tsx`
- Importar o hook `useNavigate` do React Router
- Substituir o `onClick={() => onNavigate('blog')}` por `onClick={() => navigate('/blog')}`
- Isso fará o card navegar corretamente para a página `/blog`

## Resultado esperado
Ao clicar no card "Artigos e Informativos" na página inicial, o usuário será direcionado para `/blog`, assim como acontece ao clicar em "Artigos" no menu de navegação.

---

## Detalhes técnicos

**Mudança no código:**
```tsx
// Antes (não funciona)
onClick={() => onNavigate('blog')}

// Depois (correto)
const navigate = useNavigate();
// ...
onClick={() => navigate('/blog')}
```

**Arquivos afetados:**
- `src/components/HomePage.tsx` - única alteração necessária
