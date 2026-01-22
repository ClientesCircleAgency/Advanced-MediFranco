-- Migration 017: Webhook Contract Enhancement (Stripe-first fields)
-- Created: 2026-01-22
-- Purpose: Add top-level Stripe fields to event payload for n8n webhook contract

-- ============================================================
-- UPDATE create_sale_event() FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION create_sale_event()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_course_title TEXT;
  v_event_payload JSONB;
  v_stripe_customer_id TEXT;
  v_stripe_payment_intent_id TEXT;
  v_stripe_checkout_session_id TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Get course title
  SELECT title INTO v_course_title
  FROM academy_courses
  WHERE id = NEW.course_id;
  
  -- Extract Stripe IDs from metadata (null if not present)
  v_stripe_customer_id := NEW.metadata->>'customer_id';
  v_stripe_payment_intent_id := NEW.metadata->>'payment_intent_id';
  v_stripe_checkout_session_id := NEW.metadata->>'checkout_session_id';
  
  -- Build event payload with Stripe-first fields
  v_event_payload := jsonb_build_object(
    'sale_id', NEW.id,
    'sale_created_at', NEW.created_at,
    'amount_cents', NEW.amount_cents,
    'currency', NEW.currency,
    'payment_status', NEW.payment_status,
    'provider', NEW.provider,
    
    -- Stripe-first fields (top-level for easy access)
    'stripe_customer_id', v_stripe_customer_id,
    'stripe_payment_intent_id', v_stripe_payment_intent_id,
    'stripe_checkout_session_id', v_stripe_checkout_session_id,
    
    -- Course and user info
    'course_id', NEW.course_id,
    'course_title', v_course_title,
    'user_id', NEW.user_id,
    'user_email', v_user_email,
    
    -- Keep metadata intact for raw Stripe data
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

COMMENT ON FUNCTION create_sale_event() IS 
  'Auto-creates sale.created event with Stripe-first fields. Extracts stripe_customer_id, stripe_payment_intent_id, stripe_checkout_session_id from metadata for easy webhook consumption.';

-- ============================================================
-- VALIDATION
-- ============================================================

DO $$
DECLARE
  sample_payload JSONB;
BEGIN
  -- Get most recent event payload
  SELECT payload INTO sample_payload
  FROM academy_events
  ORDER BY occurred_at DESC
  LIMIT 1;
  
  RAISE NOTICE '=== MIGRATION 017 VALIDATION ===';
  
  IF sample_payload IS NOT NULL THEN
    RAISE NOTICE 'Sample payload keys: %', (SELECT array_agg(key) FROM jsonb_object_keys(sample_payload) AS key);
    
    -- Check for new fields
    IF sample_payload ? 'stripe_customer_id' 
       AND sample_payload ? 'stripe_payment_intent_id' 
       AND sample_payload ? 'stripe_checkout_session_id' THEN
      RAISE NOTICE 'Stripe-first fields added ✅';
    ELSE
      RAISE NOTICE 'New fields will appear on next sale creation';
    END IF;
    
    -- Check metadata still exists
    IF sample_payload ? 'metadata' THEN
      RAISE NOTICE 'Metadata intact ✅';
    END IF;
  ELSE
    RAISE NOTICE 'No events yet - validation will occur on first sale';
  END IF;
  
  RAISE NOTICE 'Webhook contract enhanced ✅';
END $$;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
