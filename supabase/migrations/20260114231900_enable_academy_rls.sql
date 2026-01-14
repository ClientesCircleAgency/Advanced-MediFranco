-- MediFranco Academy RLS Policies
-- Phase 2A: Row Level Security Implementation
-- Created: 2026-01-14

-- ============================================
-- ENABLE RLS ON ALL ACADEMY TABLES
-- ============================================

ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_integration_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- academy_courses: Public read for published courses
-- ============================================

-- Anyone can read published courses (including anonymous)
CREATE POLICY "academy_courses_public_read" ON academy_courses
  FOR SELECT
  USING (is_published = true);

-- Only service role can insert/update/delete (admin operations)
-- (no policy = denied by default)

-- ============================================
-- academy_modules: Read only if enrolled in course
-- ============================================

CREATE POLICY "academy_modules_enrolled_read" ON academy_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM academy_enrollments
      WHERE academy_enrollments.course_id = academy_modules.course_id
        AND academy_enrollments.user_id = auth.uid()
    )
  );

-- ============================================
-- academy_lessons: Read only if enrolled in course
-- ============================================

CREATE POLICY "academy_lessons_enrolled_read" ON academy_lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM academy_enrollments e
      JOIN academy_modules m ON m.course_id = e.course_id
      WHERE m.id = academy_lessons.module_id
        AND e.user_id = auth.uid()
    )
  );

-- ============================================
-- academy_enrollments: User reads own enrollments
-- ============================================

-- User can read their own enrollments
CREATE POLICY "academy_enrollments_user_read" ON academy_enrollments
  FOR SELECT
  USING (user_id = auth.uid());

-- For testing: Allow authenticated users to insert their own enrollments
-- In production, this would be restricted to service role only (after Stripe webhook)
CREATE POLICY "academy_enrollments_user_insert" ON academy_enrollments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- No update/delete allowed from client (only service role)

-- ============================================
-- academy_progress: User reads/writes own progress
-- ============================================

-- User can read their own progress
CREATE POLICY "academy_progress_user_read" ON academy_progress
  FOR SELECT
  USING (user_id = auth.uid());

-- User can insert their own progress (mark lesson complete)
CREATE POLICY "academy_progress_user_insert" ON academy_progress
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      -- Must be enrolled in the course containing this lesson
      SELECT 1 FROM academy_lessons l
      JOIN academy_modules m ON m.id = l.module_id
      JOIN academy_enrollments e ON e.course_id = m.course_id
      WHERE l.id = academy_progress.lesson_id
        AND e.user_id = auth.uid()
    )
  );

-- User can update their own progress (if needed in future)
CREATE POLICY "academy_progress_user_update" ON academy_progress
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- academy_integration_logs: Service role only
-- ============================================

-- No policies = only service role can access (for security)
-- Logs are written by stubs/webhooks, not directly by users

-- ============================================
-- GRANT ACCESS HELPER QUERIES
-- ============================================

-- To grant access to a user (run as service role):
-- INSERT INTO academy_enrollments (user_id, course_id)
-- VALUES ('USER_UUID_HERE', 'COURSE_UUID_HERE');

-- To find user UUIDs:
-- SELECT id, email FROM auth.users;

-- To find course UUIDs:
-- SELECT id, title, slug FROM academy_courses;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- RLS enabled on: 6 tables
-- Policies created: 8
