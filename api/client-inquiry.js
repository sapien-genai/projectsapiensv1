// Reuse Tony's existing Netlify contact intake; no credentials reach the browser.
const LIMITS = { name: 120, email: 254, company: 200, project: 5000, stage: 100, budget: 100, timeline: 100, website: 200 };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({ error: 'JSON required.' });
  // Browser submissions must originate on this deployment, including previews.
  try {
    if (!req.headers.origin || new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ error: 'Invalid origin.' });
  } catch { return res.status(403).json({ error: 'Invalid origin.' }); }
  if (Number(req.headers['content-length']) > 20000) return res.status(413).json({ error: 'Submission is too large.' });
  let data;
  try { data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: 'Invalid submission.' }); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'Invalid submission.' });
  const clean = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = data[key] ?? '';
    if (typeof value !== 'string' || value.length > max) return res.status(400).json({ error: 'Please check the form fields and try again.' });
    clean[key] = value.trim();
  }
  // Quietly discard filled honeypots without forwarding them.
  if (clean.website) return res.status(200).json({ ok: true });
  if (!clean.name || !clean.project || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
    return res.status(400).json({ error: 'Please provide your name, a valid email, and project details.' });
  }
  const body = new URLSearchParams({ ...clean, 'form-name': 'contact', project: `[Project Sapiens inquiry]\n\n${clean.project}` });
  try {
    const response = await fetch('https://tonymarks.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Intake unavailable');
    return res.status(200).json({ ok: true });
  } catch {
    // Never log inquiry contents or return upstream details.
    return res.status(502).json({ error: 'Your inquiry could not be sent. Please try again or use the email link below.' });
  }
}
