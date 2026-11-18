import assert from 'node:assert/strict';
import type { Report } from './core/types.ts';

Deno.test('cached start, locked preview, unlock, status, and failed quota reservation', async () => {
  const names = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY'];
  const previous = names.map(name => Deno.env.get(name));
  Deno.env.set('SUPABASE_URL', 'https://database.example.com');
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const report: Report = { version: 1, domain: 'acme.com', url: 'https://acme.com/', generatedAt: new Date().toISOString(),
    profile: { name: 'Acme', category: 'Dentist', summary: '', audience: '', queries: [] }, overall: null, verdict: 'Incomplete',
    signals: { reachable: true, finalUrl: 'https://acme.com/', status: 200, title: '', description: '', h1: '', wordCount: 100, score: 80, checks: [] },
    assistants: [], recommendations: [{ title: 'Private recommendation', detail: '', priority: 'high' }], method: 'API snapshot' };
  const row = { id: '11111111-1111-4111-8111-111111111111', domain: 'acme.com', status: 'complete', report, email: null as string | null, unlocked_at: null as string | null, created_at: new Date().toISOString() };
  let failReservation = false;
  let admin = false;
  let reservation: Record<string, unknown> = {};
  let limit: string | null = null;
  const originalFetch = globalThis.fetch;
  const background: Promise<unknown>[] = [];
  const originalRuntime = globalThis.EdgeRuntime;
  globalThis.EdgeRuntime = { waitUntil: (task: Promise<unknown>) => { background.push(task); } } as typeof EdgeRuntime;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json'}});
    if (url.endsWith('/auth/v1/user')) return json({id:'22222222-2222-4222-8222-222222222222'});
    if (url.includes('/admin_roles?')) return json(admin ? {role:'super_admin'} : null);
    if (url.endsWith('/rpc/reserve_visibility_report')) { reservation = JSON.parse(String(init?.body)); return failReservation ? json({message: 'DB down'}, 503) : json(limit ? {limit} : row); }
    if (url.endsWith('/rpc/claim_visibility_notification')) return json([]);
    if (url.includes('/visibility_reports?')) {
      if (init?.method === 'PATCH' && !row.unlocked_at) Object.assign(row, JSON.parse(String(init.body)));
      return json(init?.method === 'PATCH' ? null : row);
    }
    throw new Error(`Unexpected network request: ${url}`);
  };
  try {
    const { handleRequest } = await import('./handler.ts');
    assert.equal((await handleRequest(new Request('https://example.com?check=providers'))).status, 403);
    const call = (body: unknown, origin = 'https://www.projectsapiens.ai') => handleRequest(new Request('https://example.com', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
    assert.equal((await call({action:'start',url:'acme.com',fresh:true})).status,403);
    const freshCall = () => handleRequest(new Request('https://example.com', {method:'POST',headers:{Origin:'https://www.projectsapiens.ai',Authorization:'Bearer user-token','Content-Type':'application/json'},body:JSON.stringify({action:'start',url:'acme.com',fresh:true})}));
    assert.equal((await freshCall()).status,403);
    admin = true;
    assert.equal((await freshCall()).status,200);
    assert.equal(reservation.p_cache_days,0);
    assert.equal(reservation.p_ip_limit,3);
    assert.equal(reservation.p_daily_cap,100);
    assert.equal(reservation.p_ip_hash,'admin:22222222-2222-4222-8222-222222222222');
    limit = 'visitor'; assert.equal((await freshCall()).status,429); limit = null;
    const cached = await call({action: 'start', url: 'acme.com'});
    assert.equal(cached.status, 200);
    assert.equal(reservation.p_cache_days,7);
    const preview = await cached.json();
    assert.equal(preview.status, 'complete');
    assert.ok(preview.preview);
    assert.equal(preview.report, undefined);
    assert.equal(preview.preview.overall, null);
    assert.ok(!JSON.stringify(preview).includes('Private recommendation'));
    const unlocked = await call({action: 'unlock', id: row.id, email: 'first@example.com'});
    assert.equal((await unlocked.json()).report.recommendations[0].title, 'Private recommendation');
    await call({action: 'unlock', id: row.id, email: 'second@example.com'});
    assert.equal(row.email, 'first@example.com');
    assert.ok((await (await call({action:'status',id:row.id})).json()).report);
    limit = 'global';
    assert.equal((await call({action:'start',url:'acme.com'})).status,429);
    failReservation = true;
    assert.equal((await call({action:'start',url:'acme.com'})).status,500);
    assert.equal((await call({action:'start',url:'acme.com'},'https://attacker.example')).status,403);
    await Promise.all(background);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.EdgeRuntime = originalRuntime;
    names.forEach((name,index) => previous[index] === undefined ? Deno.env.delete(name) : Deno.env.set(name, previous[index]!));
  }
});
