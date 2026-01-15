-- Migration: Fix Progress Calculation + Add Admin Panel
-- Created: 2026-01-15
-- Purpose: 
--   1. Add robust SQL function for progress calculation (no X/0 bugs)
--   2. Add academy_admins table for content management
--   3. Add RLS policies for admin CRUD operations

-- ============================================================
-- PART A: Progress Calculation Fix
-- ============================================================

-- Function: Get current user's course progress (uses auth.uid() internally)
CREATE OR REPLACE FUNCTION get_my_course_progress()
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  course_slug TEXT,
  course_image_url TEXT,
  total_lessons BIGINT,
  completed_lessons BIGINT,
  progress_percentage DECIMAL
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as course_id,
    c.title as course_title,
    c.slug as course_slug,
    c.image_url as course_image_url,
    COUNT(DISTINCT l.id) as total_lessons,
    COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN l.id END) as completed_lessons,
    CASE 
      WHEN COUNT(DISTINCT l.id) > 0 
      THEN ROUND((COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN l.id END)::DECIMAL / COUNT(DISTINCT l.id)) * 100, 2)
      ELSE 0
    END as progress_percentage
  FROM academy_enrollments e
  INNER JOIN academy_courses c ON c.id = e.course_id
  LEFT JOIN academy_modules m ON m.course_id = c.id
  LEFT JOIN academy_lessons l ON l.module_id = m.id
  LEFT JOIN academy_progress p ON p.lesson_id = l.id AND p.user_id = auth.uid()
  WHERE 
    e.user_id = auth.uid()
    AND c.published = true
  GROUP BY c.id, c.title, c.slug, c.image_url
  ORDER BY c.created_at DESC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_my_course_progress() TO authenticated;

COMMENT ON FUNCTION get_my_course_progress() IS 'Returns progress stats for all enrolled courses of the current user. Uses auth.uid() internally for security.';

-- ============================================================
-- PART B: Admin Panel Setup
-- ============================================================

-- Table: academy_admins (whitelist for content managers)
CREATE TABLE IF NOT EXISTS academy_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS on academy_admins
ALTER TABLE academy_admins ENABLE ROW LEVEL SECURITY;

-- Only admins can see the admin list
CREATE POLICY "academy_admins_select" ON academy_admins
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM academy_admins WHERE user_id = auth.uid()
    )
  );

-- Helper Function: Check if user is academy admin
CREATE OR REPLACE FUNCTION is_academy_admin(check_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM academy_admins WHERE user_id = check_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION is_academy_admin(UUID) TO authenticated;

COMMENT ON FUNCTION is_academy_admin(UUID) IS 'Check if a user is an Academy admin. Used by RLS policies.';

-- Convenience function: Check if current user is admin (no params)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN is_academy_admin(auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;

-- Optional: Add content_text column for text-based lessons
ALTER TABLE academy_lessons 
ADD COLUMN IF NOT EXISTS content_text TEXT;

COMMENT ON COLUMN academy_lessons.content_text IS 'Rich text content for text-based lessons (alternative to external URL). Used when content_type = ''text''.';

-- ============================================================
-- PART C: Admin RLS Policies (Separate INSERT/UPDATE/DELETE)
-- ============================================================

-- academy_courses: Admin INSERT
CREATE POLICY "academy_courses_admin_insert" ON academy_courses
  FOR INSERT
  WITH CHECK (is_academy_admin(auth.uid()));

-- academy_courses: Admin UPDATE
CREATE POLICY "academy_courses_admin_update" ON academy_courses
  FOR UPDATE
  USING (is_academy_admin(auth.uid()))
  WITH CHECK (is_academy_admin(auth.uid()));

-- academy_courses: Admin DELETE
CREATE POLICY "academy_courses_admin_delete" ON academy_courses
  FOR DELETE
  USING (is_academy_admin(auth.uid()));

-- academy_modules: Admin INSERT
CREATE POLICY "academy_modules_admin_insert" ON academy_modules
  FOR INSERT
  WITH CHECK (is_academy_admin(auth.uid()));

-- academy_modules: Admin UPDATE
CREATE POLICY "academy_modules_admin_update" ON academy_modules
  FOR UPDATE
  USING (is_academy_admin(auth.uid()))
  WITH CHECK (is_academy_admin(auth.uid()));

-- academy_modules: Admin DELETE
CREATE POLICY "academy_modules_admin_delete" ON academy_modules
  FOR DELETE
  USING (is_academy_admin(auth.uid()));

-- academy_lessons: Admin INSERT
CREATE POLICY "academy_lessons_admin_insert" ON academy_lessons
  FOR INSERT
  WITH CHECK (is_academy_admin(auth.uid()));

-- academy_lessons: Admin UPDATE
CREATE POLICY "academy_lessons_admin_update" ON academy_lessons
  FOR UPDATE
  USING (is_academy_admin(auth.uid()))
  WITH CHECK (is_academy_admin(auth.uid()));

-- academy_lessons: Admin DELETE
CREATE POLICY "academy_lessons_admin_delete" ON academy_lessons
  FOR DELETE
  USING (is_academy_admin(auth.uid()));

-- ============================================================
-- Verification Queries (for testing)
-- ============================================================

-- To add an admin (replace with actual user_id from auth.users):
-- INSERT INTO academy_admins (user_id) VALUES ('USER_UUID_HERE');

-- To test progress function:
-- SELECT * FROM get_my_course_progress();

-- To check if current user is admin:
-- SELECT is_current_user_admin();
