-- =============================================
-- TALENTFLOW DATABASE SCHEMA
-- =============================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,  -- Must match auth.users.id
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow reading all users (for admin join queries)
CREATE POLICY "Allow public read of users"
ON public.users
FOR SELECT
USING (true);

-- Function to insert user automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'Unknown Contestant'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =============================================
-- SUBMISSIONS TABLE (FULL SCHEMA)
-- =============================================
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    github_repo TEXT NOT NULL,
    problem_number INTEGER NOT NULL CHECK (problem_number >= 1 AND problem_number <= 7),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    repo_summary TEXT,
    resume_summary TEXT,
    score NUMERIC,
    repo_score NUMERIC,
    resume_score NUMERIC,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions"
ON public.submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON public.submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow reading all submissions (for admin portal)
CREATE POLICY "Allow public read of all submissions"
ON public.submissions
FOR SELECT
USING (true);

-- Allow service role to update submissions (for Edge Function)
CREATE POLICY "Service role can update submissions"
ON public.submissions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- =============================================
-- STORAGE BUCKET RLS POLICIES
-- =============================================

-- Allow authenticated users to upload files to the 'resumes' bucket
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid() = owner);

-- Allow public read access to 'resumes' (since we use getPublicUrl)
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resumes');