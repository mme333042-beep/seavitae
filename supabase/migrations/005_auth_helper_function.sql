-- SeaVitae Auth Helper Function
-- Creates a SECURITY DEFINER function to get user role during authentication
-- This bypasses RLS to avoid circular dependency issues with admin role checks
-- Run this AFTER previous migrations

-- ============================================
-- CREATE AUTH HELPER FUNCTION
-- ============================================

-- Function to get user role by ID (bypasses RLS)
-- SECURITY DEFINER means it runs with the privileges of the function owner (postgres)
-- This is safe because it only returns the role, not sensitive data
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TABLE (role TEXT, email_verified BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT u.role::TEXT, u.email_verified
    FROM public.users u
    WHERE u.id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;

-- Revoke from anon to prevent unauthenticated access
REVOKE EXECUTE ON FUNCTION public.get_user_role(UUID) FROM anon;

COMMENT ON FUNCTION public.get_user_role IS
'Securely retrieves user role during authentication. Uses SECURITY DEFINER to bypass RLS.';
