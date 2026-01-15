# Academy Admin Panel - Quick Start Guide

> **Purpose**: How to add admins and create courses via the Admin Panel

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

## 🎯 Complete Example (SQL)

If you prefer SQL for bulk creation:

```sql
-- 1. Create Course
WITH new_course AS (
  INSERT INTO academy_courses (title, slug, description, image_url, price_cents, published)
  VALUES (
    'Técnicas Avançadas de Dermatologia',
    'tecnicas-avancadas-dermatologia',
    'Aprenda técnicas modernas de dermatologia estética.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
    14900, -- €149.00
    true
  )
  RETURNING id
),

-- 2. Create Module
new_module AS (
  INSERT INTO academy_modules (course_id, title, order_num)
  SELECT id, 'Módulo 1: Fundamentos', 1
  FROM new_course
  RETURNING id
)

-- 3. Create Lessons
INSERT INTO academy_lessons (module_id, title, content_type, content_url, duration_minutes, order_num)
SELECT 
  nm.id,
  'Aula 1.1 - Introdução ao Curso',
  'video',
  'https://youtube.com/embed/VIDEO_ID',
  10,
  1
FROM new_module nm;
```

---

## 🔒 RLS Security

### What Admins Can Do

✅ **INSERT** courses, modules, lessons  
✅ **UPDATE** courses, modules, lessons  
✅ **DELETE** courses, modules, lessons  
✅ **SELECT** all courses (published + draft)

### What Students Can Do

✅ **SELECT** published courses  
✅ **SELECT** modules/lessons (if enrolled via RLS)  
❌ **Cannot** create/edit/delete content

### RLS Policies

```sql
-- Admin can write
is_academy_admin(auth.uid()) = true

-- Students can read (if enrolled)
EXISTS (SELECT 1 FROM academy_enrollments WHERE user_id = auth.uid())
```

---

## 📝 Best Practices

### Content Organization

- **Modules**: Group related lessons (ex: "Módulo 1: Fundamentos")
- **Lessons**: Keep 5-15 min each for better retention
- **Order**: Use increments of 10 (10, 20, 30) to insert lessons later

### Images

- **Course thumbnail**: 16:9 ratio, min 1280x720px
- **Use Unsplash** for free medical/education images
- **Optimize**: Keep under 500KB

### Video Hosting

- **YouTube**: Unlisted videos, use embed URL
- **Vimeo**: Private videos with password
- **Self-hosted**: Use CDN (Cloudflare, Bunny)

### Pricing

- **Format**: Store as cents (€149.00 = 14900)
- **Psychology**: End with .00 (ex: 149.00, not 149.99)

---

## 🚨 Common Issues

### "Access Denied" when creating course

**Cause**: User not in `academy_admins` table.

**Fix**: Add user via SQL (see "Adding an Admin").

### Course not showing in catalog

**Cause**: `published = false`

**Fix**: Edit course → Toggle "Publicado" ON.

### Lessons showing wrong order

**Cause**: `order_num` not set correctly.

**Fix**: Edit lessons → Set order: 1, 2, 3...

---

## 📊 Useful Queries

### List All Courses with Lesson Count

```sql
SELECT 
  c.title,
  c.published,
  COUNT(l.id) as total_lessons
FROM academy_courses c
LEFT JOIN academy_modules m ON m.course_id = c.id
LEFT JOIN academy_lessons l ON l.module_id = m.id
GROUP BY c.id, c.title, c.published
ORDER BY c.created_at DESC;
```

### Find Orphan Modules (no lessons)

```sql
SELECT m.title, m.course_id
FROM academy_modules m
LEFT JOIN academy_lessons l ON l.module_id = m.id
WHERE l.id IS NULL;
```

### Duplicate Course (clone)

```sql
-- Manual process: Copy course → Copy modules → Copy lessons
-- (Full SQL clone script available on request)
```

---

## Next Steps

1. ✅ Add yourself as admin
2. ✅ Create first course
3. ✅ Add modules and lessons
4. ✅ Publish course
5. 🎓 Enroll test user and verify access
