-- SeaVitae Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobseekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can read their own record
CREATE POLICY "Users can read own record"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own record"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Service role can insert users (during signup)
CREATE POLICY "Service role can insert users"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- JOBSEEKERS TABLE POLICIES
-- ============================================

-- Jobseekers can read their own profile
CREATE POLICY "Jobseekers can read own profile"
    ON public.jobseekers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.id = jobseekers.user_id
        )
    );

-- Employers can read VISIBLE jobseeker profiles only
CREATE POLICY "Employers can read visible profiles"
    ON public.jobseekers FOR SELECT
    USING (
        is_visible = TRUE
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'employer'
        )
    );

-- Jobseekers can insert their own profile
CREATE POLICY "Jobseekers can insert own profile"
    ON public.jobseekers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.id = jobseekers.user_id
            AND users.role = 'jobseeker'
        )
    );

-- Jobseekers can update their own profile
CREATE POLICY "Jobseekers can update own profile"
    ON public.jobseekers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.id = jobseekers.user_id
        )
    );

-- Jobseekers can delete their own profile
CREATE POLICY "Jobseekers can delete own profile"
    ON public.jobseekers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.id = jobseekers.user_id
        )
    );

-- ============================================
-- EMPLOYERS TABLE POLICIES
-- ============================================

-- Employers can read their own profile
CREATE POLICY "Employers can read own profile"
    ON public.employers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.id = employers.user_id
        )
    );

-- Jobseekers can read employer profiles (to see who's viewing/messaging)
CREATE POLICY "Jobseekers can read employer profiles"
    ON public.employers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'jobseeker'
        )
    );

-- Employers can insert their own profile
CREATE POLICY "Employers can insert own profile"
    ON public.employers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.id = employers.user_id
            AND users.role = 'employer'
        )
    );

-- Employers can update their own profile
CREATE POLICY "Employers can update own profile"
    ON public.employers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.id = employers.user_id
        )
    );

-- ============================================
-- CVS TABLE POLICIES
-- ============================================

-- Jobseekers can read their own CVs
CREATE POLICY "Jobseekers can read own CVs"
    ON public.cvs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.jobseekers js
            JOIN public.users u ON u.id = js.user_id
            WHERE js.id = cvs.jobseeker_id
            AND u.id = auth.uid()
        )
    );

-- Employers can read CVs of visible jobseekers
CREATE POLICY "Employers can read visible CVs"
    ON public.cvs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.jobseekers js
            WHERE js.id = cvs.jobseeker_id
            AND js.is_visible = TRUE
        )
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'employer'
        )
    );

-- Jobseekers can insert their own CVs
CREATE POLICY "Jobseekers can insert own CVs"
    ON public.cvs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.jobseekers js
            JOIN public.users u ON u.id = js.user_id
            WHERE js.id = cvs.jobseeker_id
            AND u.id = auth.uid()
        )
    );

-- Jobseekers can update their own CVs (only when not locked)
CREATE POLICY "Jobseekers can update own unlocked CVs"
    ON public.cvs FOR UPDATE
    USING (
        is_locked = FALSE
        AND EXISTS (
            SELECT 1 FROM public.jobseekers js
            JOIN public.users u ON u.id = js.user_id
            WHERE js.id = cvs.jobseeker_id
            AND u.id = auth.uid()
        )
    );

-- Jobseekers can delete their own CVs
CREATE POLICY "Jobseekers can delete own CVs"
    ON public.cvs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.jobseekers js
            JOIN public.users u ON u.id = js.user_id
            WHERE js.id = cvs.jobseeker_id
            AND u.id = auth.uid()
        )
    );

-- ============================================
-- CV_SECTIONS TABLE POLICIES
-- ============================================

-- Jobseekers can read their own CV sections
CREATE POLICY "Jobseekers can read own CV sections"
    ON public.cv_sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cvs c
            JOIN public.jobseekers js ON js.id = c.jobseeker_id
            JOIN public.users u ON u.id = js.user_id
            WHERE c.id = cv_sections.cv_id
            AND u.id = auth.uid()
        )
    );

-- Employers can read CV sections of visible jobseekers
CREATE POLICY "Employers can read visible CV sections"
    ON public.cv_sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cvs c
            JOIN public.jobseekers js ON js.id = c.jobseeker_id
            WHERE c.id = cv_sections.cv_id
            AND js.is_visible = TRUE
        )
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'employer'
        )
    );

-- Jobseekers can insert their own CV sections
CREATE POLICY "Jobseekers can insert own CV sections"
    ON public.cv_sections FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cvs c
            JOIN public.jobseekers js ON js.id = c.jobseeker_id
            JOIN public.users u ON u.id = js.user_id
            WHERE c.id = cv_sections.cv_id
            AND u.id = auth.uid()
            AND c.is_locked = FALSE
        )
    );

-- Jobseekers can update their own CV sections (only when CV not locked)
CREATE POLICY "Jobseekers can update own CV sections"
    ON public.cv_sections FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cvs c
            JOIN public.jobseekers js ON js.id = c.jobseeker_id
            JOIN public.users u ON u.id = js.user_id
            WHERE c.id = cv_sections.cv_id
            AND u.id = auth.uid()
            AND c.is_locked = FALSE
        )
    );

-- Jobseekers can delete their own CV sections
CREATE POLICY "Jobseekers can delete own CV sections"
    ON public.cv_sections FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.cvs c
            JOIN public.jobseekers js ON js.id = c.jobseeker_id
            JOIN public.users u ON u.id = js.user_id
            WHERE c.id = cv_sections.cv_id
            AND u.id = auth.uid()
        )
    );

-- ============================================
-- SAVED_CVS TABLE POLICIES
-- (Immutable snapshots - no UPDATE allowed)
-- ============================================

-- Employers can read their own saved CVs
CREATE POLICY "Employers can read own saved CVs"
    ON public.saved_cvs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employers e
            JOIN public.users u ON u.id = e.user_id
            WHERE e.id = saved_cvs.employer_id
            AND u.id = auth.uid()
        )
    );

-- Jobseekers can see who saved their CV (but not snapshot content)
-- Note: This is a limited read - frontend should filter what's exposed
CREATE POLICY "Jobseekers can see saves of own CV"
    ON public.saved_cvs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.jobseekers js
            JOIN public.users u ON u.id = js.user_id
            WHERE js.id = saved_cvs.jobseeker_id
            AND u.id = auth.uid()
        )
    );

-- Employers can save CVs (insert only, immutable)
CREATE POLICY "Employers can save CVs"
    ON public.saved_cvs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employers e
            JOIN public.users u ON u.id = e.user_id
            WHERE e.id = saved_cvs.employer_id
            AND u.id = auth.uid()
        )
        -- Can only save visible CVs
        AND EXISTS (
            SELECT 1 FROM public.jobseekers js
            WHERE js.id = saved_cvs.jobseeker_id
            AND js.is_visible = TRUE
        )
    );

-- Employers can delete their saved CVs
CREATE POLICY "Employers can delete own saved CVs"
    ON public.saved_cvs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.employers e
            JOIN public.users u ON u.id = e.user_id
            WHERE e.id = saved_cvs.employer_id
            AND u.id = auth.uid()
        )
    );

-- NO UPDATE policy for saved_cvs - snapshots are immutable!

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages"
    ON public.messages FOR SELECT
    USING (
        auth.uid() = sender_id OR auth.uid() = recipient_id
    );

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

-- Recipients can update messages (mark as read)
CREATE POLICY "Recipients can update messages"
    ON public.messages FOR UPDATE
    USING (
        auth.uid() = recipient_id
    );

-- Senders can delete their own messages
CREATE POLICY "Senders can delete own messages"
    ON public.messages FOR DELETE
    USING (
        auth.uid() = sender_id
    );

-- ============================================
-- INTERVIEWS TABLE POLICIES
-- ============================================

-- Employers can read interviews they created
CREATE POLICY "Employers can read own interviews"
    ON public.interviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employers e
            JOIN public.users u ON u.id = e.user_id
            WHERE e.id = interviews.employer_id
            AND u.id = auth.uid()
        )
    );

-- Jobseekers can read interviews sent to them
CREATE POLICY "Jobseekers can read own interviews"
    ON public.interviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.jobseekers js
            JOIN public.users u ON u.id = js.user_id
            WHERE js.id = interviews.jobseeker_id
            AND u.id = auth.uid()
        )
    );

-- Employers can create interview requests
CREATE POLICY "Employers can create interviews"
    ON public.interviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employers e
            JOIN public.users u ON u.id = e.user_id
            WHERE e.id = interviews.employer_id
            AND u.id = auth.uid()
        )
        -- Can only request interviews with visible jobseekers
        AND EXISTS (
            SELECT 1 FROM public.jobseekers js
            WHERE js.id = interviews.jobseeker_id
            AND js.is_visible = TRUE
        )
    );

-- Employers can update their own interview requests
CREATE POLICY "Employers can update own interviews"
    ON public.interviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.employers e
            JOIN public.users u ON u.id = e.user_id
            WHERE e.id = interviews.employer_id
            AND u.id = auth.uid()
        )
    );

-- Jobseekers can respond to interviews (update status)
CREATE POLICY "Jobseekers can respond to interviews"
    ON public.interviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.jobseekers js
            JOIN public.users u ON u.id = js.user_id
            WHERE js.id = interviews.jobseeker_id
            AND u.id = auth.uid()
        )
    );

-- Employers can cancel their interviews
CREATE POLICY "Employers can delete interviews"
    ON public.interviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.employers e
            JOIN public.users u ON u.id = e.user_id
            WHERE e.id = interviews.employer_id
            AND u.id = auth.uid()
        )
    );

-- ============================================
-- INVITES TABLE POLICIES
-- ============================================

-- Anyone can read invite by code (for validation)
CREATE POLICY "Anyone can read invites by code"
    ON public.invites FOR SELECT
    USING (TRUE);

-- Users can create invites
CREATE POLICY "Users can create invites"
    ON public.invites FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
    );

-- Only service role can update invites (mark as used)
-- Handled via admin client

-- ============================================
-- SPECIAL: PDF DOWNLOAD RESTRICTION
-- ============================================
-- Note: PDF download is handled at the application layer.
-- The CV data is readable by employers (visible profiles only),
-- but the download functionality is restricted to jobseekers
-- in the frontend/API layer.
--
-- Additional security: We do NOT expose raw CV file storage
-- to employers. PDFs are generated on-demand for jobseekers only.
