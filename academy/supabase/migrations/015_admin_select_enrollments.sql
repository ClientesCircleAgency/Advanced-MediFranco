-- Migration 015: Add SELECT policy for admins on academy_enrollments
-- Created: 2026-01-19
-- Purpose: Allow admins to read enrollments (needed for delete flow)

-- Policy: Admins can read all enrollments
CREATE POLICY academy_enrollments_admin_select
ON academy_enrollments
FOR SELECT
TO authenticated
USING (is_academy_admin(auth.uid()));

COMMENT ON POLICY academy_enrollments_admin_select ON academy_enrollments IS
  'Allows admins to read enrollments. Required for delete flow to fetch sale_id.';
