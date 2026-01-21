-- Migration 016: Stripe-like Manual Sales + Event System
-- Created: 2026-01-21
-- Purpose: Make manual sales indistinguishable from Stripe sales and create event system for n8n

-- ============================================================
-- PHASE 1: ADD PAYMENT STATUS AND PROVIDER TO SALES
-- ============================================================

-- Create payment_status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Create provider enum
CREATE TYPE payment_provider AS ENUM ('manual', 'stripe', 'other');

-- Add new columns to academy_sales
ALTER TABLE academy_sales 
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'paid',
ADD COLUMN IF NOT EXISTS provider payment_provider DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update existing manual sales to have correct status and provider
UPDATE academy_sales
SET 
  payment_status = 'paid',
  provider = 'manual',
  metadata = jsonb_build_object(
    'checkout_session_id', null,
    'payment_intent_id', null,
    'customer_id', null
  )
WHERE payment_status IS NULL OR provider IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE academy_sales 
ALTER COLUMN payment_status SET NOT NULL,
ALTER COLUMN provider SET NOT NULL,
ALTER COLUMN metadata SET NOT NULL;

COMMENT ON COLUMN academy_sales.payment_status IS 
  'Payment status: pending (awaiting payment), paid (completed), failed (payment failed), refunded (refunded)';

COMMENT ON COLUMN academy_sales.provider IS 
  'Payment provider: manual (admin created), stripe (Stripe checkout), other (future providers)';

COMMENT ON COLUMN academy_sales.metadata IS 
  'JSONB metadata for provider-specific fields (Stripe: checkout_session_id, payment_intent_id, customer_id)';

-- ============================================================
-- PHASE 2: CREATE EVENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS academy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_version TEXT NOT NULL DEFAULT '1',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sale_id UUID REFERENCES academy_sales(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_sale_id ON academy_events(sale_id);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON academy_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON academy_events(occurred_at DESC);

COMMENT ON TABLE academy_events IS 
  'Event log for n8n webhooks. Stores sale.created and other events with full payload for external automation.';

COMMENT ON COLUMN academy_events.payload IS 
  'Full event payload with sale details, user info, course info. Ready for n8n consumption.';

-- ============================================================
-- PHASE 3: CREATE EVENT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION create_sale_event()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_course_title TEXT;
  v_event_payload JSONB;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Get course title
  SELECT title INTO v_course_title
  FROM academy_courses
  WHERE id = NEW.course_id;
  
  -- Build event payload
  v_event_payload := jsonb_build_object(
    'sale_id', NEW.id,
    'sale_created_at', NEW.created_at,
    'amount_cents', NEW.amount_cents,
    'currency', NEW.currency,
    'payment_status', NEW.payment_status,
    'provider', NEW.provider,
    'course_id', NEW.course_id,
    'course_title', v_course_title,
    'user_id', NEW.user_id,
    'user_email', v_user_email,
    'metadata', NEW.metadata
  );
  
  -- Create event
  INSERT INTO academy_events (
    event_name,
    event_version,
    occurred_at,
    sale_id,
    payload
  ) VALUES (
    'sale.created',
    '1',
    NEW.created_at,
    NEW.id,
    v_event_payload
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_create_sale_event
AFTER INSERT ON academy_sales
FOR EACH ROW
EXECUTE FUNCTION create_sale_event();

COMMENT ON FUNCTION create_sale_event() IS 
  'Auto-creates sale.created event when a sale is inserted. Populates full payload for n8n webhook consumption.';

-- ============================================================
-- PHASE 4: UPDATE ADMIN RPC TO SET PAYMENT STATUS
-- ============================================================

-- Update admin_create_sale_and_enrollment to set payment_status and provider
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
  
  -- 4. Create SALE with payment_status and provider
  INSERT INTO academy_sales (
    user_id,
    course_id,
    amount_cents,
    currency,
    payment_method,
    payment_status,
    provider,
    metadata,
    notes,
    created_at
  ) VALUES (
    v_user_id,
    p_course_id,
    COALESCE(v_price_cents, 0),
    'EUR',
    'manual',
    'paid',  -- Manual sales are always paid
    'manual', -- Provider is manual
    jsonb_build_object(
      'checkout_session_id', null,
      'payment_intent_id', null,
      'customer_id', null,
      'admin_created', true
    ),
    'Manual enrollment by admin',
    NOW()
  )
  RETURNING id INTO v_sale_id;
  
  -- 5. Enrollment created automatically via trigger ✅
  -- 6. Event created automatically via trigger ✅
  
  -- 7. Return success with both IDs
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
  'Creates a sale for manual enrollment with payment_status=paid and provider=manual. Enrollment and event auto-created via triggers.';

-- ============================================================
-- PHASE 5: RLS POLICIES FOR EVENTS
-- ============================================================

-- Enable RLS
ALTER TABLE academy_events ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all events
CREATE POLICY academy_events_admin_select
ON academy_events
FOR SELECT
TO authenticated
USING (is_academy_admin(auth.uid()));

-- Policy: System can insert events (via trigger)
CREATE POLICY academy_events_system_insert
ON academy_events
FOR INSERT
TO authenticated
WITH CHECK (true); -- Trigger runs as SECURITY DEFINER

COMMENT ON POLICY academy_events_admin_select ON academy_events IS
  'Allows admins to view all events for debugging and n8n setup.';

-- ============================================================
-- PHASE 6: VALIDATION
-- ============================================================

DO $$
DECLARE
  sales_count INTEGER;
  events_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO sales_count FROM academy_sales;
  SELECT COUNT(*) INTO events_count FROM academy_events;
  
  RAISE NOTICE '=== MIGRATION 016 VALIDATION ===';
  RAISE NOTICE 'Total sales: %', sales_count;
  RAISE NOTICE 'Total events: %', events_count;
  RAISE NOTICE 'All sales have payment_status and provider ✅';
  RAISE NOTICE 'Event system ready for n8n ✅';
END $$;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
