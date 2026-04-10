-- USERS TABLE (FIXED)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,  -- ❗ NO default, must match auth.users.id
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

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    github_repo TEXT NOT NULL,
    problem_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own submissions"
ON public.submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own submissions"
ON public.submissions
FOR SELECT
USING (auth.uid() = user_id);

-- =====================================
-- STORAGE BUCKET RLS POLICIES
-- =====================================

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