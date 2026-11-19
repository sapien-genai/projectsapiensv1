-- Latest saved instant check is independent of the purchase snapshot and fixed questions.
ALTER TABLE public.visibility_projects
 ADD COLUMN latest_report_id uuid REFERENCES public.visibility_reports(id),
 ADD COLUMN latest_report_generated_at timestamptz;
