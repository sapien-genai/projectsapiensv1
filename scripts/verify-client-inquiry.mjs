import assert from 'node:assert/strict';
import handler from '../api/client-inquiry.js';
const valid = { name: 'Form test', email: 'test@example.com', project: 'A useful product', company: 'Example', website: '' };
let calls = [];
const originalFetch = globalThis.fetch;
async function invoke(body = valid, method = 'POST', extraHeaders = {}) {
  const response = { code: 0, body: null, setHeader() {}, status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
  await handler({ method, headers: { host: 'projectsapiens.ai', origin: 'https://projectsapiens.ai', 'content-type': 'application/json', ...extraHeaders }, body }, response);
  return response;
}
try {
  globalThis.fetch = async (url, options) => { calls.push({url, options}); return { ok: true }; };
  assert.equal((await invoke(valid, 'GET')).code, 405);
  assert.equal((await invoke(valid, 'POST', { origin: 'https://unrelated.example' })).code, 403);
  assert.equal((await invoke(valid, 'POST', { 'content-type': 'text/plain' })).code, 415);
  assert.equal((await invoke(valid, 'POST', { 'content-length': '20001' })).code, 413);
  assert.equal((await invoke('{')).code, 400);
  assert.equal((await invoke({ ...valid, email: 'invalid' })).code, 400);
  assert.equal((await invoke({ ...valid, project: '   ' })).code, 400);
  assert.equal((await invoke({ ...valid, project: 'x'.repeat(5001) })).code, 400);
  assert.equal((await invoke({ ...valid, company: {} })).code, 400);
  assert.equal((await invoke({ ...valid, website: 'spam' })).body.ok, true);
  assert.equal(calls.length, 0, 'Invalid submissions and honeypots never reach intake');
  assert.equal((await invoke()).body.ok, true);
  assert.equal(calls[0].url, 'https://tonymarks.com/');
  const forwarded = new URLSearchParams(calls[0].options.body);
  assert.equal(forwarded.get('form-name'), 'contact');
  assert.equal(forwarded.get('email'), valid.email);
  assert.equal(forwarded.get('project'), `[Project Sapiens inquiry]\n\n${valid.project}`);
  globalThis.fetch = async () => ({ ok: false });
  assert.equal((await invoke()).code, 502);
  globalThis.fetch = async () => { throw new Error('timeout'); };
  assert.equal((await invoke()).code, 502);
  console.log('Passed inquiry validation, origin/method checks, honeypot, forwarding, and failure handling. No live submissions sent.');
} finally { globalThis.fetch = originalFetch; }
