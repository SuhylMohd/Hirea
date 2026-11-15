CREATE TYPE public.app_role AS ENUM ('candidate', 'employer', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  resume_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_hirea_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account_role public.app_role;
BEGIN
  account_role := CASE
    WHEN NEW.raw_user_meta_data ->> 'account_type' = 'employer' THEN 'employer'::public.app_role
    ELSE 'candidate'::public.app_role
  END;
  INSERT INTO public.profiles (id, full_name, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, account_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER hirea_create_profile_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_hirea_profile_for_new_user();

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Engineering',
  workplace TEXT NOT NULL DEFAULT 'Remote',
  employment_type TEXT NOT NULL DEFAULT 'Full-time',
  location TEXT NOT NULL DEFAULT '',
  salary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published jobs are publicly visible" ON public.jobs FOR SELECT TO anon, authenticated USING (status = 'published' OR employer_id = auth.uid());
CREATE POLICY "Employers can post their own jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (employer_id = auth.uid() AND public.has_role(auth.uid(), 'employer'));
CREATE POLICY "Employers can update their own jobs" ON public.jobs FOR UPDATE TO authenticated USING (employer_id = auth.uid() AND public.has_role(auth.uid(), 'employer')) WITH CHECK (employer_id = auth.uid() AND public.has_role(auth.uid(), 'employer'));
CREATE POLICY "Employers can delete their own jobs" ON public.jobs FOR DELETE TO authenticated USING (employer_id = auth.uid() AND public.has_role(auth.uid(), 'employer'));
CREATE INDEX jobs_status_created_at_idx ON public.jobs(status, created_at DESC);

INSERT INTO public.jobs (title, company, category, workplace, employment_type, location, salary, description, skills, status) VALUES
('Senior Full-Stack Engineer', 'FinEdge Payments India', 'Engineering', 'Hybrid', 'Full-time', 'Kochi / Remote', '₹18L – ₹26L / year', 'Build resilient checkout experiences and distributed services for a growing payments team.', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], 'published'),
('Lead Product Designer', 'CloudScale Studio', 'Design', 'Remote', 'Full-time', 'India · Remote', '₹15L – ₹22L / year', 'Shape the end-to-end experience and design system for a new generation of analytics products.', ARRAY['Figma', 'Product design', 'Design systems', 'Accessibility'], 'published'),
('Applied AI & LLM Specialist', 'NovaMind Labs', 'Data & AI', 'Remote', 'Contract', 'Bengaluru / Remote', '₹1.4L / month', 'Build production-ready retrieval workflows and practical evaluation tools for customer-facing AI.', ARRAY['Python', 'RAG', 'FastAPI', 'Vector databases'], 'published'),
('Frontend UI Engineer', 'Veloce Commerce', 'Engineering', 'On-site', 'Full-time', 'Thiruvananthapuram', '₹10L – ₹15L / year', 'Craft fast, accessible storefront experiences for a growing digital commerce platform.', ARRAY['Next.js', 'Tailwind CSS', 'JavaScript', 'Web performance'], 'published'),
('Growth Marketing Lead', 'OrbitSaaS', 'Marketing', 'Hybrid', 'Full-time', 'Chennai / Remote', '₹12L – ₹17L / year', 'Grow organic acquisition and launch community-led campaigns for an ambitious SaaS team.', ARRAY['Product marketing', 'SEO', 'Analytics', 'Growth'], 'published'),
('Cloud & Kubernetes Architect', 'KubeGrid Systems', 'Engineering', 'Remote', 'Full-time', 'Hyderabad / Remote', '₹28L – ₹38L / year', 'Lead resilient cloud infrastructure, platform automation, and reliability initiatives.', ARRAY['Kubernetes', 'Terraform', 'AWS', 'Go'], 'published');

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'interview', 'declined', 'hired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, applicant_id)
);
GRANT SELECT, INSERT ON public.applications TO authenticated;
GRANT UPDATE (status) ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants and job owners can view applications" ON public.applications FOR SELECT TO authenticated
USING (
  applicant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.jobs
    WHERE public.jobs.id = applications.job_id AND public.jobs.employer_id = auth.uid()
  )
);
CREATE POLICY "Candidates can apply to published jobs" ON public.applications FOR INSERT TO authenticated
WITH CHECK (
  applicant_id = auth.uid()
  AND public.has_role(auth.uid(), 'candidate')
  AND EXISTS (SELECT 1 FROM public.jobs WHERE public.jobs.id = applications.job_id AND public.jobs.status = 'published')
);
CREATE POLICY "Employers can update application status" ON public.applications FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE public.jobs.id = applications.job_id AND public.jobs.employer_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.jobs WHERE public.jobs.id = applications.job_id AND public.jobs.employer_id = auth.uid())
);
CREATE INDEX applications_applicant_created_idx ON public.applications(applicant_id, created_at DESC);
CREATE INDEX applications_job_created_idx ON public.applications(job_id, created_at DESC);