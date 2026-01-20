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

### Alta Prioridade

#### 1. Calcular Progresso Real de Lições
- **Status**: ❌ Não implementado
- **Situação Atual**: Dashboard mostra 0% para todos os cursos
- **Solução Proposta**: 
  - Corrigir RPC `get_my_course_progress` ou
  - Adicionar cálculo no hook `useUserProgress`
  - Query: `COUNT(DISTINCT academy_progress WHERE completed_at IS NOT NULL) / COUNT(DISTINCT academy_lessons)`

#### 2. Corrigir Enrollment Count nos Course Cards
- **Status**: ❌ Mostra count total, não distinct users
- **Problema**: Um user com 2 vendas para mesmo curso aparece como 2 enrollments
- **Solução**: Usar `COUNT(DISTINCT user_id)` em vez de `COUNT(*)`

#### 3. Payment Integration (Stripe)
- **Status**: ❌ Não começado
- **Objetivo**: Permitir alunos comprarem cursos online
- **Requisitos**:
  - Webhook handler para `checkout.session.completed`
  - Criar sale quando pagamento confirmado
  - Enrollment criado automaticamente via trigger
  - Redirect após sucesso

#### 4. Email Automation (n8n)
- **Status**: ❌ Não começado
- **Objetivo**: Enviar emails automáticos
- **Casos de Uso**:
  - Confirmação de inscrição
  - Conclusão de curso
  - Reminder de progresso
- **Integração**: Webhooks ou triggers do Supabase

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

### 1. RPC `get_my_course_progress` com Workaround
- **Ficheiro**: `useUserProgress.ts`
- **Situação**: Usa query direta em vez de RPC
- **Razão**: PostgREST 403 error (cache issue)
- **TODO**: Reverter para RPC quando cache refrescar

### 2. Lesson Progress Mostrado como 0%
- **Situação**: Todos os cursos aparecem com `0% concluído`
- **Causa**: Cálculo de progresso não implementado
- **Impacto**: UX - alunos não veem progresso real
- **Prioridade**: Alta

### 3. Enrollment Count Incorreto
- **Situação**: Course cards mostram count total de enrollments
- **Problema**: Não usa `DISTINCT user_id`
- **Impacto**: Analytics - número inflacionado
- **Prioridade**: Média

### 4. Sem Payment Gateway
- **Situação**: Apenas enrollments manuais via admin
- **Impacto**: Não há fluxo de compra para utilizadores finais
- **Prioridade**: Alta (blocker para lançamento público)

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
1. ✅ **Implementar cálculo de progresso real**
   - Corrigir query ou hook para mostrar % correto
2. ✅ **Corrigir enrollment count**
   - Usar DISTINCT user_id
3. ⚠️ **Setup Stripe Checkout**
   - Webhook handler
   - Fluxo de compra end-to-end

### Médio Prazo (1 mês)
4. ⚠️ **Email automation (n8n)**
   - Confirmação de inscrição
   - Conclusão de curso
5. ⚠️ **Refund handling**
   - UI admin para processar refunds
   - Soft-delete sales

### Longo Prazo (3+ meses)
6. ⚠️ **Subscription model**
   - Recurring payments
   - Access management
7. ⚠️ **Certificates**
   - PDF generation
   - Email delivery
8. ⚠️ **Advanced analytics**
   - Completion rates
   - Revenue forecasting

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
