# MediFranco Academy — RLS Policies

> Row Level Security configuration for Academy tables.

---

## Tabela de Políticas

| Tabela | Operação | Política | Condição |
|--------|----------|----------|----------|
| `academy_courses` | SELECT | Público | `is_published = true` |
| `academy_modules` | SELECT | Enrolled | User tem enrollment no course |
| `academy_lessons` | SELECT | Enrolled | User tem enrollment no course do módulo |
| `academy_enrollments` | SELECT | Own | `user_id = auth.uid()` |
| `academy_enrollments` | INSERT | Own | `user_id = auth.uid()` (temp para testes) |
| `academy_progress` | SELECT | Own | `user_id = auth.uid()` |
| `academy_progress` | INSERT | Own + Enrolled | User tem enrollment no course da aula |
| `academy_progress` | UPDATE | Own | `user_id = auth.uid()` |
| `academy_integration_logs` | * | None | Apenas service role |

---

## Como Testar

### 1. Encontrar IDs

```sql
-- User IDs
SELECT id, email FROM auth.users;

-- Course IDs
SELECT id, title, slug FROM academy_courses WHERE is_published = true;
```

### 2. Grant Access Manualmente

```sql
-- Substituir com UUIDs reais
INSERT INTO academy_enrollments (user_id, course_id)
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- user_id
  'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'   -- course_id
);
```

### 3. Verificar Enrollment

```sql
SELECT e.*, c.title as course_title
FROM academy_enrollments e
JOIN academy_courses c ON c.id = e.course_id
WHERE e.user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

### 4. Revogar Acesso

```sql
DELETE FROM academy_enrollments
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  AND course_id = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy';
```

---

## Notas de Segurança

1. **Courses** são públicos (catálogo visível)
2. **Modules/Lessons** requerem enrollment ativo
3. **Enrollments** são privados por user
4. **Progress** só pode ser escrito se enrolled
5. **Logs** só acessíveis via service role

---

## Fase 2 (Futuro)

Quando integrar Stripe:
- Remover `academy_enrollments_user_insert` policy
- Criar enrollment apenas via webhook (service role)
