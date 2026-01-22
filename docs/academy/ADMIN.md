# Academy Admin Panel - Quick Start Guide

> **Purpose**: How to add admins, create courses, and manage enrollments

---

## 🔑 Adding an Admin

Admins are managed via the `academy_admins` table.

### Step 1: Get User ID

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user email
3. Copy their `user_id` (UUID)

### Step 2: Add to Admins Table

Run this SQL in **Supabase SQL Editor**:

```sql
INSERT INTO academy_admins (user_id)
VALUES ('PASTE_USER_ID_HERE');
```

**Example**:
```sql
INSERT INTO academy_admins (user_id)
VALUES ('a1b2c3d4-5678-9012-3456-789012345678');
```

### Step 3: Verify

```sql
SELECT u.email, a.created_at
FROM academy_admins a
INNER JOIN auth.users u ON u.id = a.user_id;
```

---

## 📚 Creating a Course (Admin Panel)

### Access Admin Panel

1. Login with admin account
2. Navigate to: `/admin/courses`

### Create Course

1. Click **"Novo Curso"**
2. Fill form:
   - **Título**: Ex: "Técnicas Avançadas de Dermatologia"
   - **Slug**: Auto-generated from title (ex: `tecnicas-avancadas-dermatologia`)
   - **Descrição**: Brief course overview
   - **URL da Imagem**: Course thumbnail (aspect ratio 16:9)
   - **Preço (€)**: Ex: 149.00
   - **Publicado**: Toggle ON to make visible in catalog
3. Click **"Guardar"**

### Add Modules

1. Go to course edit page
2. Click **"Novo Módulo"**
3. Fill:
   - **Título**: Ex: "Módulo 1: Introdução"
   - **Ordem**: 1, 2, 3... (controls display order)
4. Save

### Add Lessons

1. Go to module edit page
2. Click **"Nova Aula"**
3. Fill:
   - **Título**: Ex: "Aula 1.1 - Boas-vindas"
   - **Tipo de Conteúdo**: video / pdf / text
   - **URL** (for video/pdf): Embed URL or file link
   - **Texto** (for text): Rich text content
   - **Duração (min)**: Estimated time
   - **Ordem**: 1, 2, 3...
4. Save

---

## 💰 Creating Enrollments (Sales-First)

**IMPORTANTE**: O sistema usa arquitetura **Sales-First** (1 sale = 1 enrollment).

### Via Admin Panel (Recomendado)

1. Login como admin
2. Navegar para: `/admin/enrollments`
3. Selecionar curso
4. Inserir email do aluno
5. Click "Inscrever Utilizador"

**O que acontece automaticamente**:
- ✅ Cria `academy_sales` com `payment_status='paid'` e `provider='manual'`
- ✅ Cria `academy_enrollments` via trigger (FK para sale)
- ✅ Cria evento `sale.created` em `academy_events`
- ✅ Aluno recebe acesso imediato ao curso

### Via SQL (Avançado)

**NUNCA** inserir diretamente em `academy_enrollments`. Sempre criar via `academy_sales`:

```sql
-- ❌ ERRADO (não funciona, FK constraint)
INSERT INTO academy_enrollments (user_id, course_id) VALUES (...);

-- ✅ CORRETO (via sales)
INSERT INTO academy_sales (
  user_id,
  course_id,
  amount_cents,
  currency,
  payment_method,
  payment_status,
  provider,
  metadata,
  notes
) VALUES (
  'USER_ID_HERE',
  'COURSE_ID_HERE',
  14900, -- €149.00
  'EUR',
  'manual',
  'paid',
  'manual',
  '{"admin_created": true}'::jsonb,
  'Manual enrollment by admin'
);
-- Enrollment criado automaticamente via trigger!
```

### Verificar Enrollment

```sql
SELECT 
  s.id as sale_id,
  s.payment_status,
  s.provider,
  e.id as enrollment_id,
  c.title as course_title,
  u.email as student_email
FROM academy_sales s
JOIN academy_enrollments e ON e.sale_id = s.id
JOIN academy_courses c ON c.id = s.course_id
JOIN auth.users u ON u.id = s.user_id
ORDER BY s.created_at DESC
LIMIT 10;
```

### Apagar Enrollment

**IMPORTANTE**: Apagar via `academy_sales` (CASCADE delete remove enrollment):

```sql
-- ✅ CORRETO (apaga sale + enrollment + event via CASCADE)
DELETE FROM academy_sales WHERE id = 'SALE_ID_HERE';

-- ❌ ERRADO (viola FK constraint)
DELETE FROM academy_enrollments WHERE id = 'ENROLLMENT_ID_HERE';
```

---

## 📊 Viewing Sales & Analytics

### Access Sales Panel

1. Login como admin
2. Navegar para: `/admin/sales`

**Informação disponível**:
- Total revenue
- Sales por curso
- Payment status distribution
- Provider breakdown (manual vs stripe)

### SQL Queries

**Revenue Report**:
```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  provider,
  COUNT(*) as sales_count,
  SUM(amount_cents) / 100.0 as revenue_eur
FROM academy_sales
WHERE payment_status = 'paid'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), provider
ORDER BY date DESC;
```

**Top Courses**:
```sql
SELECT 
  c.title,
  COUNT(DISTINCT s.user_id) as unique_students,
  SUM(s.amount_cents) / 100.0 as total_revenue_eur
FROM academy_courses c
LEFT JOIN academy_sales s ON s.course_id = c.id
WHERE s.payment_status = 'paid'
GROUP BY c.id, c.title
ORDER BY total_revenue_eur DESC;
```

---

## 🎓 Student Progress

### How It Works

Students see their progress automatically:
- **0%**: Botão "Começar"
- **1-99%**: Botão "Continuar" (vai para próxima aula não completa)
- **100%**: Botão "Rever Curso"

Progress is calculated in real-time:
```
progress = (completed_lessons / total_lessons) * 100
```

### Debugging Progress Issues

If a student reports incorrect progress:

```sql
-- Check student's progress for a course
SELECT 
  c.title as course,
  COUNT(DISTINCT l.id) as total_lessons,
  COUNT(DISTINCT ap.lesson_id) FILTER (WHERE ap.completed_at IS NOT NULL) as completed,
  ROUND(
    COUNT(DISTINCT ap.lesson_id) FILTER (WHERE ap.completed_at IS NOT NULL)::numeric / 
    NULLIF(COUNT(DISTINCT l.id), 0) * 100, 
    2
  ) as progress_percentage
FROM academy_courses c
JOIN academy_modules m ON m.course_id = c.id
JOIN academy_lessons l ON l.module_id = m.id
LEFT JOIN academy_progress ap ON ap.lesson_id = l.id 
  AND ap.user_id = 'USER_ID_HERE'
WHERE c.id = 'COURSE_ID_HERE'
GROUP BY c.id, c.title;
```

---

## 🔒 Security Notes

1. **Admins** são verificados via `academy_admins` table
2. **Enrollments** só podem ser criados via sales (Sales-First)
3. **Progress** é privado por user (RLS)
4. **Events** são read-only para admins (debugging)
5. **Sales** podem ser apagadas por admins (CASCADE delete)
