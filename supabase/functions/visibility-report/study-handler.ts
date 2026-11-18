import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { openai,anthropic,gemini } from './core/providers.ts';
import { analyzeSite } from './core/site.ts';
import { STUDY_METHOD,validateStudy,measureAnswer,type Study,type StudyRun,type StudyAnswer } from './core/studies.ts';
import type { UsageEntry } from './core/cost.ts';
const env=(name:string,fallback='')=>Deno.env.get(name)?.trim()||fallback;
const uuid=(value:unknown)=>typeof value==='string'&&/^[0-9a-f-]{36}$/i.test(value);
const check=(error:unknown)=>{if(error)throw new Error('Could not save study data.');};
export async function requireAdmin(db:SupabaseClient,req:Request):Promise<string|null> {
 const token=req.headers.get('authorization')?.replace(/^Bearer /i,'');
 if(!token)return null;
 const {data,error}=await db.auth.getUser(token);
 if(error||!data.user)return null;
 const role=await db.from('admin_roles').select('role').eq('user_id',data.user.id).in('role',['admin','super_admin']).limit(1).maybeSingle();
 return !role.error&&role.data?data.user.id:null;
}
export async function handleStudy(db:SupabaseClient,req:Request,body:Record<string,unknown>,resolveHost:(host:string)=>Promise<string[]>,dailyCap:number,adminCap:number) {
 const user=await requireAdmin(db,req);
 if(!user)return {status:403,data:{error:'Admin sign-in is required.'}};
 if(body.action==='study_create') {
  let definition;try {definition=validateStudy(body);}catch(error){return {status:400,data:{error:error instanceof Error?error.message:'Invalid study.'}};}
  const result=await db.from('visibility_studies').insert({...definition,created_by:user}).select().single();check(result.error);
  return {status:201,data:result.data};
 }
 if(body.action==='study_start') {
  if(!uuid(body.study_id)||!['baseline','followup'].includes(String(body.phase)))return {status:400,data:{error:'Choose a study and run phase.'}};
  if(!env('OPENAI_API_KEY')||!env('ANTHROPIC_API_KEY')||!env('GEMINI_API_KEY'))return {status:503,data:{error:'All three providers must be configured before starting a study.'}};
  const study=await db.from('visibility_studies').select('*').eq('id',body.study_id).single();check(study.error);
  const s=study.data as Study;
  const config={method:STUDY_METHOD,webSearch:true,models:{chatgpt:env('VISIBILITY_OPENAI_MODEL','gpt-5.5'),claude:env('VISIBILITY_ANTHROPIC_MODEL','claude-sonnet-5-5'),gemini:env('VISIBILITY_GEMINI_MODEL','gemini-3.5-flash')}};
  const site=await analyzeSite(s.url,{resolveHost});
  const result=await db.rpc('reserve_visibility_study_run',{p_study_id:s.id,p_user_id:user,p_phase:body.phase,p_label:typeof body.label==='string'?body.label.trim().slice(0,150):'',p_config:config,p_site:{...site,capturedAt:new Date().toISOString()},p_global_cap:dailyCap,p_admin_cap:adminCap});check(result.error);
  if(result.data.limit)return {status:429,data:{error:`The ${result.data.limit==='admin'?'per-admin study':'global work'} daily limit has been reached.`}};
  return {status:201,data:result.data};
 }
 if(body.action==='study_step') {
  if(!uuid(body.run_id))return {status:400,data:{error:'Choose a valid run.'}};
  const runResult=await db.from('visibility_study_runs').select('*').eq('id',body.run_id).single();check(runResult.error);
  const run=runResult.data as StudyRun;
  if(run.status!=='running')return {status:200,data:{done:true}};
  const studyResult=await db.from('visibility_studies').select('*').eq('id',run.study_id).single();check(studyResult.error);
  const study=studyResult.data as Study;
  const claim=await db.rpc('claim_visibility_study_answer',{p_run_id:run.id});check(claim.error);
  if(!claim.data)return {status:200,data:{done:true}};
  const a=claim.data as StudyAnswer;
  let actualModel:string|null=null;
  const onUsage=async(entry:UsageEntry)=>{
   const saved=await db.from('visibility_report_usage').upsert({...entry,study_run_id:run.id,study_answer_id:a.id},{onConflict:'id'});check(saved.error);
   if(entry.status==='succeeded')actualModel=entry.model;
  };
  try {
   const models=run.config.models as Record<string,string>;
   const config={model:models[a.provider],webSearch:run.config.webSearch===true,onUsage,citationLimit:1000,timeoutMs:75000,purpose:'assistant' as const};
   const provider=a.provider==='chatgpt'?openai({...config,apiKey:env('OPENAI_API_KEY')}):a.provider==='claude'?anthropic({...config,apiKey:env('ANTHROPIC_API_KEY')}):gemini({...config,apiKey:env('GEMINI_API_KEY')});
   const answer=await provider.ask(a.prompt);
   if(!answer.text.trim())throw new Error('Provider returned no answer.');
   const update=await db.from('visibility_study_answers').update({status:'succeeded',answer:answer.text,citations:answer.citations,searched:answer.searched,model:actualModel??answer.model,...measureAnswer(answer.text,answer.citations,study),finished_at:new Date().toISOString()}).eq('id',a.id).eq('status','running');check(update.error);
  }catch(error){
   const failed=await db.from('visibility_study_answers').update({status:'failed',error:error instanceof Error?error.message.slice(0,300):'Request failed',finished_at:new Date().toISOString()}).eq('id',a.id).eq('status','running');check(failed.error);
  }
  return {status:200,data:{done:false,answer_id:a.id}};
 }
 if(body.action==='study_note') {
  if(!uuid(body.study_id)||!['change','observation'].includes(String(body.kind))||typeof body.note!=='string'||!body.note.trim())return {status:400,data:{error:'Choose a study, note type and description.'}};
  const occurred=typeof body.occurred_at==='string'?new Date(body.occurred_at):new Date();
  if(!Number.isFinite(occurred.getTime()))return {status:400,data:{error:'Enter a valid date.'}};
  const evidence=typeof body.evidence_url==='string'?body.evidence_url.trim():'';
  if(evidence&&!/^https?:\/\//.test(evidence))return {status:400,data:{error:'Evidence link must use http or https.'}};
  const saved=await db.from('visibility_study_events').insert({study_id:body.study_id,kind:body.kind,note:body.note.trim().slice(0,4000),evidence_url:evidence.slice(0,1000)||null,occurred_at:occurred.toISOString(),created_by:user});check(saved.error);
  return {status:200,data:{saved:true}};
 }
 if(body.action==='study_review') {
  if(!uuid(body.answer_id)||!['unreviewed','accurate','inaccurate'].includes(String(body.review)))return {status:400,data:{error:'Choose an answer and review result.'}};
  const answer=await db.from('visibility_study_answers').select('run_id').eq('id',body.answer_id).single();check(answer.error); if(!answer.data)throw new Error('Answer not found.');
  const run=await db.from('visibility_study_runs').select('study_id').eq('id',answer.data.run_id).single();check(run.error); if(!run.data)throw new Error('Run not found.');
  const note=typeof body.note==='string'?body.note.slice(0,2000):'';
  // Audit the human judgement separately from the immutable provider answer.
  const event=await db.from('visibility_study_events').insert({study_id:run.data.study_id,run_id:answer.data.run_id,kind:'review',note:`Answer ${body.answer_id}: ${body.review}. ${note}`,occurred_at:new Date().toISOString(),created_by:user});check(event.error);
  const saved=await db.from('visibility_study_answers').update({review:body.review,review_note:note}).eq('id',body.answer_id);check(saved.error);
  return {status:200,data:{saved:true}};
 }
 return {status:400,data:{error:'Unknown study action.'}};
}
