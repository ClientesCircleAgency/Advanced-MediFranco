-- MediFranco Academy Database Schema
-- Phase 1B: Mock-first approach with nullable Stripe columns
-- Migration created: 2026-01-14

-- ============================================
-- TABLE: academy_courses
-- ============================================
CREATE TABLE IF NOT EXISTS academy_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_cents INTEGER DEFAULT 0,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster slug lookups
CREATE INDEX idx_academy_courses_slug ON academy_courses(slug);
CREATE INDEX idx_academy_courses_published ON academy_courses(is_published) WHERE is_published = true;

-- ============================================
-- TABLE: academy_modules
-- ============================================
CREATE TABLE IF NOT EXISTS academy_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster course module lookups
CREATE INDEX idx_academy_modules_course ON academy_modules(course_id, "order");

-- ============================================
-- TABLE: academy_lessons
-- ============================================
CREATE TABLE IF NOT EXISTS academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'pdf', 'text')),
  content_url TEXT,
  "order" INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster module lesson lookups
CREATE INDEX idx_academy_lessons_module ON academy_lessons(module_id, "order");

-- ============================================
-- TABLE: academy_enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS academy_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users
  course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
  stripe_session_id TEXT, -- Nullable for mock checkouts
  stripe_customer_id TEXT, -- Nullable, for future use
  stripe_payment_intent_id TEXT, -- Nullable, for future use
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- Nullable, for subscription-based courses in future
  UNIQUE(user_id, course_id)
);

-- Indexes for enrollment queries
CREATE INDEX idx_academy_enrollments_user ON academy_enrollments(user_id);
CREATE INDEX idx_academy_enrollments_course ON academy_enrollments(course_id);
CREATE INDEX idx_academy_enrollments_stripe_session ON academy_enrollments(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- ============================================
-- TABLE: academy_progress
-- ============================================
CREATE TABLE IF NOT EXISTS academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users
  lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Index for user progress queries
CREATE INDEX idx_academy_progress_user ON academy_progress(user_id);
CREATE INDEX idx_academy_progress_lesson ON academy_progress(lesson_id);

-- ============================================
-- TABLE: academy_integration_logs (for stubs)
-- ============================================
CREATE TABLE IF NOT EXISTS academy_integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for event type filtering
CREATE INDEX idx_academy_logs_event ON academy_integration_logs(event_type);
CREATE INDEX idx_academy_logs_created ON academy_integration_logs(created_at DESC);

-- ============================================
-- SEED DATA: Dummy Courses with CTEs
-- ============================================

-- Insert courses and capture IDs
WITH inserted_courses AS (
  INSERT INTO academy_courses (title, slug, description, price_cents, image_url, is_published)
  VALUES 
    (
      'Curso Exemplo: Fundamentos de Saúde',
      'fundamentos-saude',
      'Um curso completo sobre os fundamentos essenciais da saúde e bem-estar. Aprenda conceitos básicos de anatomia, fisiologia e prevenção.',
      9900,
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      true
    ),
    (
      'Curso Exemplo: Técnicas Avançadas',
      'tecnicas-avancadas',
      'Aprofunde os seus conhecimentos com técnicas avançadas e práticas especializadas. Ideal para profissionais que querem expandir competências.',
      14900,
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
      true
    )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id, slug
),
-- Insert modules for course 1
course1_modules AS (
  INSERT INTO academy_modules (course_id, title, "order")
  SELECT id, 'Introdução ao Curso', 1 FROM inserted_courses WHERE slug = 'fundamentos-saude'
  UNION ALL
  SELECT id, 'Conceitos Básicos', 2 FROM inserted_courses WHERE slug = 'fundamentos-saude'
  RETURNING id, title, "order"
),
-- Insert modules for course 2
course2_modules AS (
  INSERT INTO academy_modules (course_id, title, "order")
  SELECT id, 'Revisão de Fundamentos', 1 FROM inserted_courses WHERE slug = 'tecnicas-avancadas'
  UNION ALL
  SELECT id, 'Técnicas Especializadas', 2 FROM inserted_courses WHERE slug = 'tecnicas-avancadas'
  RETURNING id, title, "order"
),
-- Insert lessons for course 1, module 1
c1m1_lessons AS (
  INSERT INTO academy_lessons (module_id, title, content_type, content_url, "order", duration_minutes)
  SELECT id, 'Boas-vindas', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1, 5
  FROM course1_modules WHERE "order" = 1
  UNION ALL
  SELECT id, 'Objetivos do Curso', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2, 8
  FROM course1_modules WHERE "order" = 1
  RETURNING id
),
-- Insert lessons for course 1, module 2
c1m2_lessons AS (
  INSERT INTO academy_lessons (module_id, title, content_type, content_url, "order", duration_minutes)
  SELECT id, 'Anatomia Básica', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1, 15
  FROM course1_modules WHERE "order" = 2
  UNION ALL
  SELECT id, 'Fisiologia Essencial', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2, 20
  FROM course1_modules WHERE "order" = 2
  UNION ALL
  SELECT id, 'Material de Apoio', 'pdf', '/docs/material-apoio.pdf', 3, 0
  FROM course1_modules WHERE "order" = 2
  RETURNING id
),
-- Insert lessons for course 2, module 1
c2m1_lessons AS (
  INSERT INTO academy_lessons (module_id, title, content_type, content_url, "order", duration_minutes)
  SELECT id, 'Resumo do Curso Anterior', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1, 10
  FROM course2_modules WHERE "order" = 1
  RETURNING id
),
-- Insert lessons for course 2, module 2
c2m2_lessons AS (
  INSERT INTO academy_lessons (module_id, title, content_type, content_url, "order", duration_minutes)
  SELECT id, 'Técnica A', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1, 25
  FROM course2_modules WHERE "order" = 2
  UNION ALL
  SELECT id, 'Técnica B', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2, 30
  FROM course2_modules WHERE "order" = 2
  RETURNING id
)
-- Final select to show counts
SELECT 
  (SELECT COUNT(*) FROM inserted_courses) as courses_created,
  (SELECT COUNT(*) FROM course1_modules) + (SELECT COUNT(*) FROM course2_modules) as modules_created,
  (SELECT COUNT(*) FROM c1m1_lessons) + (SELECT COUNT(*) FROM c1m2_lessons) + 
  (SELECT COUNT(*) FROM c2m1_lessons) + (SELECT COUNT(*) FROM c2m2_lessons) as lessons_created;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created: 6
-- Courses seeded: 2
-- Modules seeded: 4
-- Lessons seeded: 9
