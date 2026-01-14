# MediFranco Academy — Context Document

> **Documento vivo** para coordenar a construção da plataforma "MediFranco Academy".

---

## 1. Visão Geral

**MediFranco Academy** é uma plataforma de formação online separada do site principal da clínica MediFranco. Permite a profissionais de saúde adquirir cursos/formações com pagamento via Stripe e acesso a conteúdo protegido.

### Arquitetura
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Site Principal │      │ Academy (Nova)  │      │     n8n         │
│  medifranco.pt  │      │ academy.medi... │      │  (Automações)   │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────┬───────────┴────────────────────────┘
                      │
              ┌───────▼───────┐
              │   Supabase    │
              │  (1 projeto)  │
              │ - public.*    │◄── Site principal (atual)
              │ - academy.*   │◄── Academy (novo schema)
              └───────────────┘
```

---

## 2. Decisões Arquiteturais

| Decisão | Justificação |
|---------|-------------|
| **Repo separado** | Academy é app independente; evita acoplar código de cursos ao site institucional |
| **Mesmo Supabase** | Reutiliza infraestrutura; facilita cross-reference (ex: profissionais) |
| **Schema isolado** | Todas as tabelas Academy usam prefixo `academy_*` ou schema dedicado |
| **Stripe Checkout** | Pagamentos via Stripe Checkout Session (hosted page) — mais simples e PCI-compliant |
| **Webhooks → n8n** | Stripe envia eventos para n8n que processa e atualiza Supabase |
| **Sem contas no site principal** | Site institucional continua sem login público |

---

## 3. Requisitos Funcionais

### 3.1 Público (Visitante)
- [ ] Ver catálogo de cursos (título, descrição, preço, imagem)
- [ ] Página de detalhe do curso
- [ ] Botão "Comprar" → redireciona para Stripe Checkout
- [ ] Após pagamento, recebe link de acesso por email (via n8n)

### 3.2 Aluno (Autenticado)
- [ ] Login/Registo via Supabase Auth (email + password)
- [ ] Dashboard com cursos adquiridos
- [ ] Acesso ao conteúdo (vídeos, PDFs, módulos)
- [ ] Progresso/conclusão de módulos
- [ ] Certificado ao concluir (PDF gerado)

### 3.3 Admin
- [ ] Criar/editar/apagar cursos
- [ ] Ver inscrições e pagamentos
- [ ] Gerir conteúdo dos cursos (módulos, lições)

---

## 4. Stack Técnica

| Componente | Tecnologia |
|------------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Pagamentos | Stripe Checkout + Webhooks |
| Automações | n8n (self-hosted ou cloud) |
| Deploy | Vercel |
| Vídeos | YouTube Unlisted / Vimeo Private / Supabase Storage |

---

## 5. Integrações

### 5.1 Supabase
- **Projeto existente**: `ihkjadztuopcvvmmodpp`
- **URL**: `https://ihkjadztuopcvvmmodpp.supabase.co`
- **Novas tabelas** (schema `public` com prefixo `academy_`):
  - `academy_courses`
  - `academy_modules`
  - `academy_lessons`
  - `academy_enrollments`
  - `academy_progress`

### 5.2 Stripe
- **Modo**: Checkout Session (hosted)
- **Webhook endpoint**: Edge Function ou endpoint n8n
- **Eventos a escutar**:
  - `checkout.session.completed` → criar enrollment
  - `payment_intent.payment_failed` → log/notificação

### 5.3 n8n
- Recebe webhooks do Stripe
- Atualiza Supabase (insere enrollment)
- Envia email de boas-vindas ao aluno
- Opcional: notifica admin via Slack/Telegram

---

## 6. Limites e Regras

> ⚠️ **Estas regras são invioláveis**

1. **Site principal inalterado** — Não modificar comportamento do site institucional (apenas doc + link opcional)
2. **Sem autenticação no site principal** — Apenas admin tem login
3. **Academy 100% separada** — Código, deploy, e auth próprios
4. **Stripe só via webhooks** — Não armazenar dados de cartão; usar Checkout
5. **RLS obrigatório** — Todas as tabelas Academy com Row Level Security ativo
6. **Sem dados sensíveis em client** — Service key nunca no frontend

---

## 7. Ambiente e Variáveis

### Site Principal (atual)
```env
VITE_SUPABASE_URL=https://ihkjadztuopcvvmmodpp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### Academy (a criar)
```env
VITE_SUPABASE_URL=https://ihkjadztuopcvvmmodpp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
# Em Edge Functions / n8n (server-side)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 8. Referências

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Stripe Checkout Docs](https://stripe.com/docs/checkout/quickstart)
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.webhook/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

## 9. Informação em Falta

> Listar aqui qualquer info necessária que ainda não foi fornecida

- [ ] Conta Stripe (live keys)
- [ ] Lista inicial de cursos/preços
- [ ] Definir provider de vídeo (YouTube unlisted, Vimeo, ou Supabase Storage)
- [ ] Domínio para Academy (academy.medifranco.pt ?)
- [ ] n8n: instância existente ou criar nova?

---

*Última atualização: 2026-01-14*
