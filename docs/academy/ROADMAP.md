# MediFranco Academy - Roadmap

**Última atualização**: 2026-01-22  
**Estado Atual**: Phases 8.0, 9.0-1, 9.0-2 completas

---

## ✅ Completo

### Phase 8.0: Real Student Progress (2026-01-20)
- Cálculo real de progresso (completed / total lessons)
- Botões inteligentes: Começar / Continuar / Rever Curso
- Auto-sync (dashboard atualiza sem reload)

### Phase 9.0-1: Sales + Events System (2026-01-21)
- `payment_status` e `provider` em sales
- Tabela `academy_events` com trigger automático
- Evento `sale.created` para n8n

### Phase 9.0-2: Webhook Contract (2026-01-22)
- Campos Stripe top-level no payload
- Sistema pronto para Stripe e n8n

---

## 🚀 Próximos Passos

### Curto Prazo (1-2 semanas)

#### 1. Stripe Checkout Integration
**Prioridade**: Alta  
**Pré-requisitos**: ✅ Completos (Phase 9.0-1 + 9.0-2)

**Tarefas**:
- [ ] Criar Stripe account e obter API keys
- [ ] Criar Stripe Checkout Session no frontend
- [ ] Webhook `/api/webhooks/stripe` para `checkout.session.completed`
- [ ] Criar sale com `provider='stripe'` e metadata preenchida
- [ ] Testar fluxo completo: checkout → webhook → sale → enrollment → event
- [ ] Validar em produção

**Estimativa**: 1-2 dias

---

#### 2. n8n Email Automation
**Prioridade**: Alta  
**Pré-requisitos**: ✅ Completos (academy_events pronto)

**Tarefas**:
- [ ] Setup n8n instance (cloud ou self-hosted)
- [ ] Criar workflow com polling em `academy_events`
- [ ] Email boas-vindas ao processar `sale.created`
- [ ] Email conclusão de curso (quando `progress = 100%`)
- [ ] Marcar eventos como `processed_at` após envio
- [ ] Testar em staging

**Estimativa**: 1 dia

---

### Médio Prazo (1 mês)

#### 3. Refund Handling
**Prioridade**: Média

**Tarefas**:
- [ ] UI admin para processar refunds
- [ ] Atualizar `payment_status='refunded'` em sales
- [ ] Remover acesso (soft-delete, manter audit trail)
- [ ] Criar evento `sale.refunded` para n8n
- [ ] Email automático de confirmação de refund

**Estimativa**: 2-3 dias

---

#### 4. Corrigir Enrollment Count
**Prioridade**: Baixa (não afeta funcionalidade)

**Tarefas**:
- [ ] Atualizar query em course cards
- [ ] Usar `COUNT(DISTINCT user_id)` em vez de `COUNT(*)`
- [ ] Validar analytics corretas

**Estimativa**: 1 hora

---

### Longo Prazo (3+ meses)

#### 5. Certificados PDF
**Prioridade**: Média

**Tarefas**:
- [ ] Biblioteca PDF generation (ex: jsPDF)
- [ ] Template de certificado
- [ ] Gerar quando `progress = 100%`
- [ ] Armazenar em Supabase Storage
- [ ] Email automático via n8n com link

**Estimativa**: 3-4 dias

---

#### 6. Subscription Model
**Prioridade**: Baixa (depende de modelo de negócio)

**Tarefas**:
- [ ] Stripe Subscriptions setup
- [ ] Schema change: `subscription_id` em sales
- [ ] Uma subscription → múltiplos enrollments
- [ ] Webhook `customer.subscription.deleted` → revogar acesso
- [ ] UI admin para gerir subscriptions

**Estimativa**: 1 semana

---

#### 7. Advanced Analytics
**Prioridade**: Baixa

**Tarefas**:
- [ ] Dashboard analytics para admin
- [ ] Completion rates por curso
- [ ] Revenue forecasting
- [ ] Student retention metrics
- [ ] Drop-off points analysis

**Estimativa**: 1 semana

---

## 🔮 Ideias Futuras (Não Priorizadas)

- Bulk enrollment via CSV upload
- Gift purchases (buyer ≠ beneficiary)
- Course bundles (múltiplos cursos numa venda)
- Affiliate system
- Student forums/community
- Live sessions integration
- Mobile app (React Native)

---

## 📊 Critérios de Priorização

**Alta Prioridade**:
- Blocker para lançamento público
- Impacto direto em revenue
- Pré-requisitos completos

**Média Prioridade**:
- Melhora UX significativamente
- Reduz trabalho manual admin
- Pedido recorrente de utilizadores

**Baixa Prioridade**:
- Nice-to-have
- Não afeta funcionalidade core
- Pode esperar próxima iteração

---

## 🎯 Objetivo Próximos 30 Dias

1. ✅ Stripe integration completa
2. ✅ n8n automation funcional
3. ✅ Primeiro pagamento online processado
4. ✅ Emails automáticos a funcionar

**Resultado**: Sistema 100% autónomo para vendas online
