-- Align DB with app: investor role + lock down the v3 tables with RLS.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'investor';

CREATE OR REPLACE FUNCTION public.create_hirea_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account_role public.app_role;
BEGIN
  account_role := CASE NEW.raw_user_meta_data ->> 'account_type'
    WHEN 'employer' THEN 'employer'::public.app_role
    WHEN 'investor' THEN 'investor'::public.app_role
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

-- Read-only public showcase tables (no client writes).
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['virtual_pods','startups','escrow_ledger','hirea_bites','webinars'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

GRANT SELECT ON public.virtual_pods, public.startups, public.hirea_bites, public.webinars TO anon, authenticated;
CREATE POLICY "Anyone can view pods" ON public.virtual_pods FOR SELECT USING (true);
CREATE POLICY "Anyone can view startups" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Anyone can view bites" ON public.hirea_bites FOR SELECT USING (true);
CREATE POLICY "Anyone can view webinars" ON public.webinars FOR SELECT USING (true);
-- escrow_ledger: RLS on, no policies => private to service_role until real ownership columns exist.
