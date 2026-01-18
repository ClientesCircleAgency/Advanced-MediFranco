# Ações Manuais Pendentes - MediFranco Academy

> Documento vivo: mantido sempre atualizado com ações que requerem intervenção manual

**Última atualização**: 2026-01-18

---

## 🔴 AÇÕES PENDENTES

### 1. Aplicar Migrations SQL em Produção (Supabase)

**Prioridade**: CRÍTICA  
**Motivo**: Correções da Fase 7.7-B requerem estas migrations para funcionar

#### Migrations a Aplicar:

1. **007_academy_sales.sql** (se não existir ainda)
   - Cria tabela `academy_sales`
   - Necessária para Admin → Vendas funcionar

2. **008_find_user_by_email.sql** (se não existir ainda)
   - Cria RPC `find_user_by_email()`
   - Usado em vendas e enrollments

3. **20260117_000001_admin_rpc_enrollments_sales.sql**
   - Cria RPCs: `admin_list_enrollments`, `admin_list_sales`, `admin_sales_analytics`
   - Necessários para Admin → Inscritos e Vendas funcionarem

4. **009_admin_create_enrollment_by_email.sql** ⬅️ **NOVA**
   - Cria RPC `admin_create_enrollment_by_email()`
   - Necessário para Admin → Inscrever utilizador por email

#### Como Aplicar:

**Opção A - Supabase Dashboard** (recomendado):
1. Ir ao [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecionar projeto MediFranco Academy (produção)
3. SQL Editor → New Query
4. Para cada migration:
   - Abrir o ficheiro em `academy/supabase/migrations/`
   - Copiar conteúdo completo
   - Colar no SQL Editor
   - Run
5. Verificar "Success" para cada uma

**Opção B - CLI Local**:
```bash
cd academy
supabase db push
```

#### Verificação:

Após aplicar, testar em produção:
- [ ] Admin → Vendas carrega sem erro
- [ ] Admin → Inscrever utilizador por email funciona
- [ ] Mensagem "Utilizador não existe" aparece corretamente

---

## ✅ AÇÕES COMPLETADAS

### Fase 7.7-B (2026-01-18)
- ✅ Corrigir `ProtectedAdminRoute.tsx` - Access Denied UI
- ✅ Corrigir `useCreateEnrollment` - usar RPC
- ✅ Criar migration 009
- ✅ Build sem erros
- ✅ Commit e push

---

## 📝 Histórico de Ações Manuais

### 2026-01-18 - Fase 7.7-B
- **Ação**: Aplicar migrations 007, 008, 20260117_000001, 009 em produção
- **Status**: ⏳ Pendente
- **Criado em**: 2026-01-18 16:05
