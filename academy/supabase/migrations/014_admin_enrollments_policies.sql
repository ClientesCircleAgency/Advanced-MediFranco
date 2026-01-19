-- Migration 014: Fix admin permissions on academy_enrollments for CASCADE
-- Created: 2026-01-19
-- Purpose: Allow CASCADE delete from academy_sales to work properly

-- Enable RLS if not already
ALTER TABLE academy_enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to delete enrollments (needed for CASCADE from sales)
CREATE POLICY academy_enrollments_admin_delete
ON academy_enrollments
FOR DELETE
TO authenticated
USING (is_academy_admin(auth.uid()));

-- Policy: Allow system/trigger to insert enrollments (needed for trigger)
-- This allows INSERT when sale_id references a valid sale
CREATE POLICY academy_enrollments_system_insert
ON academy_enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if admin is creating
  is_academy_admin(auth.uid())
  OR
  -- Allow if sale exists (trigger scenario)
  EXISTS (
    SELECT 1 FROM academy_sales
    WHERE id = academy_enrollments.sale_id
  )
);

COMMENT ON POLICY academy_enrollments_admin_delete ON academy_enrollments IS
  'Allows admins to delete enrollments. Enables CASCADE delete from academy_sales.';

COMMENT ON POLICY academy_enrollments_system_insert ON academy_enrollments IS
  'Allows trigger to auto-create enrollments when sales are created.';
