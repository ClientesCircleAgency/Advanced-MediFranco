-- Migration: Fix get_my_course_progress to show courses even without lessons
-- Created: 2026-01-19
-- Purpose: Ensure enrolled courses appear in student dashboard even if they have no modules/lessons yet

-- ============================================================
-- MODIFY: get_my_course_progress
-- Now shows courses even if they have zero lessons
-- ============================================================

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
    COALESCE(COUNT(DISTINCT l.id) FILTER (WHERE l.id IS NOT NULL), 0) as total_lessons,
    COALESCE(COUNT(DISTINCT CASE WHEN p.completed_at IS NOT NULL THEN l.id END) FILTER (WHERE l.id IS NOT NULL), 0) as completed_lessons,
    CASE 
      WHEN COUNT(DISTINCT l.id) FILTER (WHERE l.id IS NOT NULL) > 0 
      THEN ROUND((COUNT(DISTINCT CASE WHEN p.completed_at IS NOT NULL THEN l.id END)::DECIMAL / COUNT(DISTINCT l.id)) * 100, 2)
      ELSE 0
    END as progress_percentage
  FROM academy_enrollments e
  INNER JOIN academy_courses c ON c.id = e.course_id
  LEFT JOIN academy_modules m ON m.course_id = c.id
  LEFT JOIN academy_lessons l ON l.module_id = m.id
  LEFT JOIN academy_progress p ON p.lesson_id = l.id AND p.user_id = auth.uid()
  WHERE 
    e.user_id = auth.uid()
    AND c.is_published = true
  GROUP BY c.id, c.title, c.slug, c.image_url
  ORDER BY e.enrolled_at DESC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_my_course_progress() TO authenticated;

COMMENT ON FUNCTION get_my_course_progress() IS 'Returns progress stats for all enrolled courses of the current user. Shows courses even if they have no lessons yet. Uses auth.uid() internally for security.';
