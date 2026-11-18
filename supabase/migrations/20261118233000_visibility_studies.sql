CREATE TABLE public.visibility_studies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, business_name text NOT NULL,
 domain text NOT NULL, url text NOT NULL, questions jsonb NOT NULL CHECK(jsonb_array_length(questions) BETWEEN 3 AND 20),
 competitors jsonb NOT NULL DEFAULT '[]', context text NOT NULL DEFAULT '', created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.visibility_study_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), study_id uuid NOT NULL REFERENCES public.visibility_studies(id), created_by uuid NOT NULL,
 phase text NOT NULL CHECK(phase IN ('baseline','followup')), label text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'running' CHECK(status IN ('running','complete','partial')),
 questions jsonb NOT NULL, config jsonb NOT NULL, site_snapshot jsonb, quota_units integer NOT NULL CHECK(quota_units BETWEEN 1 AND 7),
 created_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, cost_tracking_started_at timestamptz NOT NULL DEFAULT now(), cost_tracking_finished_at timestamptz
);
CREATE UNIQUE INDEX visibility_study_one_active ON public.visibility_study_runs(study_id) WHERE status='running';
CREATE INDEX visibility_study_run_history ON public.visibility_study_runs(study_id,created_at DESC);
CREATE TABLE public.visibility_study_answers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), run_id uuid NOT NULL REFERENCES public.visibility_study_runs(id), question_id text NOT NULL,
 provider text NOT NULL CHECK(provider IN ('chatgpt','claude','gemini')), prompt text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','running','succeeded','failed')),
 answer text, citations jsonb NOT NULL DEFAULT '[]', searched boolean, model text, mentioned boolean, cited boolean, competitors jsonb NOT NULL DEFAULT '[]', error text,
 started_at timestamptz, finished_at timestamptz, review text NOT NULL DEFAULT 'unreviewed' CHECK(review IN ('unreviewed','accurate','inaccurate')), review_note text,
 UNIQUE(run_id,question_id,provider)
);
CREATE TABLE public.visibility_study_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), study_id uuid NOT NULL REFERENCES public.visibility_studies(id), run_id uuid REFERENCES public.visibility_study_runs(id),
 kind text NOT NULL CHECK(kind IN ('change','observation','review')), note text NOT NULL, evidence_url text, occurred_at timestamptz NOT NULL, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visibility_report_usage ALTER COLUMN report_id DROP NOT NULL;
ALTER TABLE public.visibility_report_usage ADD COLUMN study_run_id uuid REFERENCES public.visibility_study_runs(id), ADD COLUMN study_answer_id uuid REFERENCES public.visibility_study_answers(id),
 ADD CONSTRAINT visibility_usage_one_owner CHECK(num_nonnulls(report_id,study_run_id)=1);
CREATE INDEX visibility_usage_study_idx ON public.visibility_report_usage(study_run_id);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['visibility_studies','visibility_study_runs','visibility_study_answers','visibility_study_events'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
  EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
  EXECUTE format('CREATE POLICY "admins read studies" ON public.%I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id=auth.uid() AND role IN (''admin'',''super_admin'')))',t);
 END LOOP;
END $$;
CREATE FUNCTION public.freeze_visibility_study_definition() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF TG_TABLE_NAME='visibility_studies' THEN RAISE EXCEPTION 'Create a new study version to change its definition'; END IF;
 IF (NEW.study_id,NEW.questions,NEW.config,NEW.phase,NEW.created_at,NEW.created_by,NEW.quota_units) IS DISTINCT FROM (OLD.study_id,OLD.questions,OLD.config,OLD.phase,OLD.created_at,OLD.created_by,OLD.quota_units) THEN RAISE EXCEPTION 'Run definition is immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER freeze_visibility_study BEFORE UPDATE ON public.visibility_studies FOR EACH ROW EXECUTE FUNCTION public.freeze_visibility_study_definition();
CREATE TRIGGER freeze_visibility_run BEFORE UPDATE ON public.visibility_study_runs FOR EACH ROW EXECUTE FUNCTION public.freeze_visibility_study_definition();
CREATE FUNCTION public.reserve_visibility_study_run(p_study_id uuid,p_user_id uuid,p_phase text,p_label text,p_config jsonb,p_site jsonb,p_global_cap integer,p_admin_cap integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s visibility_studies; r visibility_study_runs; units integer; q jsonb; provider text;
BEGIN
 PERFORM pg_advisory_xact_lock(7818112026);
 SELECT * INTO s FROM visibility_studies WHERE id=p_study_id;
 IF s.id IS NULL THEN RAISE EXCEPTION 'Study not found'; END IF;
 SELECT * INTO r FROM visibility_study_runs WHERE study_id=s.id AND status='running';
 IF r.id IS NOT NULL THEN RETURN to_jsonb(r); END IF;
 units:=ceil(jsonb_array_length(s.questions)*3.0/9)::integer;
 IF (SELECT count(*) FROM visibility_study_runs WHERE created_by=p_user_id AND created_at>=now()-interval '24 hours')>=p_admin_cap THEN RETURN jsonb_build_object('limit','admin'); END IF;
 IF (SELECT count(*) FROM visibility_reports WHERE reused_from IS NULL AND created_at>=now()-interval '24 hours') + (SELECT coalesce(sum(quota_units),0) FROM visibility_study_runs WHERE created_at>=now()-interval '24 hours') + units > p_global_cap THEN RETURN jsonb_build_object('limit','global'); END IF;
 INSERT INTO visibility_study_runs(study_id,created_by,phase,label,questions,config,site_snapshot,quota_units)
 VALUES(s.id,p_user_id,p_phase,p_label,s.questions,p_config,p_site,units) RETURNING * INTO r;
 FOR q IN SELECT * FROM jsonb_array_elements(s.questions) LOOP
  FOREACH provider IN ARRAY ARRAY['chatgpt','claude','gemini'] LOOP
   INSERT INTO visibility_study_answers(run_id,question_id,provider,prompt) VALUES(r.id,q->>'id',provider,q->>'text');
  END LOOP;
 END LOOP;
 RETURN to_jsonb(r);
END $$;
CREATE FUNCTION public.claim_visibility_study_answer(p_run_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a visibility_study_answers;
BEGIN
 PERFORM 1 FROM visibility_study_runs WHERE id=p_run_id AND status='running' FOR UPDATE;
 IF NOT FOUND THEN RETURN NULL; END IF;
 -- Do not retry a timed-out call: it may have been billed. Preserve its pending cost record.
 UPDATE visibility_study_answers SET status='failed',error='Worker interrupted; cost may be incomplete.',finished_at=now() WHERE run_id=p_run_id AND status='running' AND started_at<now()-interval '3 minutes';
 SELECT * INTO a FROM visibility_study_answers WHERE run_id=p_run_id AND status='pending' ORDER BY question_id,provider LIMIT 1 FOR UPDATE SKIP LOCKED;
 IF a.id IS NOT NULL THEN UPDATE visibility_study_answers SET status='running',started_at=now() WHERE id=a.id RETURNING * INTO a; RETURN to_jsonb(a); END IF;
 IF NOT EXISTS(SELECT 1 FROM visibility_study_answers WHERE run_id=p_run_id AND status IN ('pending','running')) THEN
  UPDATE visibility_study_runs SET status=CASE WHEN EXISTS(SELECT 1 FROM visibility_study_answers WHERE run_id=p_run_id AND status='failed') THEN 'partial' ELSE 'complete' END,finished_at=now(),cost_tracking_finished_at=now() WHERE id=p_run_id;
 END IF;
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.reserve_visibility_study_run(uuid,uuid,text,text,jsonb,jsonb,integer,integer),public.claim_visibility_study_answer(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_visibility_study_run(uuid,uuid,text,text,jsonb,jsonb,integer,integer),public.claim_visibility_study_answer(uuid) TO service_role;
-- Existing instant reports share the same daily work budget with the larger study runs.
CREATE OR REPLACE FUNCTION public.reserve_visibility_report(p_domain text,p_url text,p_ip_hash text,p_daily_cap integer,p_ip_limit integer,p_cache_days integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cached visibility_reports; reserved visibility_reports;
BEGIN
 PERFORM pg_advisory_xact_lock(7818112026);
 SELECT * INTO cached FROM visibility_reports WHERE domain=p_domain AND status='complete' AND reused_from IS NULL AND report->>'overall' IS NOT NULL AND report->'signals'->>'reachable'='true' AND created_at>=now()-make_interval(days=>p_cache_days) ORDER BY created_at DESC LIMIT 1;
 IF cached.id IS NOT NULL THEN
  INSERT INTO visibility_reports(domain,url,ip_hash,status,report,reused_from,completed_at) VALUES(p_domain,p_url,p_ip_hash,'complete',cached.report,cached.id,now()) RETURNING * INTO reserved;
 ELSE
  IF (SELECT count(*) FROM visibility_reports WHERE ip_hash=p_ip_hash AND reused_from IS NULL AND created_at>=now()-interval '24 hours')>=p_ip_limit THEN RETURN jsonb_build_object('limit','visitor'); END IF;
  IF (SELECT count(*) FROM visibility_reports WHERE reused_from IS NULL AND created_at>=now()-interval '24 hours')+(SELECT coalesce(sum(quota_units),0) FROM visibility_study_runs WHERE created_at>=now()-interval '24 hours')>=p_daily_cap THEN RETURN jsonb_build_object('limit','global'); END IF;
  INSERT INTO visibility_reports(domain,url,ip_hash,status,progress) VALUES(p_domain,p_url,p_ip_hash,'running','site') RETURNING * INTO reserved;
 END IF;
 RETURN to_jsonb(reserved);
END $$;
