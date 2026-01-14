# MediFranco Academy — TODO Checklist

> Checklist reorganizado: **Frontend-first** approach com mocks.

---

## Fase 1A: Setup Projeto ⏳
- [ ] Criar pasta/repo `medifranco-academy`
- [ ] Init Vite + React + TS + Tailwind + shadcn
- [ ] Configurar Supabase client (mesmo projeto)
- [ ] Criar estrutura de pastas
- [ ] Configurar env vars (URLs configuráveis)

## Fase 1B: Base de Dados (Mínimo)
- [ ] Criar tabelas `academy_*`:
  - [ ] `academy_courses` (id, title, slug, description, price_cents, image_url, is_published)
  - [ ] `academy_modules` (id, course_id, title, order)
  - [ ] `academy_lessons` (id, module_id, title, content_type, content_url, order)
  - [ ] `academy_enrollments` (id, user_id, course_id, enrolled_at)
  - [ ] `academy_progress` (id, user_id, lesson_id, completed_at)
  - [ ] `academy_integration_logs` (id, event_type, payload, created_at) — para stubs
- [ ] Migration SQL + Seed com 2 cursos dummy

## Fase 1C: Auth (Supabase)
- [ ] Configurar Supabase Auth (email/password)
- [ ] Páginas: Login, Register, Forgot Password
- [ ] AuthContext + useAuth hook
- [ ] Rotas protegidas

## Fase 1D: Frontend Completo
- [ ] **Layout & Header**
  - [ ] Header com logo, nav, user menu
  - [ ] Footer
  - [ ] Layout wrapper
- [ ] **Páginas Públicas**
  - [ ] Home (hero + catálogo preview)
  - [ ] Catálogo (lista de cursos)
  - [ ] Curso Detalhe (descrição, módulos, botão comprar)
- [ ] **Páginas Autenticadas**
  - [ ] Dashboard (meus cursos)
  - [ ] Curso Player (módulos + lições)
  - [ ] Lição Viewer (video embed + PDF)
  - [ ] Progresso (checkboxes por lição)
- [ ] **Stubs**
  - [ ] Botão "Comprar" → mock checkout (success_url redirect)
  - [ ] `emitEvent()` → console.log + optional DB log

## Fase 1E: RLS & Permissions
- [ ] Ativar RLS em todas as tabelas
- [ ] Policies:
  - [ ] `academy_courses` — SELECT público
  - [ ] `academy_enrollments` — SELECT/INSERT próprio user
  - [ ] `academy_lessons` — SELECT se enrolled
  - [ ] `academy_progress` — SELECT/UPDATE próprio user

## Fase 1F: Deploy Preview
- [ ] Criar projeto Vercel
- [ ] Conectar ao repo
- [ ] Configurar env vars
- [ ] Deploy preview funcional

---

## Fase 2: Integrações Reais (FUTURO)
- [ ] Stripe Checkout Session
- [ ] Stripe Webhooks
- [ ] n8n workflow (enrollment + emails)
- [ ] Domínio custom (academy.medifranco.pt)
- [ ] Link no site principal

---

## Prioridade Atual

🔴 **Fase 1A-1B**: Setup + DB (hoje)
🟠 **Fase 1C-1D**: Auth + Frontend (próximas sessões)
🟡 **Fase 1E-1F**: RLS + Deploy

---

*Última atualização: 2026-01-14*
