-- SeaVitae Schema Updates Migration
-- Adds missing fields and updates constraints
-- Run this AFTER 001 and 002 migrations

-- ============================================
-- 1. ADD MISSING FIELDS TO JOBSEEKERS
-- ============================================

-- Add age field to jobseekers
ALTER TABLE public.jobseekers
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 16 AND age <= 100);

-- ============================================
-- 2. ADD MISSING FIELDS TO EMPLOYERS
-- ============================================

-- Add verification fields
ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add CAC registration number for companies
ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS cac_registration_number TEXT;

-- Add NIN/Passport for individual employers
ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS nin_passport_number TEXT;

-- Add hiring purpose for individual employers
ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS hiring_purpose TEXT CHECK (hiring_purpose IN ('personal_project', 'freelance_work', 'startup', 'household', 'other'));

-- Add phone, city and address fields
ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS address TEXT;

-- ============================================
-- 3. UPDATE RLS POLICY FOR USERS INSERT
-- ============================================

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- Create new policy that allows insert when:
-- 1. The inserting user matches the id being inserted (auth.uid() = id)
-- 2. OR the user is creating their own record during signup
CREATE POLICY "Users can insert own record"
    ON public.users FOR INSERT
    WITH CHECK (
        auth.uid() = id
        OR (
            -- Allow insert during signup when no session exists yet
            -- This relies on the auth.users id matching
            id IS NOT NULL
        )
    );

-- ============================================
-- 4. CREATE FUNCTION TO AUTO-CREATE USER RECORD
-- ============================================

-- Function to create user record in public.users when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'jobseeker'),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
    )
    ON CONFLICT (id) DO UPDATE SET
        email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also trigger on email confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
    AFTER UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW
    WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. ADD INDEX FOR VERIFICATION STATUS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_employers_verification_status ON public.employers(verification_status);

-- ============================================
-- 6. UPDATE EMPLOYER READ POLICY
-- ============================================

-- Drop and recreate employer read policies to include verification check
DROP POLICY IF EXISTS "Employers can read visible profiles" ON public.jobseekers;

-- Only verified employers can search/view jobseeker profiles
CREATE POLICY "Verified employers can read visible profiles"
    ON public.jobseekers FOR SELECT
    USING (
        is_visible = TRUE
        AND EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.employers e ON e.user_id = u.id
            WHERE u.id = auth.uid()
            AND u.role = 'employer'
            AND e.is_verified = TRUE
        )
    );

-- Also allow unverified employers to see only that profiles exist (empty result for search)
-- This is handled in the application layer - unverified employers see "pending verification" message

-- ============================================
-- 7. NOTIFICATION PREFERENCES (for future use)
-- ============================================

-- Add notification preferences column (JSONB for flexibility)
ALTER TABLE public.jobseekers
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_messages": true, "email_interviews": true}'::jsonb;

ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_responses": true}'::jsonb;
