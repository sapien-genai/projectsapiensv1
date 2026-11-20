import assert from 'node:assert/strict';
import { auditLinks, auditPage, investigate, explainAudit } from '../supabase/functions/visibility-report/core/audit.ts';
import { auditFindings } from '../supabase/functions/visibility-report/core/evidence.ts';
import { discoveryScore } from '../supabase/functions/visibility/discovery-score.ts';
import { reportMarkdown } from '../src/components/visibility/reportDownload.ts';
import { readableReport } from '../supabase/functions/visibility-report/core/pipeline.ts';
import { persistReport, storageSafeJson } from '../supabase/functions/visibility-report/core/storage.ts';
import type { Report } from '../supabase/functions/visibility-report/core/types.ts';
const html = '<html><head><title>Acme Sports</title><meta name="description" content="Find verified schedules"><script type="application/ld+json">{"@type":"WebPage","publisher":{"@type":"Organization"}}</script></head><body><h1>Find where to watch</h1><p>Existing guide pages help customers find channels and understand access restrictions. '+ 'Useful public information. '.repeat(40)+'</p><a href="/tv-guide">Guide</a><a href="/about">About</a><a href="/admin">Admin</a><a href="https://other.com/">Outside</a><a href="http://127.0.0.1/">Local</a></body></html>';
const page = auditPage(html, 'https://acme.com/', 200, 'page-1');
assert.deepEqual(page.schemaTypes, ['WebPage', 'Organization']);
assert.deepEqual(auditLinks(html, page.url), ['https://acme.com/tv-guide', 'https://acme.com/about']);
let requests: string[] = [];
const opts = { resolveHost: async () => ['8.8.8.8'], fetchImpl: (async (input: string | URL | Request) => {
  const url = String(input); requests.push(url);
  if (url.endsWith('/about')) throw new Error('timeout');
  if (/txt|xml/.test(url)) return new Response('unavailable', {status: 503, headers: {'Content-Type':'text/plain'}});
  return new Response(html, {headers: {'Content-Type':'text/html'}});
}) as typeof fetch };
const audit = await investigate(page.url, opts);
assert.equal(audit.pages.length, 3);
assert.equal(audit.pages[2].readable, false);
assert.equal(audit.pages[2].status, null);
assert.equal(audit.resources.filter(r => r.readable).length, 0);
assert.ok(!requests.some(u => /other.com|127.0.0.1|\/admin/.test(u)));
const profile = {name:'Acme',category:'sports guide',summary:'A guide',audience:'Fans',queries:[]};
const action = {targetEvidenceId:'page-1',changeKind:'inspect',existingQuote:'Existing guide pages help customers find channels',title:'Explain access',priority:'high',classification:'observed',evidenceId:'page-1',quote:'Existing guide pages help customers find channels',observation:'Review the access explanation.',why:'Help customers understand access',steps:['Inspect the existing guide','Verify provider requirements','Publish accurate access details'],example:'Check your subscription before watching.',owner:'Editor',effort:'Small copy update',validation:'Verify the published guide and repeat the same questions.'};
const explained = await explainAudit(audit, {profile,assistants:[]}, async () => JSON.stringify({summary:'A useful plan',actions:[action,{...action,title:'Unsupported',quote:'This invented sentence is not in the captured evidence.'},{...action,title:'Unknown source',evidenceId:'missing'}]}));
assert.equal(explained.status,'complete');
assert.equal(explained.actions.length,1);
assert.equal(explained.actions[0].classification,'verify','Models cannot label their interpretation as confirmed');
const failed = await explainAudit(audit,{profile,assistants:[]},async()=>'{"actions":[]');
assert.equal(failed.status,'partial');assert.ok(failed.limitations.some(s=>s.includes('could not be completed')));
requests=[];
const unavailable = await investigate(page.url,{...opts,fetchImpl:async()=>new Response('blocked',{status:403})});
assert.equal(unavailable.actions.length,0);assert.equal(unavailable.pages[0].readable,false);
let calls=0;await explainAudit(unavailable,{profile,assistants:[]},async()=>{calls++;return '{}';});assert.equal(calls,0);
const report = {version:1,domain:'acme.com',url:page.url,generatedAt:new Date().toISOString(),profile,overall:null,verdict:'',signals:{reachable:true,checks:[]},assistants:[],recommendations:[],method:'',audit:explained} as unknown as Report;
assert.deepEqual(readableReport(report).audit,explained,'Saved audit evidence survives legacy display normalization');
const unsafe = { nested: ['About\u0000us', 'truncated\uD83D', '\uDE00orphan', 'Bird 🐦'], count: 2, missing: null };
assert.deepEqual(storageSafeJson(unsafe), { nested: ['About�us', 'truncated�', '�orphan', 'Bird 🐦'], count: 2, missing: null });
await assert.rejects(persistReport(async () => ({ error: { code: '22P05' } })), /Could not save completed report/);
await persistReport(async () => ({ error: null }));
const question = 'Which studios build custom agents for businesses?';
const questionOnly = await explainAudit(audit, {profile,assistants:[{id:'chatgpt',discovery:[{query:question,answer:'Several studios offer software delivery and integration services.',citations:[]}]}] as unknown as Pick<Report,'profile'|'assistants'>}, async () => JSON.stringify({actions:[{...action,evidenceId:'chatgpt-0',quote:question}]}));
assert.equal(questionOnly.actions.length,0,'A question alone cannot serve as evidence of an assistant answer');
console.log('Verified bounded same-site investigation, nested schema, failed fetches, grounded quotations, provisional findings, partial synthesis, and saved evidence.');

const missing = auditPage('<html><body><div id="root"></div><script>self.__next_f.push([1,"application/ld+json"])</script></body></html>', page.url, 200, 'shell');
const shellAudit = {...audit,pages:[missing],actions:[]};
assert.ok(auditFindings(shellAudit).every(f=>f.status==='incomplete'), 'Missing raw fields and Flight strings do not establish defects');
assert.equal(missing.capture?.hydrationDetected,true);
assert.equal(missing.schemaTypes.length,0,'A Flight string alone is not usable JSON-LD');
const broken = auditPage('<html><head><script type="application/ld+json">{"@type": bad}</script></head><body><h1>Test</h1></body></html>',page.url,200,'broken');
assert.equal(auditFindings({...audit,pages:[broken]}).filter(f=>f.status==='verified_problem').length,1,'Complete invalid JSON script is a verified syntax issue');
const cutoff = auditPage('<html><body>'+ 'x'.repeat(350000),page.url,200,'capped');
assert.equal(cutoff.capture?.atByteLimit,true);
assert.equal(cutoff.capture?.documentClosed,false);
const proposals = [
 {...action,title:'Duplicate link',changeKind:'add_link',linkTarget:'https://www.acme.com/tv-guide/'},
 {...action,title:'Duplicate schema',changeKind:'add_schema',schemaType:'Organization'},
 {...action,title:'Unread target',targetEvidenceId:audit.pages[2].id},
 {...action,title:'Identical text',changeKind:'edit_copy',replacement:action.existingQuote},
 {...action,title:'Real copy proposal',changeKind:'edit_copy',replacement:'Find listed channels here, then check your subscription and location before choosing a viewing option.'}
];
const filtered = await explainAudit(audit,{profile,assistants:[]},async()=>JSON.stringify({actions:proposals}));
assert.deepEqual(filtered.actions.map(a=>a.title),['Real copy proposal']);
assert.ok(filtered.actions[0].example.includes('Current captured wording'));
assert.equal(filtered.actions[0].classification,'opportunity');
assert.equal(filtered.actions[0].priority,'medium','Model cannot declare an unverified proposal urgent');
const noindex = {...audit,pages:[{...page,capture:{...page.capture!,noindex:true}}]};
const noindexPlan = await explainAudit(noindex,{profile,assistants:[]},async()=>JSON.stringify({actions:[proposals[4]]}));
assert.equal(noindexPlan.actions.length,0);
assert.equal(discoveryScore([{mentions:1,discoveryAnswers:2,expectedDiscovery:2},{mentions:0,discoveryAnswers:2,expectedDiscovery:2},{mentions:0,discoveryAnswers:2,expectedDiscovery:2}]).score,17);
const partialScore = discoveryScore([{mentions:1,discoveryAnswers:2,expectedDiscovery:2},{failed:true,mentions:0,discoveryAnswers:0,expectedDiscovery:2}]);
assert.equal(partialScore.score,50);assert.equal(partialScore.partial,true);assert.equal(partialScore.expected,4);
assert.equal(discoveryScore([{failed:true,expectedDiscovery:2}]).score,null);
assert.equal(discoveryScore([{mentions:5,discoveryAnswers:2,expectedDiscovery:2}]).score,null);
assert.equal(discoveryScore([{mentions:0,discoveryAnswers:2,expectedDiscovery:2}]).score,0);
const md=reportMarkdown({...report,audit:shellAudit});
assert.ok(md.includes('## Incomplete checks')&&md.includes('## Verified problems')&&md.includes('## Sampled discovery score'));
console.log('Verified incomplete-rendering taxonomy, invalid JSON evidence, duplicate-proposal rejection, score coverage and exported definitions.');

assert.equal(discoveryScore([{mentions:2,discoveryAnswers:2,expectedDiscovery:2}],false).score,null,'Failed website context cannot produce a grade');

const olderPage = {...page,canonical:'https://acme.com/',capture:undefined};
assert.equal(auditFindings({...audit,pages:[olderPage, {...olderPage,id:'old-2'}]}).length,1,'Missing legacy capture flags are grouped, not multiplied into page alarms');

let planAttempts = 0;
const recovered = await explainAudit(audit, {profile,assistants:[]}, async prompt => {
  planAttempts++;
  if (planAttempts === 1) return '{"actions":[{"title":"cut off';
  assert.ok(prompt.includes('at most 3 actions'));
  return JSON.stringify({actions:[action,{...action,quote:'Unsupported invented evidence that must be rejected.'}]});
});
assert.equal(planAttempts,2);
assert.equal(recovered.status,'complete');
assert.equal(recovered.actions.length,1,'Retry must preserve evidence validation');
let exhaustedAttempts = 0;
const exhausted = await explainAudit(audit,{profile,assistants:[]},async()=>{exhaustedAttempts++;throw new Error('provider timeout');});
assert.equal(exhaustedAttempts,2,'Paid retries are bounded');
assert.equal(exhausted.status,'partial');
assert.ok(exhausted.limitations.some(s=>s.includes('could not be completed')));
