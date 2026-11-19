import { useState, type FormEvent } from 'react';
import { customerApi, type Project } from './customer';

export default function BusinessProfile({project, onSaved}: {project: Project; onSaved: () => Promise<void>}) {
  const [editing, setEditing] = useState(!project.business_profile);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const profile = project.business_profile;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError(''); setStatus('');
    try {
      await customerApi({action: 'save_profile', project_id: project.id, profile: values});
      await onSaved(); setEditing(false); setStatus('Business profile saved.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save your business profile.'); }
    finally { setBusy(false); }
  }
  return <section id="business-profile" className="va-section va-business-profile">
    <p className="va-eyebrow">{profile ? 'Business profile' : 'Complete your workspace · about 1 minute'}</p>
    <h2>{profile ? 'Your business, in context.' : 'Tell us a little about your business.'}</h2>
    <p>These details help us understand your business and recommend relevant services. Your saved report and tracking questions stay unchanged.</p>
    {status && <p role="status">{status}</p>}
    {error && <p role="alert" className="va-notice va-error">{error}</p>}
    {editing ? <form onSubmit={save} className="va-profile-form">
      <label>Business name<input name="business_name" required maxLength={120} defaultValue={profile?.business_name || project.business_name} autoComplete="organization" /></label>
      <label>Location or service area<input name="location" required maxLength={160} defaultValue={profile?.location || ''} placeholder="Chicago, nationwide, or online" /></label>
      <label>Industry<input name="industry" required maxLength={120} defaultValue={profile?.industry || ''} placeholder="For example, professional services" /></label>
      <label>Number of employees<select name="employees" required defaultValue={profile?.employees || ''}><option value="" disabled>Select a range</option>{['Just me','2–10','11–50','51–200','201–500','501+','Prefer not to say'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="va-profile-goal">What would you most like to improve?<textarea name="goal" required maxLength={600} rows={3} defaultValue={profile?.goal || ''} placeholder="Get found by more customers, reduce repetitive work, or improve customer support…" /></label>
      <div className="va-toolbar"><button className="va-button" disabled={busy}>{busy ? 'Saving…' : 'Save business profile'}</button><button type="button" className="va-link" onClick={() => setEditing(false)} disabled={busy}>{profile ? 'Cancel' : 'Do this later'}</button></div>
    </form> : profile ? <><dl className="va-profile-summary">{[['Business',profile.business_name],['Location / service area',profile.location],['Industry',profile.industry],['Employees',profile.employees],['Main goal',profile.goal]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><button className="va-link" onClick={() => setEditing(true)}>Edit business profile</button></> : <button className="va-link" onClick={() => setEditing(true)}>Complete business profile</button>}
  </section>;
}
