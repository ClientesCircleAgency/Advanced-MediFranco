-- Removes the former public patient/client portal.
-- This keeps the official site focused on the public website and admin editorial tools.

DROP POLICY IF EXISTS "patient_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "patient_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "patient_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "patient_storage_delete" ON storage.objects;

DELETE FROM storage.objects WHERE bucket_id = 'patient-documents';
DELETE FROM storage.buckets WHERE id = 'patient-documents';

DROP TABLE IF EXISTS public.patient_notifications CASCADE;
DROP TABLE IF EXISTS public.patient_documents CASCADE;
DROP TABLE IF EXISTS public.online_appointments CASCADE;
DROP TABLE IF EXISTS public.patient_users CASCADE;
DROP TABLE IF EXISTS public.appointment_events CASCADE;
DROP TABLE IF EXISTS public.whatsapp_workflows CASCADE;
DROP TABLE IF EXISTS public.waitlist CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;

DROP FUNCTION IF EXISTS public.match_patient_by_nif() CASCADE;
DROP FUNCTION IF EXISTS public.transition_appointment_status(uuid, public.appointment_status, text, text, boolean, jsonb) CASCADE;

DROP TYPE IF EXISTS public.waitlist_priority CASCADE;
DROP TYPE IF EXISTS public.time_preference CASCADE;
DROP TYPE IF EXISTS public.appointment_status CASCADE;
