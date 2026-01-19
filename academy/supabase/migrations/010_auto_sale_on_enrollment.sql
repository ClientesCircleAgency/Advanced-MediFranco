-- Migration: Auto-create Sale on Manual Enrollment
-- Created: 2026-01-19
-- Purpose: When admin enrolls a user manually, also create a sale record automatically

-- ============================================================
-- MODIFY: admin_create_enrollment_by_email
-- Now creates both enrollment AND sale record
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
  v_sale_id UUID;
  v_already_enrolled BOOLEAN;
  v_course_price_cents INTEGER;
  v_sale_exists BOOLEAN;
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

  -- Get course price (needed for sale record)
  SELECT price_cents INTO v_course_price_cents
  FROM academy_courses
  WHERE id = p_course_id;

  -- Default to 0 if price not set
  v_course_price_cents := COALESCE(v_course_price_cents, 0);

  -- Check if already enrolled
  SELECT EXISTS(
    SELECT 1 FROM academy_enrollments
    WHERE user_id = v_user_id AND course_id = p_course_id
  ) INTO v_already_enrolled;

  -- If already enrolled, return existing enrollment (no new sale)
  IF v_already_enrolled THEN
    SELECT id INTO v_enrollment_id
    FROM academy_enrollments
    WHERE user_id = v_user_id AND course_id = p_course_id;

    RETURN JSON_BUILD_OBJECT(
      'enrollment_id', v_enrollment_id,
      'user_id', v_user_id,
      'course_id', p_course_id,
      'already_enrolled', true,
      'sale_created', false,
      'message', 'Utilizador já estava inscrito neste curso'
    );
  END IF;

  -- Create new enrollment
  INSERT INTO academy_enrollments (user_id, course_id, enrolled_at)
  VALUES (v_user_id, p_course_id, NOW())
  RETURNING id INTO v_enrollment_id;

  -- Check if manual sale already exists for this user+course
  -- (prevents duplicate sales if function called twice by accident)
  SELECT EXISTS(
    SELECT 1 FROM academy_sales
    WHERE user_id = v_user_id 
      AND course_id = p_course_id 
      AND payment_method = 'manual'
  ) INTO v_sale_exists;

  -- Create sale if it doesn't exist
  IF NOT v_sale_exists THEN
    INSERT INTO academy_sales (
      course_id,
      user_id,
      amount_cents,
      currency,
      payment_method,
      notes,
      created_at
    )
    VALUES (
      p_course_id,
      v_user_id,
      v_course_price_cents,
      'EUR',
      'manual',
      'Auto-sale from manual enrollment',
      NOW()
    )
    RETURNING id INTO v_sale_id;
  END IF;

  -- Return success with enrollment and sale info
  RETURN JSON_BUILD_OBJECT(
    'enrollment_id', v_enrollment_id,
    'sale_id', v_sale_id,
    'user_id', v_user_id,
    'course_id', p_course_id,
    'already_enrolled', false,
    'sale_created', (v_sale_id IS NOT NULL),
    'message', 'Utilizador inscrito com sucesso' || 
               CASE WHEN v_sale_id IS NOT NULL THEN ' (venda criada)' ELSE '' END
  );

END;
$$;

-- Comment updated to reflect new behavior
COMMENT ON FUNCTION admin_create_enrollment_by_email(UUID, TEXT) IS 'Admin-only: Enrolls a user in a course by email address AND creates a manual sale record. Returns enrollment details with sale_id. Prevents duplicate enrollments and sales.';
