-- Only the new customer worker. Existing admin/Hotline study execution is untouched.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE FUNCTION public.dispatch_visibility_customer_worker() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE worker_url text; worker_secret text;
BEGIN
 SELECT decrypted_secret INTO worker_url FROM vault.decrypted_secrets WHERE name='visibility_customer_worker_url' LIMIT 1;
 SELECT decrypted_secret INTO worker_secret FROM vault.decrypted_secrets WHERE name='visibility_customer_worker_secret' LIMIT 1;
 IF worker_url IS NULL OR worker_secret IS NULL THEN RETURN; END IF;
 IF NOT EXISTS(SELECT 1 FROM visibility_customer_jobs WHERE status IN ('queued','running')) THEN RETURN; END IF;
 PERFORM net.http_post(url:=worker_url,headers:=jsonb_build_object('Content-Type','application/json','x-visibility-worker',worker_secret),body:='{}'::jsonb,timeout_milliseconds:=180000);
END $$;
REVOKE ALL ON FUNCTION public.dispatch_visibility_customer_worker() FROM PUBLIC,anon,authenticated;
SELECT cron.schedule('visibility-customer-worker','* * * * *','SELECT public.dispatch_visibility_customer_worker()');
