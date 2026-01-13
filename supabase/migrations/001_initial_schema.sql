-- SeaVitae Production Database Schema
-- Supabase PostgreSQL Migration

-- ============================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('jobseeker', 'employer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ
);

-- Index for role-based queries
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================
-- 2. JOBSEEKERS TABLE
-- ============================================
CREATE TABLE public.jobseekers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    preferred_role TEXT,
    city TEXT,
    bio TEXT,
    years_experience INTEGER DEFAULT 0 CHECK (years_experience >= 0),
    phone TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    is_visible BOOLEAN DEFAULT FALSE,
    profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search and filtering
CREATE INDEX idx_jobseekers_user_id ON public.jobseekers(user_id);
CREATE INDEX idx_jobseekers_visible ON public.jobseekers(is_visible) WHERE is_visible = TRUE;
CREATE INDEX idx_jobseekers_city ON public.jobseekers(city);
CREATE INDEX idx_jobseekers_role ON public.jobseekers(preferred_role);

-- ============================================
-- 3. EMPLOYERS TABLE
-- ============================================
CREATE TABLE public.employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    employer_type TEXT NOT NULL CHECK (employer_type IN ('individual', 'company')),
    display_name TEXT NOT NULL,
    company_name TEXT,
    company_size TEXT,
    industry TEXT,
    website TEXT,
    linkedin_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_employers_user_id ON public.employers(user_id);
CREATE INDEX idx_employers_verified ON public.employers(is_verified);
CREATE INDEX idx_employers_type ON public.employers(employer_type);

-- ============================================
-- 4. CVS TABLE (CV header/metadata)
-- ============================================
CREATE TABLE public.cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobseeker_id UUID NOT NULL REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'My CV',
    is_primary BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cvs_jobseeker_id ON public.cvs(jobseeker_id);
CREATE INDEX idx_cvs_primary ON public.cvs(is_primary) WHERE is_primary = TRUE;

-- ============================================
-- 5. CV_SECTIONS TABLE (structured CV content)
-- ============================================
CREATE TABLE public.cv_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES public.cvs(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL CHECK (section_type IN (
        'experience', 'education', 'skills', 'languages',
        'certifications', 'projects', 'publications', 'summary'
    )),
    section_order INTEGER NOT NULL DEFAULT 0,
    content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cv_sections_cv_id ON public.cv_sections(cv_id);
CREATE INDEX idx_cv_sections_type ON public.cv_sections(section_type);
CREATE INDEX idx_cv_sections_order ON public.cv_sections(cv_id, section_order);

-- ============================================
-- 6. SAVED_CVS TABLE (immutable snapshots)
-- ============================================
CREATE TABLE public.saved_cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
    jobseeker_id UUID NOT NULL REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    cv_id UUID NOT NULL REFERENCES public.cvs(id) ON DELETE SET NULL,
    snapshot_data JSONB NOT NULL,
    snapshot_version INTEGER NOT NULL,
    notes TEXT,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- No updated_at: snapshots are immutable
);

-- Indexes
CREATE INDEX idx_saved_cvs_employer ON public.saved_cvs(employer_id);
CREATE INDEX idx_saved_cvs_jobseeker ON public.saved_cvs(jobseeker_id);
CREATE INDEX idx_saved_cvs_saved_at ON public.saved_cvs(saved_at DESC);

-- Unique constraint: employer can save same CV version only once
CREATE UNIQUE INDEX idx_saved_cvs_unique ON public.saved_cvs(employer_id, cv_id, snapshot_version);

-- ============================================
-- 7. MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for inbox/sent queries
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id, created_at DESC);
CREATE INDEX idx_messages_unread ON public.messages(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_thread ON public.messages(parent_message_id);

-- ============================================
-- 8. INTERVIEWS TABLE
-- ============================================
CREATE TABLE public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
    jobseeker_id UUID NOT NULL REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    proposed_date TIMESTAMPTZ,
    proposed_location TEXT,
    interview_type TEXT CHECK (interview_type IN ('in_person', 'video', 'phone')),
    message TEXT,
    response_message TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_interviews_employer ON public.interviews(employer_id);
CREATE INDEX idx_interviews_jobseeker ON public.interviews(jobseeker_id);
CREATE INDEX idx_interviews_status ON public.interviews(status);
CREATE INDEX idx_interviews_date ON public.interviews(proposed_date);

-- ============================================
-- 9. INVITES TABLE (soft launch invite codes)
-- ============================================
CREATE TABLE public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    email TEXT,
    role TEXT CHECK (role IN ('jobseeker', 'employer')),
    is_used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invites_code ON public.invites(code);
CREATE INDEX idx_invites_email ON public.invites(email);
CREATE INDEX idx_invites_unused ON public.invites(is_used) WHERE is_used = FALSE;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobseekers_updated_at
    BEFORE UPDATE ON public.jobseekers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employers_updated_at
    BEFORE UPDATE ON public.employers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cvs_updated_at
    BEFORE UPDATE ON public.cvs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_sections_updated_at
    BEFORE UPDATE ON public.cv_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON public.interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CV LOCKING FUNCTION
-- ============================================
-- Automatically lock CV when jobseeker becomes visible
CREATE OR REPLACE FUNCTION sync_cv_lock_with_visibility()
RETURNS TRIGGER AS $$
BEGIN
    -- When visibility changes, update CV lock status
    UPDATE public.cvs
    SET is_locked = NEW.is_visible
    WHERE jobseeker_id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_cv_lock_on_visibility_change
    AFTER UPDATE OF is_visible ON public.jobseekers
    FOR EACH ROW
    WHEN (OLD.is_visible IS DISTINCT FROM NEW.is_visible)
    EXECUTE FUNCTION sync_cv_lock_with_visibility();

-- ============================================
-- PROFILE COMPLETENESS CALCULATION
-- ============================================
CREATE OR REPLACE FUNCTION calculate_profile_completeness(jobseeker_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completeness INTEGER := 0;
    section_count INTEGER;
    js RECORD;
BEGIN
    SELECT * INTO js FROM public.jobseekers WHERE id = jobseeker_id_param;

    IF js IS NULL THEN
        RETURN 0;
    END IF;

    -- Basic info (30 points)
    IF js.full_name IS NOT NULL AND js.full_name != '' THEN completeness := completeness + 10; END IF;
    IF js.preferred_role IS NOT NULL AND js.preferred_role != '' THEN completeness := completeness + 10; END IF;
    IF js.city IS NOT NULL AND js.city != '' THEN completeness := completeness + 5; END IF;
    IF js.bio IS NOT NULL AND js.bio != '' THEN completeness := completeness + 5; END IF;

    -- CV sections (70 points)
    SELECT COUNT(DISTINCT section_type) INTO section_count
    FROM public.cv_sections cs
    JOIN public.cvs c ON c.id = cs.cv_id
    WHERE c.jobseeker_id = jobseeker_id_param
    AND jsonb_array_length(cs.content->'items') > 0;

    -- Each section type adds points (max 70)
    completeness := completeness + LEAST(section_count * 10, 70);

    RETURN LEAST(completeness, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CV VERSION INCREMENT FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION increment_cv_version(cv_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.cvs
    SET version = version + 1,
        updated_at = NOW()
    WHERE id = cv_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLEANUP: Remove saved_cvs entries after data retention period
-- (Optional: scheduled via Supabase cron or pg_cron)
-- ============================================
-- No auto-cleanup for saved_cvs - they must remain immutable
-- Manual cleanup can be done by admin if needed
