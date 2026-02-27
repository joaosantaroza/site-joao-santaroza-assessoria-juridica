

# Sistema de Agendamento Online de Consultas

## Visao Geral
Criar um sistema completo de agendamento onde visitantes podem marcar consultas pelo site. O agendamento sera salvo no banco de dados e visivel no painel admin, com notificacao via WhatsApp para o advogado.

## Arquitetura

### 1. Tabela no banco de dados: `appointments`

```text
appointments
+------------------+---------------------------+
| Campo            | Tipo                      |
+------------------+---------------------------+
| id               | uuid (PK)                 |
| name             | text (NOT NULL)           |
| phone            | text (NOT NULL)           |
| email            | text (nullable)           |
| practice_area    | text (NOT NULL)           |
| preferred_date   | date (NOT NULL)           |
| preferred_time   | text (NOT NULL)           |
| message          | text (nullable)           |
| status           | text (default 'pending')  |
| created_at       | timestamptz               |
+------------------+---------------------------+
```

Politicas RLS:
- INSERT: qualquer visitante pode inserir (publico)
- SELECT/UPDATE/DELETE: apenas admins (`has_role(auth.uid(), 'admin')`)
- Bloqueio de read/update/delete para anon e authenticated regulares

### 2. Componente: `AppointmentModal.tsx`

Modal de agendamento acessivel pelo botao "Agende um Atendimento" no hero e em outros pontos do site. Campos:
- Nome completo (obrigatorio)
- WhatsApp (obrigatorio, com mascara)
- E-mail (opcional)
- Area de interesse (select com as areas de atuacao existentes em SERVICES)
- Data preferida (date picker com calendario, apenas dias uteis futuros)
- Horario preferido (select: 09h, 10h, 11h, 14h, 15h, 16h, 17h)
- Mensagem/relato breve (opcional)

Apos submissao:
- Salva no banco de dados
- Exibe confirmacao com opcao de enviar tambem via WhatsApp
- Animacao de sucesso com framer-motion

### 3. Integracao no site

- Substituir o `ContactModal` pelo `AppointmentModal` nos pontos de "Agendar Atendimento"
- Manter o `ContactModal` existente para contatos gerais
- Adicionar botao "Agendar Consulta" na Navbar
- Adicionar rota `/agendar` como pagina dedicada (opcional, acessivel via link direto)

### 4. Painel Admin: aba "Agenda"

Nova aba no Admin com:
- Lista de agendamentos com filtro por status (Pendente, Confirmado, Concluido, Cancelado)
- Acoes: confirmar, concluir ou cancelar agendamento
- Card de estatisticas: total pendentes, agendamentos da semana
- Botao de WhatsApp direto para contatar o cliente

### 5. Notificacao admin

Ao criar um agendamento, inserir uma notificacao na tabela `admin_notifications` (via edge function para respeitar RLS).

## Detalhes tecnicos

### Edge Function: `submit-appointment`
- Recebe os dados do formulario
- Valida inputs (nome, telefone, data)
- Insere na tabela `appointments` usando service_role
- Cria notificacao em `admin_notifications`
- Rate limit por IP (reutilizar padrao existente)
- Retorna confirmacao

### Componentes a criar
- `src/components/AppointmentModal.tsx` - modal de agendamento
- `supabase/functions/submit-appointment/index.ts` - edge function

### Componentes a modificar
- `src/pages/Admin.tsx` - adicionar aba "Agenda" com lista e gestao
- `src/components/HomePage.tsx` - conectar botao "Agende um Atendimento" ao novo modal
- `src/pages/Index.tsx` - adicionar estado e handler do modal de agendamento
- `src/components/Navbar.tsx` - adicionar botao de agendamento

### Validacao
- Validacao client-side com zod (nome min 2 chars, telefone formato brasileiro, data futura)
- Validacao server-side na edge function
- Rate limit: max 3 agendamentos por IP por hora

### UX
- Calendario interativo com react-day-picker (ja instalado)
- Horarios em formato amigavel
- Feedback visual de sucesso com animacao
- Responsivo para mobile

