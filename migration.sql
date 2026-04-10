-- =============================================
-- MIGRATION: Add scoring columns to submissions
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This is SAFE to run on existing tables — it only adds what's missing.
-- =============================================

-- 1. Add missing columns to submissions table
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS repo_summary TEXT,
  ADD COLUMN IF NOT EXISTS resume_summary TEXT,
  ADD COLUMN IF NOT EXISTS score NUMERIC,
  ADD COLUMN IF NOT EXISTS repo_score NUMERIC,
  ADD COLUMN IF NOT EXISTS resume_score NUMERIC,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add check constraint on status (ignore if already exists)
DO $$
BEGIN
  ALTER TABLE public.submissions
    ADD CONSTRAINT submissions_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Add check constraint on problem_number (ignore if already exists)
DO $$
BEGIN
  ALTER TABLE public.submissions
    ADD CONSTRAINT submissions_problem_number_check
    CHECK (problem_number >= 1 AND problem_number <= 7);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS submissions_updated_at ON public.submissions;
CREATE TRIGGER submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- 5. Add RLS policy: allow reading all submissions (for admin portal)
DO $$
BEGIN
  CREATE POLICY "Allow public read of all submissions"
  ON public.submissions
  FOR SELECT
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 6. Add RLS policy: allow service role to update (for Edge Function)
DO $$
BEGIN
  CREATE POLICY "Service role can update submissions"
  ON public.submissions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 7. Add admin read policy for users table (for join queries)
DO $$
BEGIN
  CREATE POLICY "Allow public read of users"
  ON public.users
  FOR SELECT
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Done! ✅
SELECT 'Migration complete!' AS result;
