"""Regression checks on a DISPOSABLE local DB with both visibility migrations applied.
PGHOST must be a local socket/loopback. Run: PGHOST=/tmp PGPORT=55478 python3 scripts/verify-visibility-database.py
"""
import concurrent.futures, json, os, subprocess, uuid
assert os.environ.get('PGHOST') in ('/tmp', '/private/tmp', 'localhost', '127.0.0.1'), 'Use a disposable local database'
def sql(query):
 return subprocess.check_output(['psql', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1', '-c', query], text=True).strip()
def reserve(i, ip, cap, limit):
 return json.loads(sql(f"select reserve_visibility_report('test-{i}.com','https://test-{i}.com/','{ip}',{cap},{limit},7)"))
assert sql('select count(*) from visibility_reports') == '0', 'Use an empty test database'
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
 results=list(pool.map(lambda i: reserve(i, f'ip-{i}', 3, 3), range(12)))
assert sum(r.get('status') == 'running' for r in results) == 3
assert sum(r.get('limit') == 'global' for r in results) == 9
sql('truncate visibility_reports')
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
 results=list(pool.map(lambda i: reserve(i, 'same-ip', 100, 3), range(12)))
assert sum(r.get('status') == 'running' for r in results) == 3
assert sum(r.get('limit') == 'visitor' for r in results) == 9
row=next(r for r in results if r.get('id'))
id=row['id']; domain=row['domain']; i=int(domain.split('-')[1].split('.')[0])
sql(f"update visibility_reports set status='complete',report='{{\"overall\":42}}',email='original@example.com',unlocked_at=now() where id='{id}'")
cached=reserve(i,'another-ip',3,3)
assert cached['id'] != id and cached['reused_from'] == id
assert cached['report']['overall'] == 42 and cached['email'] is None and cached['unlocked_at'] is None
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
 claims=list(pool.map(lambda _: sql(f"select id from claim_visibility_notification('{id}')"), range(12)))
assert sum(bool(x) for x in claims) == 1
sql(f"update visibility_reports set notification_status='failed',notification_attempted_at=now()-interval '3 minutes' where id='{id}'")
assert sql(f"select id from claim_visibility_notification('{id}')") == id
sql(f"update visibility_reports set notification_status='sent',notified_at=now(),notification_attempted_at=now()-interval '3 minutes' where id='{id}'")
assert sql(f"select id from claim_visibility_notification('{id}')") == ''
for role in ('anon','authenticated'):
 assert sql(f"select has_function_privilege('{role}', 'reserve_visibility_report(text,text,text,integer,integer,integer)', 'execute')") == 'f'
 assert sql(f"select has_function_privilege('{role}', 'claim_visibility_notification(uuid)', 'execute')") == 'f'
print('Verified concurrent global/IP caps, independent cached lead rows, notification claims/retries, and RPC permissions.')
