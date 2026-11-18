-- Costs stay separate from public reports and leads. Only existing admins can read.
ALTER TABLE public.visibility_reports
  ADD COLUMN cost_tracking_started_at timestamptz,
  ADD COLUMN cost_tracking_finished_at timestamptz;
CREATE TABLE public.visibility_report_usage (
  id uuid PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES public.visibility_reports(id),
  provider text NOT NULL CHECK (provider IN ('openai','anthropic','gemini')),
  requested_model text NOT NULL, model text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('assistant','analysis')),
  status text NOT NULL CHECK (status IN ('pending','succeeded','failed')),
  started_at timestamptz NOT NULL, finished_at timestamptz, http_status integer,
  input_tokens bigint, cached_tokens bigint, output_tokens bigint, reasoning_tokens bigint, cache_write_tokens bigint,
  searches integer, search_basis text NOT NULL,
  token_cost_usd numeric(18,9), search_cost_usd numeric(18,9), estimated_cost_usd numeric(18,9),
  pricing_version text NOT NULL, rates jsonb, usage jsonb, notes jsonb NOT NULL DEFAULT '[]'
);
CREATE INDEX visibility_report_usage_report_idx ON public.visibility_report_usage(report_id);
ALTER TABLE public.visibility_report_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.visibility_report_usage FROM anon, authenticated;
GRANT SELECT ON public.visibility_report_usage TO authenticated;
GRANT ALL ON public.visibility_report_usage TO service_role;
CREATE POLICY "admins read visibility costs" ON public.visibility_report_usage FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid() AND role IN ('super_admin','admin')));
