"""Only run on an empty, disposable LOCAL PostgreSQL database with migrations applied."""
import concurrent.futures,json,os,subprocess,uuid
assert os.environ.get('PGHOST') in ('/tmp','/private/tmp','localhost','127.0.0.1')
def sql(q):return subprocess.check_output(['psql','-d','postgres','-At','-v','ON_ERROR_STOP=1','-c',q],text=True).strip()
def rejected(q):return subprocess.run(['psql','-d','postgres','-v','ON_ERROR_STOP=1','-c',q],capture_output=True,text=True).returncode!=0
assert sql('select count(*) from visibility_study_runs')=='0'
assert sql('select count(*) from visibility_reports')=='0'
user=str(uuid.uuid4()); ids=[str(uuid.uuid4()) for _ in range(3)]
questions=json.dumps([{'id':f'q{i}','text':f'Fixed question {i}?','kind':'discovery'} for i in range(3)])
for id in ids:sql(f"insert into visibility_studies(id,name,business_name,domain,url,questions,created_by) values('{id}','Test','Test','example.org','https://example.org','{questions}','{user}')")
def reserve(study,cap=100,admincap=3):return json.loads(sql(f"select reserve_visibility_study_run('{study}','{user}','baseline','test','{{\"method\":\"fixed\"}}','{{}}',{cap},{admincap})"))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:runs=list(pool.map(lambda _:reserve(ids[0]),range(8)))
assert len({r['id'] for r in runs})==1
run=runs[0]['id'];assert sql(f"select count(*) from visibility_study_answers where run_id='{run}'")=='9'
assert reserve(ids[1],1)['limit']=='global'
assert json.loads(sql("select reserve_visibility_report('example.com','https://example.com','visitor',1,3,7)"))['limit']=='global'
assert reserve(ids[1],100,1)['limit']=='admin'
def claim(_):return json.loads(sql(f"select coalesce(claim_visibility_study_answer('{run}'),'null'::jsonb)"))
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:claims=list(pool.map(claim,range(12)))
claimed=[a for a in claims if a];assert len(claimed)==9 and len({a['id'] for a in claimed})==9
assert rejected(f"update visibility_studies set questions='[]' where id='{ids[0]}'")
assert rejected(f"update visibility_study_runs set config='{{}}' where id='{run}'")
assert rejected(f"insert into visibility_report_usage(id,provider,requested_model,model,purpose,status,started_at,search_basis,pricing_version) values(gen_random_uuid(),'openai','x','x','assistant','pending',now(),'unknown','x')")
# A stopped worker is not re-billed: its answer becomes failed, not pending.
last=claimed[-1]['id'];sql(f"update visibility_study_answers set status='succeeded',answer='saved' where run_id='{run}' and id!='{last}'")
sql(f"update visibility_study_answers set started_at=now()-interval '4 minutes' where id='{last}'")
assert claim(0) is None
assert sql(f"select status from visibility_study_answers where id='{last}'")=='failed'
assert sql(f"select status from visibility_study_runs where id='{run}'")=='partial'
assert claim(0) is None
for role in ['anon','authenticated']:
 for signature in ['claim_visibility_study_answer(uuid)','reserve_visibility_study_run(uuid,uuid,text,text,jsonb,jsonb,integer,integer)']:
  assert sql(f"select has_function_privilege('{role}','{signature}','execute')")=='f'
 for table in ['visibility_studies','visibility_study_runs','visibility_study_answers','visibility_study_events']:
  assert sql(f"select has_table_privilege('{role}','{table}','INSERT,UPDATE,DELETE')")=='f'
# Read policy: ordinary signed-in users see no study rows, existing admins do.
sql("CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; GRANT USAGE ON SCHEMA auth TO authenticated; GRANT SELECT ON admin_roles TO authenticated;")
assert sql(f"set role authenticated;set request.jwt.claim.sub='{user}';select count(*) from visibility_studies").splitlines()[-1]=='0'
sql(f"insert into admin_roles values('{user}','admin')")
assert sql(f"set role authenticated;set request.jwt.claim.sub='{user}';select count(*) from visibility_studies").splitlines()[-1]=='3'
sql(f"delete from admin_roles where user_id='{user}'")
sql('truncate visibility_report_usage,visibility_study_events,visibility_study_answers,visibility_study_runs,visibility_studies,visibility_reports')
print('Verified concurrent idempotent reservation, unique claims, shared quota, immutable questions/config, interrupted-call handling, no replay and admin-only RLS/RPC access.')
