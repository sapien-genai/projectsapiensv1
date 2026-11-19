import { canSaveReport } from './core.ts';
import type { Report } from '../visibility-report/core/types.ts';
const evidence = {
 overall: null, signals: {reachable:true},
 profile: {name:'Example',category:'Services',queries:['Who offers services?']},
 assistants:[{recognitionAnswer:'Example provides services.',discovery:[{answer:'Example'}]}]
} as Report;
Deno.test('completed evidence saves without a composite score', () => {
 if (!canSaveReport('complete',evidence)) throw new Error('Scoreless report rejected');
 if (!canSaveReport('complete',{...evidence,overall:62})) throw new Error('Historical report rejected');
});
Deno.test('unfinished, unreadable and empty measurements cannot be saved', () => {
 for (const [status,report] of [
 ['running',evidence], ['complete',undefined],
 ['complete',{...evidence,signals:{reachable:false}}],
 ['complete',{...evidence,assistants:[]}],
 ['complete',{...evidence,profile:{...evidence.profile,queries:[]}}],
 ['complete',{...evidence,assistants:[{error:'Unavailable'}]}],
 ] as Array<[string,Report|undefined]>) {
  if (canSaveReport(status,report)) throw new Error('Invalid evidence accepted');
 }
});
