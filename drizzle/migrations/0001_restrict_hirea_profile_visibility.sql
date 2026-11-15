ALTER TABLE public.profiles ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;
DROP POLICY "Signed-in users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles shared with them" ON public.profiles FOR SELECT TO authenticated USING (
  auth.uid() = id
  OR is_public
  OR EXISTS (
    SELECT 1
    FROM public.applications
    INNER JOIN public.jobs ON public.jobs.id = public.applications.job_id
    WHERE public.applications.applicant_id = profiles.id
      AND public.jobs.employer_id = auth.uid()
  )
);