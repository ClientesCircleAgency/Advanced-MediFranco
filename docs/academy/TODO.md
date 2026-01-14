# MediFranco Academy — TODO Checklist

> Checklist por fases para construção da plataforma Academy.

---

## Fase 0: Preparação ✅
- [x] Analisar repo do site principal
- [x] Documentar contexto (CONTEXT.md)
- [x] Criar checklist (este ficheiro)
- [ ] Obter credenciais Stripe (live ou test)
- [ ] Definir domínio/subdomain

---

## Fase 1: Base de Dados (Supabase)
- [ ] Criar tabelas com prefixo `academy_`:
  - [ ] `academy_courses` (id, title, slug, description, price_cents, image_url, is_published, created_at)
  - [ ] `academy_modules` (id, course_id, title, order, created_at)
  - [ ] `academy_lessons` (id, module_id, title, content_type, content_url, order, created_at)
  - [ ] `academy_enrollments` (id, user_id, course_id, stripe_session_id, enrolled_at)
  - [ ] `academy_progress` (id, user_id, lesson_id, completed_at)
- [ ] Criar migration SQL
- [ ] Aplicar migration no Supabase
- [ ] Seed com curso de teste

---

## Fase 2: Autenticação (Supabase Auth)
- [ ] Configurar Supabase Auth providers (email/password)
- [ ] Criar páginas:
  - [ ] `/login`
  - [ ] `/register`
  - [ ] `/forgot-password`
- [ ] Implementar AuthContext + hooks
- [ ] Proteger rotas privadas (dashboard, cursos)
- [ ] Testar fluxo completo

---

## Fase 3: Checkout (Stripe)
- [ ] Criar conta Stripe (se não existir)
- [ ] Obter keys (publishable + secret)
- [ ] Criar Edge Function `create-checkout-session`:
  - [ ] Recebe course_id + user_id
  - [ ] Cria Stripe Checkout Session
  - [ ] Retorna session URL
- [ ] Frontend: botão "Comprar" → redirect para Checkout
- [ ] Testar com Stripe Test Mode

---

## Fase 4: Webhook + n8n
- [ ] Criar workflow n8n:
  - [ ] Webhook trigger (recebe Stripe events)
  - [ ] Valida assinatura (webhook secret)
  - [ ] Se `checkout.session.completed`:
    - [ ] Extrai metadata (user_id, course_id)
    - [ ] Insere em `academy_enrollments`
    - [ ] Envia email de boas-vindas
- [ ] Configurar Stripe webhook endpoint (URL do n8n)
- [ ] Testar com eventos reais

---

## Fase 5: Row Level Security (RLS)
- [ ] Ativar RLS em todas as tabelas `academy_*`
- [ ] Policies:
  - [ ] `academy_courses`: SELECT para todos (público)
  - [ ] `academy_modules`: SELECT se enrolled no curso
  - [ ] `academy_lessons`: SELECT se enrolled no curso
  - [ ] `academy_enrollments`: SELECT/INSERT próprio user
  - [ ] `academy_progress`: SELECT/INSERT/UPDATE próprio user
- [ ] Testar com diferentes users

---

## Fase 6: Frontend Vite (App Academy)
- [ ] Criar repo novo `medifranco-academy`
- [ ] Setup: Vite + React + TS + Tailwind + shadcn
- [ ] Estrutura de pastas:
  ```
  src/
  ├── components/
  ├── hooks/
  ├── pages/
  │   ├── Home.tsx (catálogo)
  │   ├── Course.tsx (detalhe)
  │   ├── Dashboard.tsx (meus cursos)
  │   ├── Lesson.tsx (player)
  │   ├── Login.tsx
  │   └── Register.tsx
  ├── integrations/
  │   └── supabase/
  └── App.tsx
  ```
- [ ] Implementar páginas
- [ ] Player de vídeo (YouTube embed ou Vimeo)
- [ ] Tracking de progresso
- [ ] Testar fluxo completo

---

## Fase 7: Deploy
- [ ] Criar projeto Vercel para Academy
- [ ] Configurar variáveis de ambiente
- [ ] Conectar ao repo GitHub
- [ ] Deploy de teste
- [ ] Configurar domínio custom (academy.medifranco.pt)
- [ ] SSL/HTTPS automático

---

## Fase 8: Polish & Launch
- [ ] Adicionar link "Academy" ao site principal (Header)
- [ ] SEO: meta tags, OG images
- [ ] Testes E2E do fluxo compra → acesso
- [ ] Documentar para admin (como criar cursos)
- [ ] Go live! 🚀

---

## Notas Adicionais

### Prioridade
1. 🔴 Fase 1-2: Fundação (DB + Auth)
2. 🟠 Fase 3-4: Monetização (Stripe + Webhook)
3. 🟡 Fase 5-6: Produto (RLS + Frontend)
4. 🟢 Fase 7-8: Launch (Deploy + Polish)

### Dependências Externas
- ⏳ Stripe account + keys
- ⏳ n8n instance URL
- ⏳ Conteúdo dos cursos (vídeos, textos)

---

*Última atualização: 2026-01-14*
