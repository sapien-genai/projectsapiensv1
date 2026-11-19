import { businessProfile } from './profile.ts';
const valid = {business_name:' Acme ',location:'Online',industry:'Services',employees:'2–10',goal:'Improve customer support'};
Deno.test('business profile accepts business context, trims fields and excludes unrelated input', () => {
  const result = businessProfile({...valid, user_id:'someone-else', questions:['changed'], report:{overall:100}});
  if (result.business_name !== 'Acme' || Object.keys(result).length !== 5) throw new Error('Unexpected profile shape');
});
Deno.test('business profile rejects missing, oversized and invalid fields', () => {
  for (const value of [null, [], {}, {...valid,employees:'invalid'}, {...valid,goal:' '}, {...valid,business_name:'x'.repeat(121)}, {...valid,location:42}]) {
    let rejected=false;
    try { businessProfile(value); } catch { rejected=true; }
    if (!rejected) throw new Error('Invalid input accepted');
  }
});
