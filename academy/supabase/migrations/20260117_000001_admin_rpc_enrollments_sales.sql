-- Migration: Admin RPCs for Enrollments and Sales
-- Created: 2026-01-17
-- Purpose: 
--   Fix AdminEnrollments and AdminSales by using SECURITY DEFINER RPCs
--   instead of client-side joins with auth.users (which fail due to schema isolation)

-- ============================================================
-- RPC 1: admin_list_enrollments
-- Lists enrollments for a course with user email and progress
-- ============================================================

CREATE OR REPLACE FUNCTION admin_list_enrollments(p_course_id UUID)
RETURNS TABLE (
  enrollment_id UUID,
  user_id UUID,
  user_email TEXT,
  created_at TIMESTAMPTZ,
  total_lessons BIGINT,
  completed_lessons BIGINT,
  progress_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security: Only admins can execute this
  IF NOT is_academy_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  RETURN QUERY
  WITH lesson_totals AS (
    -- Count total lessons in this course
    SELECT
      c.id AS course_id,
      COUNT(DISTINCT l.id) AS total_lessons
    FROM academy_courses c
    LEFT JOIN academy_modules m ON m.course_id = c.id
    LEFT JOIN academy_lessons l ON l.module_id = m.id
    WHERE c.id = p_course_id
    GROUP BY c.id
  ),
  completed_by_user AS (
    -- Count completed lessons per user for this course
    SELECT
      e.user_id,
      COUNT(DISTINCT p.lesson_id) AS completed_lessons
    FROM academy_enrollments e
    JOIN academy_modules m ON m.course_id = e.course_id
    JOIN academy_lessons l ON l.module_id = m.id
    LEFT JOIN academy_progress p
      ON p.user_id = e.user_id
     AND p.lesson_id = l.id
    WHERE e.course_id = p_course_id
    GROUP BY e.user_id
  )
  SELECT
    e.id AS enrollment_id,
    e.user_id,
    u.email AS user_email,
    e.enrolled_at AS created_at,
    COALESCE(t.total_lessons, 0) AS total_lessons,
    COALESCE(cu.completed_lessons, 0) AS completed_lessons,
    CASE
      WHEN COALESCE(t.total_lessons, 0) > 0
      THEN ROUND((COALESCE(cu.completed_lessons, 0)::NUMERIC / t.total_lessons::NUMERIC) * 100, 2)
      ELSE 0
    END AS progress_percentage
  FROM academy_enrollments e
  JOIN auth.users u ON u.id = e.user_id
  LEFT JOIN lesson_totals t ON t.course_id = e.course_id
  LEFT JOIN completed_by_user cu ON cu.user_id = e.user_id
  WHERE e.course_id = p_course_id
  ORDER BY e.enrolled_at DESC;

END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_enrollments(UUID) TO authenticated;

COMMENT ON FUNCTION admin_list_enrollments(UUID) IS 'Admin-only: Lists enrollments for a course with user email and progress calculation. Uses SECURITY DEFINER to join with auth.users.';

-- ============================================================
-- RPC 2: admin_list_sales
-- Lists recent sales with course and buyer details
-- ============================================================

CREATE OR REPLACE FUNCTION admin_list_sales(p_days INT DEFAULT 30)
RETURNS TABLE (
  sale_id UUID,
  created_at TIMESTAMPTZ,
  amount_cents INTEGER,
  currency TEXT,
  payment_method TEXT,
  course_id UUID,
  course_title TEXT,
  buyer_email TEXT,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security: Only admins can execute this
  IF NOT is_academy_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  RETURN QUERY
  SELECT
    s.id AS sale_id,
    s.created_at,
    s.amount_cents,
    s.currency,
    s.payment_method,
    s.course_id,
    c.title AS course_title,
    u.email AS buyer_email,
    s.notes
  FROM academy_sales s
  JOIN academy_courses c ON c.id = s.course_id
  JOIN auth.users u ON u.id = s.user_id
  WHERE s.created_at >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY s.created_at DESC;

END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_sales(INT) TO authenticated;

COMMENT ON FUNCTION admin_list_sales(INT) IS 'Admin-only: Lists sales from last N days with course and buyer details. Uses SECURITY DEFINER to join with auth.users.';

-- ============================================================
-- RPC 3: admin_sales_analytics
-- Calculates sales analytics (revenue, top courses, etc.)
-- ============================================================

CREATE OR REPLACE FUNCTION admin_sales_analytics(p_days INT DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  total_revenue_cents BIGINT;
  total_sales_count BIGINT;
  avg_ticket_cents NUMERIC;
  top_courses_json JSON;
BEGIN
  -- Security: Only admins can execute this
  IF NOT is_academy_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  -- Calculate totals
  SELECT 
    COALESCE(SUM(amount_cents), 0),
    COALESCE(COUNT(*), 0),
    CASE 
      WHEN COUNT(*) > 0 THEN ROUND(AVG(amount_cents), 0)
      ELSE 0 
    END
  INTO total_revenue_cents, total_sales_count, avg_ticket_cents
  FROM academy_sales
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL;

  -- Calculate top courses by revenue
  SELECT COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'course_id', course_id,
        'course_title', course_title,
        'revenue_cents', revenue_cents,
        'sales_count', sales_count
      )
      ORDER BY revenue_cents DESC
    ) FILTER (WHERE rn <= 5),
    '[]'::JSON
  )
  INTO top_courses_json
  FROM (
    SELECT 
      s.course_id,
      c.title AS course_title,
      SUM(s.amount_cents) AS revenue_cents,
      COUNT(*) AS sales_count,
      ROW_NUMBER() OVER (ORDER BY SUM(s.amount_cents) DESC) AS rn
    FROM academy_sales s
    JOIN academy_courses c ON c.id = s.course_id
    WHERE s.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY s.course_id, c.title
  ) ranked;

  -- Build result JSON
  result := JSON_BUILD_OBJECT(
    'total_revenue_cents', total_revenue_cents,
    'total_sales_count', total_sales_count,
    'avg_ticket_cents', avg_ticket_cents,
    'period_days', p_days,
    'top_courses', top_courses_json
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_sales_analytics(INT) TO authenticated;

COMMENT ON FUNCTION admin_sales_analytics(INT) IS 'Admin-only: Returns sales analytics for last N days including revenue, top courses. Returns JSON object.';

-- ============================================================
-- Verification Queries (for testing)
-- ============================================================

-- Test enrollments RPC (replace with actual course UUID):
-- SELECT * FROM admin_list_enrollments('COURSE_UUID_HERE');

-- Test sales RPC:
-- SELECT * FROM admin_list_sales(30);

-- Test analytics RPC:
-- SELECT admin_sales_analytics(30);
