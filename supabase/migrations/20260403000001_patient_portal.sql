-- ============================================================
-- MediFranco — Patient Portal & Online Consultations Schema
-- Migration: 2026-04-03
-- Barnun-aligned conventions
-- Uses existing app_role enum: 'admin' | 'user'
-- ============================================================

-- 1. ENUMS

CREATE TYPE online_appointment_status AS ENUM (
  'scheduled', 'pre_confirmed', 'confirmed', 'paid',
  'waiting', 'in_progress', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE document_type AS ENUM (
  'prescription', 'report', 'exam_result', 'imaging',
  'referral', 'invoice', 'other'
);

-- 2. TABLES

CREATE TABLE patient_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  nif TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"email":true,"sms":false,"push":false,"appointment_reminders":true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT patient_users_user_id_unique UNIQUE (user_id),
  CONSTRAINT patient_users_nif_unique UNIQUE (nif),
  CONSTRAINT patient_users_nif_format CHECK (nif IS NULL OR nif ~ '^\d{9}$')
);

CREATE TABLE online_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES patient_users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  consultation_type_id UUID REFERENCES consultation_types(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  video_provider TEXT NOT NULL DEFAULT 'daily',
  video_room_url TEXT,
  video_room_id TEXT,
  status online_appointment_status NOT NULL DEFAULT 'scheduled',
  price_cents INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  reason TEXT,
  notes TEXT,
  final_notes TEXT,
  prescription TEXT,
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  patient_rating SMALLINT CHECK (patient_rating BETWEEN 1 AND 5),
  patient_feedback TEXT,
  review_opt_out BOOLEAN NOT NULL DEFAULT FALSE,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES patient_users(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  document_type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  online_appointment_id UUID REFERENCES online_appointments(id) ON DELETE SET NULL,
  is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES patient_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  online_appointment_id UUID REFERENCES online_appointments(id) ON DELETE SET NULL,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES

CREATE INDEX idx_patient_users_user_id ON patient_users(user_id);
CREATE INDEX idx_patient_users_nif ON patient_users(nif) WHERE nif IS NOT NULL;
CREATE INDEX idx_patient_users_patient_id ON patient_users(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_online_appointments_patient ON online_appointments(patient_user_id);
CREATE INDEX idx_online_appointments_professional ON online_appointments(professional_id);
CREATE INDEX idx_online_appointments_date ON online_appointments(date);
CREATE INDEX idx_online_appointments_status ON online_appointments(status);
CREATE INDEX idx_patient_documents_patient ON patient_documents(patient_user_id);
CREATE INDEX idx_patient_notifications_patient ON patient_notifications(patient_user_id);
CREATE INDEX idx_patient_notifications_unread ON patient_notifications(patient_user_id, is_read) WHERE is_read = FALSE;

-- 4. TRIGGERS

CREATE TRIGGER update_patient_users_updated_at
  BEFORE UPDATE ON patient_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_online_appointments_updated_at
  BEFORE UPDATE ON online_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. NIF AUTO-MATCHING

CREATE OR REPLACE FUNCTION match_patient_by_nif()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nif IS NOT NULL AND NEW.patient_id IS NULL THEN
    SELECT id INTO NEW.patient_id FROM patients WHERE nif = NEW.nif LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_match_patient_nif
  BEFORE INSERT OR UPDATE OF nif ON patient_users
  FOR EACH ROW EXECUTE FUNCTION match_patient_by_nif();

-- 6. RLS
-- Uses existing app_role enum: 'admin' (staff) | 'user' (patients)

ALTER TABLE patient_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notifications ENABLE ROW LEVEL SECURITY;

-- patient_users
CREATE POLICY "Patient can view own profile"
  ON patient_users FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin manages patient_users"
  ON patient_users FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own patient profile"
  ON patient_users FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Patient can update own profile"
  ON patient_users FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- online_appointments
CREATE POLICY "Admin manages online_appointments"
  ON online_appointments FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Patient can view own online appointments"
  ON online_appointments FOR SELECT
  USING (patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid()));

CREATE POLICY "Patient can create online appointments"
  ON online_appointments FOR INSERT
  WITH CHECK (patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid()));

CREATE POLICY "Patient can update own online appointments"
  ON online_appointments FOR UPDATE
  USING (patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid()))
  WITH CHECK (patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid()));

-- patient_documents
CREATE POLICY "Admin manages patient_documents"
  ON patient_documents FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Patient can view own documents"
  ON patient_documents FOR SELECT
  USING (patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid()));

CREATE POLICY "Patient can upload own documents"
  ON patient_documents FOR INSERT
  WITH CHECK (
    patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid())
    AND uploaded_by_user_id = auth.uid()
  );

CREATE POLICY "Patient can delete own documents"
  ON patient_documents FOR DELETE
  USING (
    patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid())
    AND uploaded_by_user_id = auth.uid()
  );

-- patient_notifications
CREATE POLICY "Admin manages patient_notifications"
  ON patient_notifications FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Patient can view own notifications"
  ON patient_notifications FOR SELECT
  USING (patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid()));

CREATE POLICY "Patient can update own notifications"
  ON patient_notifications FOR UPDATE
  USING (patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid()))
  WITH CHECK (patient_user_id IN (SELECT id FROM patient_users WHERE user_id = auth.uid()));

-- 7. STORAGE BUCKET

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-documents', 'patient-documents', false, 10485760,
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','application/dicom']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "patient_storage_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'patient-documents'
    AND (storage.foldername(name))[1] = (SELECT id::text FROM patient_users WHERE user_id = auth.uid())
  );

CREATE POLICY "patient_storage_select_admin"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patient-documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "patient_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-documents'
    AND (storage.foldername(name))[1] = (SELECT id::text FROM patient_users WHERE user_id = auth.uid())
  );

CREATE POLICY "patient_storage_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'patient-documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "patient_storage_delete_admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'patient-documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "patient_storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'patient-documents'
    AND (storage.foldername(name))[1] = (SELECT id::text FROM patient_users WHERE user_id = auth.uid())
  );
