-- Migration: Admin RPC for Creating Enrollment by Email
-- Created: 2026-01-18
-- Purpose: Allow admins to enroll users by email address

-- ============================================================
-- RPC: admin_create_enrollment_by_email
-- Creates enrollment for a user identified by email
-- ============================================================

CREATE OR REPLACE FUNCTION admin_create_enrollment_by_email(
  p_course_id UUID,
  p_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_enrollment_id UUID;
  v_already_enrolled BOOLEAN;
BEGIN
  -- Security: Only admins can execute this
  IF NOT is_academy_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  -- Trim and lowercase email for comparison
  p_email := LOWER(TRIM(p_email));

  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE LOWER(email) = p_email
  LIMIT 1;

  -- If user not found, raise specific error
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  -- Check if already enrolled
  SELECT EXISTS(
    SELECT 1 FROM academy_enrollments
    WHERE user_id = v_user_id AND course_id = p_course_id
  ) INTO v_already_enrolled;

  -- If already enrolled, return existing enrollment
  IF v_already_enrolled THEN
    SELECT id INTO v_enrollment_id
    FROM academy_enrollments
    WHERE user_id = v_user_id AND course_id = p_course_id;

    RETURN JSON_BUILD_OBJECT(
      'enrollment_id', v_enrollment_id,
      'user_id', v_user_id,
      'course_id', p_course_id,
      'already_enrolled', true,
      'message', 'Utilizador já estava inscrito neste curso'
    );
  END IF;

  -- Create new enrollment
  INSERT INTO academy_enrollments (user_id, course_id, enrolled_at)
  VALUES (v_user_id, p_course_id, NOW())
  RETURNING id INTO v_enrollment_id;

  -- Return success
  RETURN JSON_BUILD_OBJECT(
    'enrollment_id', v_enrollment_id,
    'user_id', v_user_id,
    'course_id', p_course_id,
    'already_enrolled', false,
    'message', 'Utilizador inscrito com sucesso'
  );

END;
$$;

GRANT EXECUTE ON FUNCTION admin_create_enrollment_by_email(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION admin_create_enrollment_by_email(UUID, TEXT) IS 'Admin-only: Enrolls a user in a course by email address. Returns enrollment details. Raises user_not_found if email does not exist.';
