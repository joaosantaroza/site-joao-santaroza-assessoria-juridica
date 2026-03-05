

# Automacao de Follow-up para Leads

## Limitacao importante

O Lovable **nao suporta envio de emails transacionais ou de marketing** — apenas emails de autenticacao. Portanto, uma sequencia de emails de follow-up automatizada via email nao e viavel nativamente.

## Alternativa proposta: Follow-up via WhatsApp + Notificacoes Admin

Em vez de emails, implementar um sistema de follow-up que combina:

1. **Fila de follow-ups no banco de dados** — tabela `follow_ups` que registra cada lead/agendamento com datas programadas de acompanhamento
2. **Dashboard de follow-up no Admin** — nova aba "Follow-up" mostrando leads que precisam de contato hoje, com templates de mensagem WhatsApp prontos por area juridica
3. **Notificacoes automaticas ao admin** — alertas quando um follow-up esta pendente
4. **Templates de mensagem por area** — mensagens pre-escritas para cada area juridica, com botao de copiar e link direto para WhatsApp

### Etapas

#### 1. Criar tabela `follow_ups`
```sql
CREATE TABLE public.follow_ups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_type text NOT NULL, -- 'ebook' ou 'appointment'
  lead_id uuid NOT NULL,
  lead_name text NOT NULL,
  lead_phone text NOT NULL,
  practice_area text NOT NULL,
  follow_up_date date NOT NULL,
  sequence_step integer NOT NULL DEFAULT 1, -- 1=dia seguinte, 2=3 dias, 3=7 dias
  status text NOT NULL DEFAULT 'pending', -- pending, completed, skipped
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);
```
Com RLS para admins e service_role.

#### 2. Edge function `create-follow-up-sequence`
Chamada automaticamente pelas edge functions existentes (`submit-ebook-lead`, `submit-appointment`) apos salvar o lead. Cria 3 registros de follow-up:
- Dia seguinte (step 1)
- 3 dias depois (step 2)  
- 7 dias depois (step 3)

#### 3. Templates de mensagem WhatsApp por area juridica
Arquivo `src/lib/followUpTemplates.ts` com mensagens personalizadas:
- **Isencao IR/HIV**: "Ola [nome], tudo bem? Vi que voce demonstrou interesse em isencao de IR..."
- **Trabalhista**: "Ola [nome], como esta? Gostaria de saber se conseguiu resolver..."
- **Desbloqueio**: "Ola [nome], passando para verificar se a situacao do bloqueio..."
- Cada area com 3 variantes (uma por step)

#### 4. Nova aba "Follow-up" no Admin
- Lista de follow-ups pendentes para hoje (e atrasados)
- Filtro por status e area
- Botao "Enviar via WhatsApp" que abre link com mensagem pre-preenchida
- Botao "Marcar como concluido" / "Pular"
- Indicadores: total pendente, concluidos hoje, taxa de conversao

#### 5. Notificacao automatica
Ao criar follow-ups, inserir notificacao na tabela `admin_notifications` existente para alertar o admin.

### Arquivos a criar
- `supabase/functions/create-follow-up-sequence/index.ts`
- `src/lib/followUpTemplates.ts`

### Arquivos a modificar
- `supabase/functions/submit-ebook-lead/index.ts` — chamar create-follow-up-sequence
- `supabase/functions/submit-appointment/index.ts` — chamar create-follow-up-sequence
- `src/pages/Admin.tsx` — adicionar aba Follow-up
- `supabase/config.toml` — registrar nova edge function

### Resultado
Sistema semi-automatizado onde o admin recebe lembretes diarios de quem precisa de follow-up, com mensagens prontas para envio via WhatsApp — o canal mais efetivo para contato com clientes no Brasil.

