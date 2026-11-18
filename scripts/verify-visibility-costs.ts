import assert from 'node:assert/strict';
import { newUsage, priceUsage, summarizeCost, type UsageEntry } from '../supabase/functions/visibility-report/core/cost.ts';
import { openai, anthropic, gemini } from '../supabase/functions/visibility-report/core/providers.ts';
const close = (actual: number | null, expected: number) => assert.ok(actual !== null && Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const o = priceUsage(newUsage('openai', 'gpt-5.5', 'assistant'), { model: 'gpt-5.5-2026-04-23', usage: { input_tokens: 10000, output_tokens: 2000, input_tokens_details: { cached_tokens: 2000 }, output_tokens_details: { reasoning_tokens: 1000 } }, output: [{type:'web_search_call'}, {type:'web_search_call'}] }, true);
close(o.token_cost_usd, 0.101); close(o.estimated_cost_usd, 0.121); assert.equal(o.output_tokens,2000);
const a = priceUsage(newUsage('anthropic','claude-sonnet-5-5','assistant'),{usage:{input_tokens:1000,output_tokens:500,cache_read_input_tokens:2000,cache_creation_input_tokens:100,server_tool_use:{web_search_requests:3}}},true);
assert.equal(a.input_tokens,3100); close(a.token_cost_usd,0.00745); close(a.estimated_cost_usd,0.03745);
const g = priceUsage(newUsage('gemini','gemini-3.5-flash','analysis'),{usageMetadata:{promptTokenCount:1000,cachedContentTokenCount:200,toolUsePromptTokenCount:300,candidatesTokenCount:100,thoughtsTokenCount:400},candidates:[{groundingMetadata:{webSearchQueries:['one','two']}}]},true);
assert.equal(g.output_tokens,500); assert.equal(g.input_tokens,1300);close(g.token_cost_usd,0.00618);close(g.estimated_cost_usd,0.03418);
assert.equal(priceUsage(newUsage('gemini','unknown-model','analysis'),{usageMetadata:{promptTokenCount:10,candidatesTokenCount:20}},false).estimated_cost_usd,null);
assert.equal(priceUsage(newUsage('openai','gpt-5.5','assistant'),{},true).estimated_cost_usd,null);
assert.equal(priceUsage(newUsage('gemini','gemini-3.5-flash','assistant'),{usageMetadata:{promptTokenCount:10,candidatesTokenCount:20}},true).search_cost_usd,null);
const base={reused_from:null,cost_tracking_started_at:'now',cost_tracking_finished_at:'now',visibility_report_usage:[{...o,status:'succeeded' as const}]};
close(summarizeCost(base).total,0.121);
assert.equal(summarizeCost({...base,reused_from:'source'}).total,0);
assert.equal(summarizeCost({...base,cost_tracking_started_at:null}).total,null);
assert.equal(summarizeCost({...base,visibility_report_usage:[{...o,status:'failed'}]}).total,null);
assert.equal(summarizeCost({...base,cost_tracking_finished_at:null}).total,null);
// A rejected search is a distinct, persisted attempt before the fallback call.
const events:UsageEntry[]=[];let requests=0;
const provider=anthropic({apiKey:'test',model:'claude-sonnet-5-5',webSearch:true,onUsage:async e=>{events.push(structuredClone(e));},fetchImpl:async()=>{
 requests++; return new Response(JSON.stringify(requests===1?{error:'search unavailable'}:{content:[{type:'text',text:'Answer'}],usage:{input_tokens:100,output_tokens:10}}),{status:requests===1?400:200});
}});
await provider.ask('Question');assert.equal(events.length,4);assert.deepEqual(events.map(e=>e.status),['pending','failed','pending','succeeded']);assert.notEqual(events[0].id,events[2].id);
assert.equal(events[1].estimated_cost_usd,null);assert.equal(events[3].searches,0);
// Never send paid requests when usage persistence cannot be initialized.
let paid=false;
await assert.rejects(openai({apiKey:'test',model:'gpt-5.5',webSearch:true,onUsage:async()=>{throw new Error('DB down');},fetchImpl:async()=>{paid=true;return new Response('{}');}}).ask('Question'));
assert.equal(paid,false);
// Invalid JSON and network errors retain unknown failed usage, not zero cost.
for(const fetchImpl of [async()=>new Response('bad json'),async()=>{throw new Error('timeout');}]) {
 const saved:UsageEntry[]=[];
 await assert.rejects(gemini({apiKey:'test',model:'gemini-3.5-flash',webSearch:false,onUsage:async e=>{saved.push(structuredClone(e));},fetchImpl}).complete('Grade'));
 assert.equal(saved.at(-1)?.status,'failed');assert.equal(saved.at(-1)?.estimated_cost_usd,null);
}
console.log('Verified token math, cache accounting, reasoning tokens, searches, unknown models/usage, retries, interrupted runs, and fail-closed persistence.');
