import { normalizeUrl } from './url.ts';
import type { Citation } from './types.ts';
export const STUDY_METHOD = 'fixed-questions-v1';
export type Question = { id: string; text: string; kind: 'discovery' | 'recognition' };
export type Study = { id: string; name: string; business_name: string; domain: string; url: string; questions: Question[]; competitors: string[]; context: string; created_at: string };
export type StudyAnswer = { id: string; run_id: string; question_id: string; provider: string; status: 'pending'|'running'|'succeeded'|'failed'; prompt: string; answer: string | null; citations: Citation[]; searched: boolean | null; model: string | null; mentioned: boolean | null; cited: boolean | null; competitors: string[]; error: string | null; started_at: string | null; finished_at: string | null; review: 'unreviewed'|'accurate'|'inaccurate'; review_note: string | null };
export type StudyRun = { id: string; study_id: string; phase: 'baseline'|'followup'; label: string; status: string; created_at: string; finished_at: string | null; questions: Question[]; config: Record<string, unknown>; site_snapshot: Record<string, unknown> | null; cost_tracking_started_at: string | null; cost_tracking_finished_at: string | null };
export function validateStudy(value: Record<string, unknown>) {
  const text = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0,max) : '';
  const name=text(value.name,120), business_name=text(value.business_name,100);
  if (!name || !business_name || typeof value.url !== 'string') throw new Error('Name, business name and public URL are required.');
  const {url,domain}=normalizeUrl(value.url);
  if (!Array.isArray(value.questions) || value.questions.length<3 || value.questions.length>20) throw new Error('Use 3–20 fixed questions.');
  const questions=value.questions.map((q: unknown,index:number):Question => {
    if (!q || typeof q !== 'object') throw new Error('Invalid question.');
    const item=q as Record<string,unknown>, prompt=text(item.text,500);
    if (!prompt || !['discovery','recognition'].includes(String(item.kind))) throw new Error('Each question needs text and a type.');
    if (item.kind==='discovery' && (hasName(prompt,business_name) || prompt.toLowerCase().includes(domain))) throw new Error('Discovery questions must not name the business or domain.');
    return {id:`q${index+1}`,text:prompt,kind:item.kind as Question['kind']};
  });
  if(new Set(questions.map(q=>q.text.toLowerCase())).size!==questions.length) throw new Error('Questions must be unique.');
  if(!questions.some(q=>q.kind==='discovery')) throw new Error('Include discovery questions.');
  const competitors=Array.isArray(value.competitors)?value.competitors.filter((x):x is string=>typeof x==='string').map(x=>x.trim().slice(0,100)).filter(Boolean).slice(0,5):[];
  return {name,business_name,url,domain,questions,competitors,context:text(value.context,3000)};
}
export function hasName(text:string,name:string) {
  const escaped=name.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return escaped.length>2 && new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`,'i').test(text);
}
export function domainCited(citations:Citation[],domain:string) {
  return citations.some(c=>{try {
    const url=new URL(c.url), host=url.hostname.toLowerCase();
    if(host===domain || host.endsWith(`.${domain}`)) return true;
    // Gemini's grounding links hide the destination behind Google's redirect.
    // Accept only its exact hostname label, never arbitrary page-title mentions.
    const label=c.title?.trim().toLowerCase()??'';
    return host==='vertexaisearch.cloud.google.com' && url.pathname.startsWith('/grounding-api-redirect/') &&
      /^[a-z0-9.-]+$/.test(label) && (label===domain || label.endsWith(`.${domain}`));
  }catch{return false;}});
}
export function measureAnswer(text:string,citations:Citation[],study:Pick<Study,'business_name'|'domain'|'competitors'>) {
  const hosts=text.toLowerCase().match(/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+/g)??[];
  return {mentioned:hasName(text,study.business_name)||hosts.some(h=>h===study.domain||h.endsWith(`.${study.domain}`)),cited:domainCited(citations,study.domain),competitors:study.competitors.filter(n=>hasName(text,n))};
}
export function studyMetrics(questions:Question[],answers:StudyAnswer[],kind:Question['kind']='discovery') {
  const ids=new Set(questions.filter(q=>q.kind===kind).map(q=>q.id));
  const selected=answers.filter(a=>ids.has(a.question_id));
  const valid=selected.filter(a=>a.status==='succeeded');
  const rate=(key:'mentioned'|'cited')=>valid.length?100*valid.filter(a=>a[key]===true).length/valid.length:null;
  return {expected:ids.size*3,valid:valid.length,missing:ids.size*3-valid.length,mentions:valid.filter(a=>a.mentioned).length,citations:valid.filter(a=>a.cited).length,mentionRate:rate('mentioned'),citationRate:rate('cited'),searched:valid.filter(a=>a.searched).length};
}
export function compareStudyRuns(before:StudyRun,after:StudyRun,beforeAnswers:StudyAnswer[],afterAnswers:StudyAnswer[]) {
  const warnings:string[]=[];
  const same=before.study_id===after.study_id && JSON.stringify(before.questions)===JSON.stringify(after.questions) && JSON.stringify(before.config)===JSON.stringify(after.config);
  if(!same) warnings.push('Question set or requested model/search configuration changed; these runs are not directly comparable.');
  const key=(a:StudyAnswer)=>`${a.question_id}:${a.provider}`;
  const original=new Map(beforeAnswers.map(a=>[key(a),a]));
  const matched=afterAnswers.filter(a=>a.status==='succeeded'&&original.get(key(a))?.status==='succeeded');
  const modelChanged=matched.some(a=>!a.model||a.model!==original.get(key(a))?.model);
  if(modelChanged) warnings.push('Returned model versions changed or are unknown; numerical change is withheld.');
  const comparable=same&&!modelChanged;
  if(matched.some(a=>a.searched!==original.get(key(a))?.searched)) warnings.push('Actual search use changed on matched questions.');
  const expected=after.questions.length*3;
  if(matched.length<expected) warnings.push(`Only ${matched.length}/${expected} question/provider pairs succeeded in both runs; missing tests are not zero scores.`);
  const left=matched.map(a=>original.get(key(a))!);
  const b=studyMetrics(before.questions,left),a=studyMetrics(after.questions,matched);
  return {comparable,warnings,matched:matched.length,before:b,after:a,mentionDelta:comparable&&a.mentionRate!==null&&b.mentionRate!==null?a.mentionRate-b.mentionRate:null,citationDelta:comparable&&a.citationRate!==null&&b.citationRate!==null?a.citationRate-b.citationRate:null};
}
