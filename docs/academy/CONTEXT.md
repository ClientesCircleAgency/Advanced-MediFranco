# MediFranco Academy - Contexto Completo do Projeto

**Data de Atualização**: 2026-01-20  
**Status**: Sales-First Architecture completamente implementado e validado em produção

---

## 📊 Estado Atual do Projeto

### ✅ Completamente Funcional
- Sistema de inscrições com sales como fonte de verdade
- Dashboard de admin (cursos, inscrições, vendas)
- Dashboard de alunos (visualização de cursos inscritos)
- Analytics de vendas e receitas
- Integridade de dados garantida a nível de base de dados

### 🎯 Regra de Negócio Principal
**1 inscrição = 1 venda, SEMPRE**

Impossível ter:
- ❌ Enrollment sem sale
- ❌ Sale sem enrollment
- ❌ Duplicados
- ❌ Orphan records

---

## 🏗️ Arquitetura Implementada

### Sales-First Architecture

```
academy_sales (FONTE DE VERDADE) → academy_enrollments (DERIVADO)
```

**Fluxo**:
1. Admin cria **sale** (via RPC `admin_create_sale_and_enrollment`)
2. Trigger `trigger_create_enrollment_from_sale` cria enrollment automaticamente
3. Aluno tem acesso ao curso
4. Delete de sale → CASCADE delete de enrollment

**Garantias Database-Level**:
- FK constraint: `academy_enrollments.sale_id NOT NULL REFERENCES academy_sales(id) ON DELETE CASCADE`
- Unique index: `idx_enrollment_sale_unique` (1 enrollment por sale)
- Trigger: Auto-cria enrollment quando sale inserida
- RLS policies: Admin pode SELECT/INSERT/DELETE em ambas tabelas

---

## 📁 Estrutura do Projeto

### Database (Supabase PostgreSQL)

**Tabelas Principais**:
- `academy_courses` - Cursos disponíveis
- `academy_sales` - **FONTE DE VERDADE** para enrollments
- `academy_enrollments` - Inscrições (derivadas de sales)
- `academy_modules` - Módulos dos cursos
- `academy_lessons` - Aulas dentro de módulos
- `academy_progress` - Progresso dos alunos por aula

**RPCs Importantes**:
- `admin_create_sale_and_enrollment(p_course_id, p_email)` - Criar inscrição manual
- `admin_list_enrollments(p_course_id)` - Listar inscritos
- `admin_list_sales()` - Listar vendas
- `get_my_course_progress()` - Cursos do aluno (atualmente com workaround direto)

**Triggers**:
- `trigger_create_enrollment_from_sale` - Auto-cria enrollment quando sale criada

### Frontend (React + TypeScript)

**Estrutura**:
```
academy/src/
├── pages/
│   ├── admin/
│   │   ├── AdminEnrollments.tsx - Gestão de inscrições
│   │   ├── AdminSales.tsx - Visualização de vendas
│   │   └── AdminCourses.tsx - Gestão de cursos
│   └── Dashboard.tsx - Dashboard de alunos
├── hooks/
│   ├── useAdminCourses.ts - Hooks admin (enrollments, sales, courses)
│   └── useUserProgress.ts - Hook para progresso do aluno
└── components/
    └── ui/ - Componentes de UI (shadcn/ui)
```

---

## 🔧 Migrations Aplicadas em Produção

### Migration 010: Auto-Sale on Enrollment
- **Data**: 2026-01-15
- **Objetivo**: Criar sale automaticamente quando admin inscreve utilizador
- Modificou RPC `admin_create_enrollment_by_email` para criar sale + enrollment

### Migration 011: Fix Student Dashboard
- **Data**: 2026-01-19
- Corrigiu RPC `get_my_course_progress` com colunas corretas
- `is_published` em vez de `published`
- `completed_at IS NOT NULL` em vez de `is_completed = true`

### Migration 012: Sales-First Architecture ⭐
- **Data**: 2026-01-19
- **Complexidade**: Alta
- Adicionou coluna `sale_id` a `academy_enrollments`
- Criou sales retroativas para enrollments órfãos
- FK constraint com CASCADE delete
- Trigger para auto-enrollment
- Novo RPC `admin_create_sale_and_enrollment`
- Validação de integridade: PERFECT ✅

### Migration 013: Admin Delete Policy (Sales)
- **Data**: 2026-01-19
- RLS policy DELETE para admins em `academy_sales`
- Permite admin apagar sales (que CASCADE apaga enrollments)

### Migration 014: Admin Enrollment Policies
- **Data**: 2026-01-19
- RLS DELETE policy para admins em `academy_enrollments`
- RLS INSERT policy para trigger/admins
- Permite CASCADE delete funcionar

### Migration 015: Admin SELECT Policy
- **Data**: 2026-01-19
- RLS SELECT policy para admins em `academy_enrollments`
- Necessário para delete flow (frontend busca `sale_id` antes de deletar)

---

## 🐛 Bugs Corrigidos

### Bug 1: "Curso N/A" em Sales History
- **Causa**: Frontend esperava `sale.course.title` mas RPC retorna `sale.course_title`
- **Fix**: Mudado para `sale.course_title`
- **Ficheiro**: `AdminSales.tsx`

### Bug 2: Student Dashboard RPC 403
- **Causa**: PostgREST cache não recarregou após modificações RPC
- **Fix**: Workaround com query direta em `useUserProgress.ts`
- **Status**: Temporário, RPC deve funcionar eventualmente quando cache refrescar

### Bug 3: Delete Enrollment Bloqueado
- **Causa**: Falta de RLS policies DELETE/SELECT em `academy_enrollments`
- **Fix**: Migrations 013-015
- **Status**: ✅ Resolvido

### Bug 4: Duplicado Mostrava Sucesso
- **Causa**: Frontend não verificava flag `already_exists` do RPC
- **Fix**: Adicionada lógica de detecção em `AdminEnrollments.tsx`
- **Status**: ✅ Resolvido - mostra erro vermelho

---

## ✅ Validado em Produção

**URL**: https://advanced-medi-franco.vercel.app

**Testes Realizados** (2026-01-19):
1. ✅ Criar enrollment manual → sale criada automaticamente
2. ✅ Apagar enrollment → sale CASCADE deleted
3. ✅ Duplicado bloqueado → mensagem vermelha
4. ✅ Revenue sincronizada perfeitamente
5. ✅ Aluno vê cursos em `/cursos`
6. ✅ Analytics corretas (Total Vendas, Receita)

**Data Integrity**:
```sql
SELECT COUNT(*) FROM academy_enrollments WHERE sale_id IS NULL;
-- Resultado: 0 (PERFECT ✅)
```

---

## 🚧 Pendente / Roadmap Futuro

### ✅ Concluído Recentemente

#### Phase 9.0-2: Webhook Contract Enhancement
- **Status**: ✅ **COMPLETO** (2026-01-22)
- **Implementado**:
  - Campos Stripe top-level no payload: `stripe_customer_id`, `stripe_payment_intent_id`, `stripe_checkout_session_id`
  - Extraídos de `metadata.*` automaticamente
  - Funciona para manual (null) e futuro Stripe (preenchido)
  - Zero breaking changes

#### Phase 9.0-1: Stripe-like Manual Sales + Events
- **Status**: ✅ **COMPLETO** (2026-01-21)
- **Implementado**:
  - `payment_status` enum (paid, pending, failed, refunded)
  - `provider` enum (manual, stripe, other)
  - `metadata` JSONB para campos Stripe
  - Tabela `academy_events` com trigger automático
  - Evento `sale.created` para n8n

#### Phase 8.0: Real Student Progress Tracking
- **Status**: ✅ **COMPLETO** (2026-01-20)
- **Implementado**:
  - Cálculo real de progresso (completed / total lessons)
  - Botões inteligentes: Começar / Continuar / Rever Curso
  - Auto-sync (dashboard atualiza sem reload)
  - Persistência total (logout/login mantém progresso)

---

### Alta Prioridade

#### 1. Stripe Checkout Integration
- **Status**: ❌ Não começado
- **Pré-requisitos**: ✅ COMPLETOS (Phase 9.0-1 e 9.0-2)
- **Objetivo**: Permitir compras online via Stripe
- **Implementação**:
  - Criar Stripe Checkout Session
  - Webhook `/api/webhooks/stripe` para `checkout.session.completed`
  - Criar sale com `provider='stripe'`
  - Preencher `metadata` com IDs Stripe
  - Enrollment + Event criados automaticamente (triggers)
- **Estimativa**: 1-2 dias

#### 2. n8n Email Automation
- **Status**: ❌ Não começado
- **Pré-requisitos**: ✅ COMPLETOS (academy_events pronto)
- **Objetivo**: Automação de emails via n8n
- **Implementação**:
  - n8n workflow com polling em `academy_events`
  - Processar `sale.created` → enviar email boas-vindas
  - Processar `course.completed` → enviar certificado
  - Marcar eventos como `processed_at` após envio
- **Casos de Uso**:
  - Confirmação de inscrição
  - Conclusão de curso
  - Reminder de progresso
- **Estimativa**: 1 dia

### Média Prioridade

#### 5. Refund Handling
- **Status**: ❌ Não implementado
- **Proposta**: Soft-delete em `academy_sales`
  - Adicionar coluna `refunded_at TIMESTAMPTZ`
  - Adicionar coluna `refund_reason TEXT`
  - RLS policy: Aluno sem acesso se `refunded_at IS NOT NULL`
  - Manter enrollment para audit trail

#### 6. Free Courses Support
- **Status**: ⚠️ Parcialmente funciona
- **Situação Atual**: Cursos com `price_cents = NULL` criam sale com `amount_cents = 0`
- **Melhoria**: Adicionar `payment_method = 'free'` explicitamente

#### 7. Gift Purchases
- **Status**: ❌ Não implementado
- **Requisito**: `buyer_id` ≠ `user_id` em `academy_sales`
- **UI**: Admin pode especificar comprador diferente de beneficiário

#### 8. Subscription Model
- **Status**: ❌ Não implementado
- **Conceito**: Uma sale → múltiplos enrollments ao longo do tempo
- **Schema Change**: `subscription_id` em `academy_sales`

### Baixa Prioridade

#### 9. Bulk Enrollment (CSV Upload)
- **Status**: ❌ Não implementado
- **UI**: Upload CSV com emails → criar sales em batch

#### 10. Course Completion Certificates
- **Status**: ❌ Não implementado
- **Requisito**: Gerar PDF quando `progress = 100%`

#### 11. Progress Analytics Dashboard
- **Status**: ❌ Não implementado
- **Métricas**: Completion rate, average time, drop-off points

---

## 🔐 Security & Permissions

### RLS Policies Ativas

**academy_sales**:
- `Admins can create sales` (INSERT)
- `Admins can read sales` (SELECT)
- `Admins can update sales` (UPDATE)
- `Admins can delete sales` (DELETE)

**academy_enrollments**:
- `academy_enrollments_admin_select` (SELECT)
- `academy_enrollments_system_insert` (INSERT)
- `academy_enrollments_admin_delete` (DELETE)

**academy_courses**:
- Public SELECT para cursos publicados
- Admin full CRUD

### Auth Setup
- **Provider**: Supabase Auth
- **Roles**: `authenticated`, admin via `is_academy_admin()` function
- **Admin Check**: Verifica `auth.users.email` contra lista de admins

---

## 📚 Documentação Existente

### No Projeto
- `docs/academy/CHANGELOG.md` - Histórico detalhado de features
- `academy/README.md` - Setup e instalação (se existir)

### Artifacts (Desta Sessão)
- `implementation_plan.md` - Plano arquitetural sales-first
- `production_deploy.md` - Guia de deploy com rollback
- `walkthrough.md` - Walkthrough completo da implementação
- `task.md` - Checklist completo (tudo ✅)

---

## 🛠️ Tech Stack

**Frontend**:
- React 18
- TypeScript
- Vite
- TanStack Query (React Query)
- Shadcn/ui (Radix UI + Tailwind)
- Lucide Icons

**Backend**:
- Supabase PostgreSQL
- PostgREST (API automática)
- RLS (Row Level Security)
- Database Triggers & Functions

**Deploy**:
- Vercel (Frontend automático via GitHub)
- Supabase Cloud (Database)

---

## 🚀 Como Trabalhar com o Projeto

### Desenvolvimento Local

```bash
cd academy
npm install
npm run dev  # http://localhost:3000
```

### Aplicar Migration
1. Criar ficheiro `.sql` em `academy/supabase/migrations/`
2. Copiar SQL e executar no Supabase SQL Editor (produção)
3. Testar resultado
4. Commit migration para git

### Deploy Frontend
```bash
git add .
git commit -m "feat: descrição"
git push origin development
# Vercel faz deploy automático (~2 min)
```

---

## ⚠️ Pontos de Atenção

### 1. Webhook System Ready (não integrado)
- **Status**: ✅ Sistema de eventos criado
- **Situação**: Tabela `academy_events` recebe eventos automaticamente
- **Próximo passo**: Integrar n8n para processar eventos
- **Prioridade**: Média

### 2. Stripe Fields Ready (não integrado)
- **Status**: ✅ Payload tem campos Stripe
- **Situação**: `stripe_customer_id`, `stripe_payment_intent_id`, `stripe_checkout_session_id` prontos
- **Valores atuais**: null (vendas manuais)
- **Próximo passo**: Integrar Stripe Checkout
- **Prioridade**: Alta

### 3. Enrollment Count Incorreto
- **Situação**: Course cards mostram count total de enrollments
- **Problema**: Não usa `DISTINCT user_id`
- **Impacto**: Analytics - número inflacionado
- **Prioridade**: Baixa (não afeta funcionalidade)

---

## 📞 Contexto de Negócio

**MediFranco Academy** é uma plataforma de cursos online para profissionais de saúde. 

**Cursos Atuais** (Exemplo):
- "Técnicas Avançadas" - €149.00
- "Fundamentos de Saúde" - €99.00

**Modelo de Negócio**:
- Venda direta de cursos (one-time payment)
- Admin pode inscrever manualmente (uso interno, demos, etc.)
- Futuro: Stripe para vendas automáticas

**Stakeholders**:
- Admins: Gestão de cursos, enrollments, vendas
- Alunos: Acesso a cursos comprados, tracking de progresso

---

## 🎯 Próximos Passos Recomendados

### Curto Prazo (1-2 semanas)
1. ~~**Implementar cálculo de progresso real**~~ ✅ **COMPLETO** (Phase 8.0)
2. ~~**Sistema de eventos para n8n**~~ ✅ **COMPLETO** (Phase 9.0-1 + 9.0-2)
3. ⚠️ **Integrar Stripe Checkout**
   - Criar sessões Stripe
   - Webhook handler
   - Testar fluxo completo
4. ⚠️ **Configurar n8n**
   - Workflow para processar eventos
   - Email boas-vindas
   - Email conclusão curso

### Médio Prazo (1 mês)
5. ⚠️ **Refund handling**
   - UI admin para processar refunds
   - Atualizar `payment_status='refunded'`
   - Remover acesso (soft-delete)
6. ⚠️ **Corrigir enrollment count**
   - Usar DISTINCT user_id

### Longo Prazo (3+ meses)
7. ⚠️ **Certificados PDF**
   - Gerar quando `progress = 100%`
   - Email automático via n8n
8. ⚠️ **Subscription model**
   - Recurring payments
   - Access management
9. ⚠️ **Advanced analytics**
   - Completion rates
   - Revenue forecasting
   - Student retention

---

## 💬 Notas Finais para o Agente ChatGPT

**Este projeto está em produção e funcional**, mas tem algumas melhorias pendentes (principalmente progresso de lições e payment integration).

**Sales-first architecture está 100% implementada e validada**. Qualquer alteração futura deve respeitar a regra: **1 enrollment = 1 sale**.

**Todas as migrations 010-015 estão aplicadas em produção**. Novas migrations devem seguir numeração sequencial.

**O código está em `development` branch** e Vercel faz deploy automático.

Se precisares de fazer alterações:
1. Sempre testar em localhost primeiro
2. Aplicar migrations no Supabase produção antes de deploy frontend
3. Validar data integrity após migrations
4. Testar fluxos end-to-end em produção

**Boa sorte!** 🚀
