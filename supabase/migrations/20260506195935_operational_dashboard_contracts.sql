-- Operational dashboard contracts for physical appointments.
-- Keeps status transitions auditable and gives the UI explicit fields for
-- cancellation, finalization, review automation and rescheduling.

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS final_notes text,
  ADD COLUMN IF NOT EXISTS finalized_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_opt_out boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_rescheduled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.appointment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  previous_status public.appointment_status,
  new_status public.appointment_status,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_events_appointment
  ON public.appointment_events(appointment_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_events_type
  ON public.appointment_events(event_type, created_at DESC);

ALTER TABLE public.appointment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage appointment_events" ON public.appointment_events;
CREATE POLICY "Admins can manage appointment_events"
  ON public.appointment_events
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.transition_appointment_status(
  p_appointment_id uuid,
  p_new_status public.appointment_status,
  p_reason text DEFAULT NULL,
  p_final_notes text DEFAULT NULL,
  p_review_opt_out boolean DEFAULT false,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.appointments
LANGUAGE plpgsql
AS $$
DECLARE
  v_appointment public.appointments;
  v_previous_status public.appointment_status;
  v_allowed boolean := false;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not allowed to transition appointments';
  END IF;

  SELECT *
    INTO v_appointment
    FROM public.appointments
   WHERE id = p_appointment_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;

  v_previous_status := v_appointment.status;

  IF v_previous_status = p_new_status THEN
    RETURN v_appointment;
  END IF;

  v_allowed := CASE v_previous_status
    WHEN 'scheduled' THEN p_new_status IN ('pre_confirmed', 'confirmed', 'cancelled')
    WHEN 'pre_confirmed' THEN p_new_status IN ('confirmed', 'cancelled')
    WHEN 'confirmed' THEN p_new_status IN ('waiting', 'cancelled', 'no_show')
    WHEN 'waiting' THEN p_new_status IN ('confirmed', 'in_progress', 'no_show')
    WHEN 'in_progress' THEN p_new_status IN ('waiting', 'completed')
    WHEN 'completed' THEN p_new_status IN ('in_progress')
    WHEN 'no_show' THEN p_new_status IN ('waiting')
    ELSE false
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid appointment status transition: % -> %', v_previous_status, p_new_status;
  END IF;

  IF p_new_status = 'cancelled' AND NULLIF(trim(coalesce(p_reason, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Cancellation reason is required';
  END IF;

  UPDATE public.appointments
     SET status = p_new_status,
         cancellation_reason = CASE WHEN p_new_status = 'cancelled' THEN p_reason ELSE cancellation_reason END,
         final_notes = CASE WHEN p_new_status = 'completed' THEN p_final_notes ELSE final_notes END,
         finalized_at = CASE WHEN p_new_status = 'completed' THEN now() ELSE finalized_at END,
         review_opt_out = CASE WHEN p_new_status = 'completed' THEN coalesce(p_review_opt_out, false) ELSE review_opt_out END,
         status_changed_at = now(),
         status_changed_by = auth.uid()
   WHERE id = p_appointment_id
   RETURNING *
    INTO v_appointment;

  INSERT INTO public.appointment_events (
    appointment_id,
    event_type,
    previous_status,
    new_status,
    reason,
    metadata,
    actor_id
  )
  VALUES (
    p_appointment_id,
    CASE WHEN p_new_status = 'completed' THEN 'appointment.finalized' ELSE 'appointment.status_changed' END,
    v_previous_status,
    p_new_status,
    p_reason,
    coalesce(p_metadata, '{}'::jsonb),
    auth.uid()
  );

  RETURN v_appointment;
END;
$$;
