-- Migration 012: Sales-First Architecture
-- Created: 2026-01-19
-- Purpose: Enforce 1 enrollment = 1 sale relationship with database constraints

-- ============================================================
-- PHASE 1: DATA AUDIT
-- ============================================================

-- Check for orphan enrollments (enrollments without corresponding sales)
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM academy_enrollments e
  LEFT JOIN academy_sales s 
    ON s.user_id = e.user_id 
    AND s.course_id = e.course_id
  WHERE s.id IS NULL;
  
  RAISE NOTICE 'Found % orphan enrollments without sales', orphan_count;
END $$;

-- ============================================================
-- PHASE 2: CREATE RETROACTIVE SALES FOR ORPHANS
-- ============================================================

-- Create sales for existing enrollments that don't have one
INSERT INTO academy_sales (
  user_id,
  course_id,
  amount_cents,
  currency,
  payment_method,
  notes,
  created_at
)
SELECT 
  e.user_id,
  e.course_id,
  COALESCE(c.price_cents, 0) as amount_cents,
  'EUR' as currency,
  'retroactive' as payment_method,
  'Retroactive sale for existing enrollment (data migration)' as notes,
  e.enrolled_at as created_at
FROM academy_enrollments e
LEFT JOIN academy_sales s 
  ON s.user_id = e.user_id 
  AND s.course_id = e.course_id
LEFT JOIN academy_courses c 
  ON c.id = e.course_id
WHERE s.id IS NULL;

-- ============================================================
-- PHASE 3: ADD sale_id COLUMN TO ENROLLMENTS
-- ============================================================

-- Add column (nullable initially for safe migration)
ALTER TABLE academy_enrollments 
ADD COLUMN IF NOT EXISTS sale_id UUID;

-- Add FK constraint (without CASCADE yet, for safety)
ALTER TABLE academy_enrollments
ADD CONSTRAINT academy_enrollments_sale_id_fkey 
FOREIGN KEY (sale_id) 
REFERENCES academy_sales(id);

-- ============================================================
-- PHASE 4: LINK ENROLLMENTS TO SALES
-- ============================================================

-- Populate sale_id for all existing enrollments
UPDATE academy_enrollments e
SET sale_id = (
  SELECT s.id 
  FROM academy_sales s
  WHERE s.user_id = e.user_id 
    AND s.course_id = e.course_id
  ORDER BY s.created_at ASC
  LIMIT 1
)
WHERE sale_id IS NULL;

-- Verify all enrollments have sale_id
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM academy_enrollments
  WHERE sale_id IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Found % enrollments without sale_id after migration. Aborting.', null_count;
  END IF;
  
  RAISE NOTICE 'All enrollments successfully linked to sales';
END $$;

-- ============================================================
-- PHASE 5: ENFORCE CONSTRAINTS
-- ============================================================

-- Make sale_id NOT NULL (cannot have enrollment without sale)
ALTER TABLE academy_enrollments 
ALTER COLUMN sale_id SET NOT NULL;

-- Add unique index (one enrollment per sale)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_sale_unique 
ON academy_enrollments(sale_id);

-- Add CHECK constraint for extra safety
ALTER TABLE academy_enrollments 
ADD CONSTRAINT enrollments_must_have_sale 
CHECK (sale_id IS NOT NULL);

-- ============================================================
-- PHASE 6: ENABLE CASCADE DELETE
-- ============================================================

-- Drop and recreate FK with ON DELETE CASCADE
ALTER TABLE academy_enrollments 
DROP CONSTRAINT academy_enrollments_sale_id_fkey;

ALTER TABLE academy_enrollments
ADD CONSTRAINT academy_enrollments_sale_id_fkey 
FOREIGN KEY (sale_id) 
REFERENCES academy_sales(id) 
ON DELETE CASCADE;

-- ============================================================
-- PHASE 7: CREATE TRIGGER FOR AUTO-ENROLLMENT
-- ============================================================

-- Function: Auto-create enrollment when sale is created
CREATE OR REPLACE FUNCTION create_enrollment_from_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Create enrollment automatically
  INSERT INTO academy_enrollments (
    user_id,
    course_id,
    sale_id,
    enrolled_at
  ) VALUES (
    NEW.user_id,
    NEW.course_id,
    NEW.id,
    NEW.created_at
  )
  ON CONFLICT (sale_id) DO NOTHING; -- Prevent duplicates if already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Fire after sale insert
CREATE TRIGGER trigger_create_enrollment_from_sale
AFTER INSERT ON academy_sales
FOR EACH ROW
EXECUTE FUNCTION create_enrollment_from_sale();

-- ============================================================
-- PHASE 8: UPDATE ADMIN RPC (Sales-First)
-- ============================================================

-- Rename old RPC for backup
ALTER FUNCTION admin_create_enrollment_by_email(UUID, TEXT) 
RENAME TO admin_create_enrollment_by_email_OLD;

-- New RPC: Create sale (enrollment created via trigger)
CREATE OR REPLACE FUNCTION admin_create_sale_and_enrollment(
  p_course_id UUID,
  p_email TEXT
) 
RETURNS JSON 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_sale_id UUID;
  v_price_cents INT;
  v_existing_sale UUID;
BEGIN
  -- Security: Only admins can execute this
  IF NOT is_academy_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  -- 1. Find user by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;
  
  -- 2. Check if user already has a sale for this course
  SELECT id INTO v_existing_sale
  FROM academy_sales
  WHERE user_id = v_user_id
    AND course_id = p_course_id;
  
  -- If sale exists, enrollment exists too (via FK)
  IF v_existing_sale IS NOT NULL THEN
    RETURN json_build_object(
      'success', true,
      'sale_id', v_existing_sale,
      'enrollment_id', (
        SELECT id FROM academy_enrollments WHERE sale_id = v_existing_sale
      ),
      'already_exists', true,
      'message', 'User already enrolled in this course'
    );
  END IF;
  
  -- 3. Get course price
  SELECT price_cents INTO v_price_cents
  FROM academy_courses
  WHERE id = p_course_id;
  
  -- 4. Create SALE (source of truth)
  INSERT INTO academy_sales (
    user_id,
    course_id,
    amount_cents,
    currency,
    payment_method,
    notes,
    created_at
  ) VALUES (
    v_user_id,
    p_course_id,
    COALESCE(v_price_cents, 0),
    'EUR',
    'manual',
    'Manual enrollment by admin',
    NOW()
  )
  RETURNING id INTO v_sale_id;
  
  -- 5. Enrollment created automatically via trigger ✅
  
  -- 6. Return success with both IDs
  RETURN json_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'enrollment_id', (
      SELECT id FROM academy_enrollments WHERE sale_id = v_sale_id
    ),
    'already_exists', false,
    'message', 'Sale and enrollment created successfully'
  );
END;
$$;

COMMENT ON FUNCTION admin_create_sale_and_enrollment(UUID, TEXT) IS 
  'Creates a sale for manual enrollment. Enrollment auto-created via trigger. Sales-first architecture ensures 1 sale = 1 enrollment always.';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_create_sale_and_enrollment(UUID, TEXT) TO authenticated;

-- ============================================================
-- PHASE 9: VALIDATION QUERIES
-- ============================================================

-- Verify data integrity
DO $$
DECLARE
  enrollment_count INTEGER;
  sale_count INTEGER;
  orphan_enrollments INTEGER;
  orphan_sales INTEGER;
BEGIN
  -- Count totals
  SELECT COUNT(*) INTO enrollment_count FROM academy_enrollments;
  SELECT COUNT(DISTINCT sale_id) INTO sale_count FROM academy_enrollments;
  
  -- Check for orphans
  SELECT COUNT(*) INTO orphan_enrollments 
  FROM academy_enrollments WHERE sale_id IS NULL;
  
  SELECT COUNT(*) INTO orphan_sales 
  FROM academy_sales s
  LEFT JOIN academy_enrollments e ON e.sale_id = s.id
  WHERE e.id IS NULL;
  
  -- Report
  RAISE NOTICE '=== DATA INTEGRITY REPORT ===';
  RAISE NOTICE 'Total enrollments: %', enrollment_count;
  RAISE NOTICE 'Total sales (via enrollments): %', sale_count;
  RAISE NOTICE 'Orphan enrollments (no sale): %', orphan_enrollments;
  RAISE NOTICE 'Orphan sales (no enrollment): %', orphan_sales;
  
  IF orphan_enrollments > 0 OR orphan_sales > 0 THEN
    RAISE WARNING 'Data integrity issues detected! Review required.';
  ELSE
    RAISE NOTICE 'DATA INTEGRITY: PERFECT ✅';
  END IF;
END $$;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

COMMENT ON TABLE academy_enrollments IS 
  'Derived table from academy_sales. Enrollment auto-created when sale is created. sale_id is required (FK with CASCADE delete). Source of truth: academy_sales.';
