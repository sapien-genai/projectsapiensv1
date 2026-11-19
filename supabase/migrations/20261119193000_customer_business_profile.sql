-- Business context is separate from the saved report and fixed measurement questions.
ALTER TABLE public.visibility_projects ADD COLUMN business_profile jsonb;
