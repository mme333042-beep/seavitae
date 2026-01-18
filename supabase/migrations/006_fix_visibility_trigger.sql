-- Fix for visibility toggle errors:
-- 1. "record 'new' has no field 'is_locked'"
-- 2. "stack depth limit exceeded"
--
-- Solution: Remove the automatic CV locking trigger entirely.
-- CV edit restrictions are handled in the application layer via isCVEditable checks.
-- This avoids trigger/RLS policy conflicts.

-- Drop the trigger first
DROP TRIGGER IF EXISTS sync_cv_lock_on_visibility_change ON public.jobseekers;

-- Drop the function
DROP FUNCTION IF EXISTS sync_cv_lock_with_visibility() CASCADE;
