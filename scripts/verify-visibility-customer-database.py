"""Integration tests in a NEW disposable local database; never use a production DB.
Create sapiens_customer_test_20261119 in the local Supabase Postgres container first.
"""
import concurrent.futures,json,pathlib,subprocess,uuid
DB='sapiens_customer_test_20261119'
CONTAINER='supabase_db_Hotline-Sports'
def sql(statement, fail=False):
 p=subprocess.run(['docker','exec','-i',CONTAINER,'psql','-U','postgres','-d',DB,'-X','-At','-v','ON_ERROR_STOP=1'],input=statement,text=True,capture_output=True)
 if fail: return p.returncode!=0
 if p.returncode: raise RuntimeError(p.stderr)
 return p.stdout.strip()
assert sql('SELECT count(*) FROM information_schema.tables WHERE table_schema=\'public\'')=='0', 'Use a new empty test database'
sql('''CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
GRANT USAGE ON SCHEMA public,auth TO authenticated,anon,service_role;
CREATE TABLE public.visibility_reports(id uuid PRIMARY KEY);
''')
sql(pathlib.Path('supabase/migrations/20261119170000_visibility_customers.sql').read_text())
u1,u2,p,r,o=[str(uuid.uuid4()) for _ in range(5)]
questions=json.dumps([{'id':'q1','kind':'recognition','text':'Who is Acme?'},{'id':'q2','kind':'discovery','text':'Best bakeries?'},{'id':'q3','kind':'discovery','text':'Where to buy bread?'}])
sql(f"INSERT INTO auth.users VALUES('{u1}'),('{u2}'); INSERT INTO visibility_reports VALUES('{r}'); INSERT INTO visibility_projects(id,user_id,report_id,domain,business_name,report,questions) VALUES('{p}','{u1}','{r}','example.org','Acme','{{}}','{questions}'); INSERT INTO visibility_orders(id,project_id,user_id,product) VALUES('{o}','{p}','{u1}','tracking');")
assert sql(f"SELECT queue_visibility_customer_job('{o}','unpaid','{{}}')")=='', 'Unpaid work must not queue'
def fulfill(event='evt_paid'):
 return sql(f"SELECT fulfill_visibility_order('{event}','{o}',NULL,NULL,'sub_test',now()+interval '1 month','{{}}')")
# Use identical period timestamp: this is what a repeated invoice contains.
end=sql("SELECT (now()+interval '1 month')::text")
def repeat(_):return sql(f"SELECT fulfill_visibility_order('evt_paid','{o}',NULL,NULL,'sub_test','{end}','{{}}')")
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(repeat,range(6)))
assert sql('SELECT count(*) FROM visibility_customer_jobs')=='1'
assert sql('SELECT count(*) FROM visibility_customer_tasks')=='9'
j=sql('SELECT id FROM visibility_customer_jobs')
# Different event for same paid interval must also deduplicate.
sql(f"SELECT fulfill_visibility_order('evt_same_invoice','{o}',NULL,NULL,'sub_test','{end}','{{}}')")
assert sql('SELECT count(*) FROM visibility_customer_jobs')=='1'
for table in ['visibility_projects','visibility_orders','visibility_customer_jobs','visibility_customer_tasks']:
 assert sql(f"SET ROLE authenticated;SET request.jwt.claim.sub='{u2}';SELECT count(*) FROM {table}").splitlines()[-1]=='0'
 assert int(sql(f"SET ROLE authenticated;SET request.jwt.claim.sub='{u1}';SELECT count(*) FROM {table}").splitlines()[-1])>0
 assert sql(f"SELECT has_table_privilege('authenticated','{table}','INSERT,UPDATE,DELETE')")=='f'
assert sql("SELECT has_function_privilege('authenticated','claim_visibility_customer_task(integer)','EXECUTE')")=='f'
assert sql("SELECT has_function_privilege('anon','fulfill_visibility_order(text,uuid,text,text,text,timestamptz,jsonb)','EXECUTE')")=='f'
def claim(_):return json.loads(sql("SELECT coalesce(claim_visibility_customer_task(300),'null'::jsonb)"))
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:claims=list(pool.map(claim,range(12)))
claimed=[c for c in claims if c];assert len(claimed)==9 and len({c['id'] for c in claimed})==9
# Interrupted paid calls are preserved as failed, never requeued.
sql("UPDATE visibility_customer_tasks SET started_at=now()-interval '5 minutes' WHERE status='running'")
assert claim(0) is None
assert sql('SELECT DISTINCT status FROM visibility_customer_tasks')=='failed'
assert sql('SELECT status FROM visibility_customer_jobs')=='partial'
# Another billing month queues a new run, while caps and cancellation stop new work.
sql(f"SELECT fulfill_visibility_order('evt_next_month','{o}',NULL,NULL,'sub_test',now()+interval '2 months','{{}}')")
assert sql('SELECT count(*) FROM visibility_customer_jobs')=='2'
assert sql("SELECT coalesce(claim_visibility_customer_task(1),'null'::jsonb)")=='null'
sql(f"UPDATE visibility_orders SET status='canceled' WHERE id='{o}'")
assert claim(0) is None
print('PASS: paid entitlement, duplicate invoices/events, concurrent claims, owner isolation, write denial, interrupted costs, monthly renewal, daily cap, cancellation.')
