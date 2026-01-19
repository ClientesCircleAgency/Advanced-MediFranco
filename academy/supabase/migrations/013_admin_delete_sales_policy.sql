-- Migration 013: Fix admin delete permissions for sales
-- Created: 2026-01-19
-- Purpose: Allow admins to delete sales (which CASCADE deletes enrollments)

-- Enable RLS on academy_sales if not already enabled
ALTER TABLE academy_sales ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can delete sales
CREATE POLICY academy_sales_admin_delete
ON academy_sales
FOR DELETE
TO authenticated
USING (is_academy_admin(auth.uid()));

-- Grant delete permission (should already exist, but ensuring)
GRANT DELETE ON academy_sales TO authenticated;

COMMENT ON POLICY academy_sales_admin_delete ON academy_sales IS
  'Allows academy admins to delete sales. Enrollment will CASCADE delete automatically.';
