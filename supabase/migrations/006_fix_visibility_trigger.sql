-- Fix for visibility toggle error: "record 'new' has no field 'is_locked'"
-- This migration recreates the sync_cv_lock_with_visibility function
-- to ensure it correctly references NEW.is_visible (not NEW.is_locked)

-- Drop and recreate the trigger function
DROP FUNCTION IF EXISTS sync_cv_lock_with_visibility() CASCADE;

CREATE OR REPLACE FUNCTION sync_cv_lock_with_visibility()
RETURNS TRIGGER AS $$
BEGIN
    -- When visibility changes on jobseekers table, update CV lock status
    -- NEW refers to the jobseekers record, which has is_visible (not is_locked)
    -- We SET is_locked on the cvs table to match the jobseeker's visibility
    UPDATE public.cvs
    SET is_locked = NEW.is_visible
    WHERE jobseeker_id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (was dropped with CASCADE above)
CREATE TRIGGER sync_cv_lock_on_visibility_change
    AFTER UPDATE OF is_visible ON public.jobseekers
    FOR EACH ROW
    WHEN (OLD.is_visible IS DISTINCT FROM NEW.is_visible)
    EXECUTE FUNCTION sync_cv_lock_with_visibility();
