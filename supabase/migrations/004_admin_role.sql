-- SeaVitae Admin Role Migration
-- Adds support for admin users who can verify employers
-- Run this AFTER previous migrations

-- ============================================
-- 1. UPDATE USERS TABLE TO ALLOW ADMIN ROLE
-- ============================================

-- Drop the existing constraint on role column
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint that includes 'admin' role
ALTER TABLE public.users
ADD CONSTRAINT users_role_check
CHECK (role IN ('jobseeker', 'employer', 'admin'));

-- ============================================
-- 2. CREATE ADMIN-SPECIFIC RLS POLICIES
-- ============================================

-- Policy: Admins can read all users
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Policy: Admins can read all employers
DROP POLICY IF EXISTS "Admins can read all employers" ON public.employers;
CREATE POLICY "Admins can read all employers"
    ON public.employers FOR SELECT
    USING (
        -- Employer can read own profile
        user_id = auth.uid()
        OR
        -- Admins can read all employers
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Policy: Admins can update employer verification status
DROP POLICY IF EXISTS "Admins can update employers" ON public.employers;
CREATE POLICY "Admins can update employers"
    ON public.employers FOR UPDATE
    USING (
        -- Employer can update own profile
        user_id = auth.uid()
        OR
        -- Admins can update any employer
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- ============================================
-- 3. CREATE ADMIN USER FUNCTION
-- ============================================

-- Function to promote a user to admin (must be run by superuser or service role)
-- Usage: SELECT promote_to_admin('user@email.com');
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id
    FROM public.users
    WHERE email = user_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- Update user role to admin
    UPDATE public.users
    SET role = 'admin'
    WHERE id = target_user_id;

    -- Update auth.users metadata as well
    UPDATE auth.users
    SET raw_user_meta_data =
        COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE id = target_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote admin back to employer
CREATE OR REPLACE FUNCTION demote_from_admin(user_email TEXT, new_role TEXT DEFAULT 'employer')
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
BEGIN
    IF new_role NOT IN ('jobseeker', 'employer') THEN
        RAISE EXCEPTION 'Invalid role. Must be jobseeker or employer';
    END IF;

    -- Find user by email
    SELECT id INTO target_user_id
    FROM public.users
    WHERE email = user_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- Update user role
    UPDATE public.users
    SET role = new_role
    WHERE id = target_user_id;

    -- Update auth.users metadata as well
    UPDATE auth.users
    SET raw_user_meta_data =
        COALESCE(raw_user_meta_data, '{}'::jsonb) || format('{"role": "%s"}', new_role)::jsonb
    WHERE id = target_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. ADMIN AUDIT LOG TABLE (Optional)
-- ============================================

-- Create audit log for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying audit logs
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON public.admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON public.admin_audit_log(created_at DESC);

-- RLS for audit log - only admins can view
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
    ON public.admin_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert audit log"
    ON public.admin_audit_log FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

-- Grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- NOTES FOR SETUP
-- ============================================
-- To create your first admin user:
-- 1. First, create a regular account through the signup flow
-- 2. Run the following SQL in Supabase SQL Editor:
--    SELECT promote_to_admin('your-admin-email@example.com');
-- 3. Log out and log back in to get the updated role
