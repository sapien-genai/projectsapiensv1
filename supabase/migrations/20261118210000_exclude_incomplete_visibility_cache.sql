-- Serialize quota checks and reservation before any paid provider requests.
CREATE OR REPLACE FUNCTION public.reserve_visibility_report(
  p_domain text, p_url text, p_ip_hash text,
  p_daily_cap integer, p_ip_limit integer, p_cache_days integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  cached public.visibility_reports;
  reserved public.visibility_reports;
BEGIN
  PERFORM pg_advisory_xact_lock(7818112026);
  SELECT * INTO cached FROM public.visibility_reports
    WHERE domain = p_domain AND status = 'complete' AND reused_from IS NULL
      AND report->>'overall' IS NOT NULL
      AND report->'signals'->>'reachable' = 'true'
      AND created_at >= now() - make_interval(days => p_cache_days)
    ORDER BY created_at DESC LIMIT 1;
  IF cached.id IS NOT NULL THEN
    INSERT INTO public.visibility_reports(domain, url, ip_hash, status, report, reused_from, completed_at)
      VALUES (p_domain, p_url, p_ip_hash, 'complete', cached.report, cached.id, now()) RETURNING * INTO reserved;
  ELSE
    IF (SELECT count(*) FROM public.visibility_reports WHERE ip_hash = p_ip_hash AND reused_from IS NULL AND created_at >= now() - interval '24 hours') >= p_ip_limit THEN
      RETURN jsonb_build_object('limit', 'visitor');
    END IF;
    IF (SELECT count(*) FROM public.visibility_reports WHERE reused_from IS NULL AND created_at >= now() - interval '24 hours') >= p_daily_cap THEN
      RETURN jsonb_build_object('limit', 'global');
    END IF;
    INSERT INTO public.visibility_reports(domain, url, ip_hash, status, progress)
      VALUES (p_domain, p_url, p_ip_hash, 'running', 'site') RETURNING * INTO reserved;
  END IF;
  RETURN to_jsonb(reserved);
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_visibility_report(text, text, text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_visibility_report(text, text, text, integer, integer, integer) TO service_role;

