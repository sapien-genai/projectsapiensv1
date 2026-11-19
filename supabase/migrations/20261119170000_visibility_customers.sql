-- Separate customer product. No changes to admin studies, their quotas, or Hotline runs.
CREATE TABLE public.visibility_customers (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 stripe_customer_id text UNIQUE, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.visibility_projects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id),
 report_id uuid NOT NULL REFERENCES public.visibility_reports(id), domain text NOT NULL, business_name text NOT NULL,
 report jsonb NOT NULL, questions jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,domain)
);
CREATE TABLE public.visibility_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.visibility_projects(id),
 user_id uuid NOT NULL REFERENCES auth.users(id), product text NOT NULL CHECK(product IN ('fix','tracking')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','canceled','refunded')),
 stripe_session_id text UNIQUE, stripe_subscription_id text UNIQUE, stripe_payment_intent_id text,
 paid_until timestamptz, cancel_at_period_end boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz
);
CREATE UNIQUE INDEX visibility_one_open_order ON public.visibility_orders(project_id,product) WHERE status IN ('pending','paid');
CREATE TABLE public.visibility_customer_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.visibility_projects(id),
 order_id uuid NOT NULL REFERENCES public.visibility_orders(id), kind text NOT NULL CHECK(kind IN ('fix','tracking')),
 period_key text NOT NULL, status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','complete','partial','failed','canceled')),
 questions jsonb NOT NULL, config jsonb NOT NULL DEFAULT '{}', result jsonb, error text,
 created_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, UNIQUE(order_id,period_key)
);
CREATE TABLE public.visibility_customer_tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), job_id uuid NOT NULL REFERENCES public.visibility_customer_jobs(id),
 question_id text NOT NULL, provider text NOT NULL, prompt text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','running','succeeded','failed')),
 answer text, citations jsonb NOT NULL DEFAULT '[]', mentioned boolean, cited boolean, model text, searched boolean,
 error text, started_at timestamptz, finished_at timestamptz, UNIQUE(job_id,question_id,provider)
);
CREATE TABLE public.visibility_customer_usage (
 id uuid PRIMARY KEY, task_id uuid NOT NULL REFERENCES public.visibility_customer_tasks(id), entry jsonb NOT NULL
);
CREATE TABLE public.visibility_customer_changes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.visibility_projects(id),
 note text NOT NULL CHECK(length(note) BETWEEN 1 AND 2000), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.visibility_payment_events (id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['visibility_customers','visibility_projects','visibility_orders','visibility_customer_jobs','visibility_customer_tasks','visibility_customer_usage','visibility_customer_changes','visibility_payment_events'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon,authenticated',t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;
-- Owner reads only. All writes validate identity/entitlements in the server functions.
GRANT SELECT ON public.visibility_projects,public.visibility_orders,public.visibility_customer_jobs,public.visibility_customer_tasks,public.visibility_customer_changes TO authenticated;
CREATE POLICY own_project ON public.visibility_projects FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY own_order ON public.visibility_orders FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY own_job ON public.visibility_customer_jobs FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.visibility_projects p WHERE p.id=project_id AND p.user_id=auth.uid()));
CREATE POLICY own_task ON public.visibility_customer_tasks FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.visibility_customer_jobs j JOIN public.visibility_projects p ON p.id=j.project_id WHERE j.id=job_id AND p.user_id=auth.uid()));
CREATE POLICY own_change ON public.visibility_customer_changes FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.visibility_projects p WHERE p.id=project_id AND p.user_id=auth.uid()));

CREATE FUNCTION public.queue_visibility_customer_job(p_order uuid,p_period text,p_config jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o visibility_orders; p visibility_projects; j uuid; q jsonb; provider text;
BEGIN
 SELECT * INTO o FROM visibility_orders WHERE id=p_order FOR UPDATE;
 IF o.status!='paid' OR (o.product='tracking' AND (o.paid_until IS NULL OR o.paid_until<=now())) THEN RETURN NULL; END IF;
 SELECT * INTO p FROM visibility_projects WHERE id=o.project_id;
 INSERT INTO visibility_customer_jobs(project_id,order_id,kind,period_key,questions,config)
 VALUES(p.id,o.id,o.product,p_period,p.questions,p_config) ON CONFLICT(order_id,period_key) DO NOTHING RETURNING id INTO j;
 IF j IS NULL THEN SELECT id INTO j FROM visibility_customer_jobs WHERE order_id=o.id AND period_key=p_period; RETURN j; END IF;
 IF o.product='fix' THEN
  INSERT INTO visibility_customer_tasks(job_id,question_id,provider,prompt) VALUES(j,'package','chatgpt','Generate the purchased fix package.');
 ELSE
  FOR q IN SELECT * FROM jsonb_array_elements(p.questions) LOOP
   FOREACH provider IN ARRAY ARRAY['chatgpt','claude','gemini'] LOOP
    INSERT INTO visibility_customer_tasks(job_id,question_id,provider,prompt) VALUES(j,q->>'id',provider,q->>'text');
   END LOOP;
  END LOOP;
 END IF;
 RETURN j;
END $$;

CREATE FUNCTION public.claim_visibility_customer_task(p_daily_limit integer DEFAULT 300) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t visibility_customer_tasks;
BEGIN
 PERFORM pg_advisory_xact_lock(1911202601);
 UPDATE visibility_customer_jobs j SET status='canceled',finished_at=now(),error='Purchase canceled or refunded.'
 WHERE j.status IN ('queued','running') AND EXISTS(SELECT 1 FROM visibility_orders o WHERE o.id=j.order_id AND o.status IN ('canceled','refunded'));
 -- Never repeat a potentially billed interrupted request.
 UPDATE visibility_customer_tasks SET status='failed',error='Request interrupted; billing may be incomplete.',finished_at=now() WHERE status='running' AND started_at<now()-interval '4 minutes';
 UPDATE visibility_customer_jobs j SET status=CASE WHEN EXISTS(SELECT 1 FROM visibility_customer_tasks task_row WHERE task_row.job_id=j.id AND task_row.status='failed') THEN 'partial' ELSE 'complete' END,finished_at=now()
 WHERE j.status IN ('queued','running') AND NOT EXISTS(SELECT 1 FROM visibility_customer_tasks task_row WHERE task_row.job_id=j.id AND task_row.status IN ('pending','running'));
 IF (SELECT count(*) FROM visibility_customer_tasks WHERE started_at>now()-interval '24 hours')>=least(greatest(p_daily_limit,1),300) THEN RETURN NULL; END IF;
 SELECT t0.* INTO t FROM visibility_customer_tasks t0 JOIN visibility_customer_jobs j ON j.id=t0.job_id JOIN visibility_orders o ON o.id=j.order_id
 WHERE t0.status='pending' AND j.status IN ('queued','running') AND o.status='paid'
 AND (o.product='fix' OR o.paid_until>now()) ORDER BY j.created_at,t0.question_id,t0.provider LIMIT 1 FOR UPDATE OF t0 SKIP LOCKED;
 IF t.id IS NULL THEN RETURN NULL; END IF;
 UPDATE visibility_customer_tasks SET status='running',started_at=now() WHERE id=t.id RETURNING * INTO t;
 UPDATE visibility_customer_jobs SET status='running' WHERE id=t.job_id;
 RETURN to_jsonb(t);
END $$;

-- Atomic event processing: a failed transaction is retryable; duplicate deliveries are harmless.
CREATE FUNCTION public.fulfill_visibility_order(p_event text,p_order uuid,p_session text,p_payment text,p_subscription text,p_until timestamptz,p_config jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o visibility_orders; period text;
BEGIN
 INSERT INTO visibility_payment_events(id) VALUES(p_event) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN; END IF;
 SELECT * INTO o FROM visibility_orders WHERE id=p_order FOR UPDATE;
 IF o.id IS NULL OR (o.stripe_session_id IS NOT NULL AND p_session IS NOT NULL AND o.stripe_session_id!=p_session) THEN RAISE EXCEPTION 'Order mismatch'; END IF;
 IF o.status IN ('refunded','canceled') THEN RETURN; END IF;
 IF o.product='tracking' AND (p_subscription IS NULL OR p_until IS NULL) THEN RAISE EXCEPTION 'Missing subscription period'; END IF;
 UPDATE visibility_orders SET status='paid',paid_at=coalesce(paid_at,now()),stripe_session_id=coalesce(stripe_session_id,p_session),stripe_payment_intent_id=coalesce(p_payment,stripe_payment_intent_id),stripe_subscription_id=coalesce(p_subscription,stripe_subscription_id),paid_until=greatest(paid_until,p_until) WHERE id=o.id;
 period:=CASE WHEN o.product='fix' THEN 'package-v1' ELSE p_until::text END;
 PERFORM queue_visibility_customer_job(o.id,period,p_config);
END $$;
REVOKE ALL ON FUNCTION public.queue_visibility_customer_job(uuid,text,jsonb),public.claim_visibility_customer_task(integer),public.fulfill_visibility_order(text,uuid,text,text,text,timestamptz,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.queue_visibility_customer_job(uuid,text,jsonb),public.claim_visibility_customer_task(integer),public.fulfill_visibility_order(text,uuid,text,text,text,timestamptz,jsonb) TO service_role;
