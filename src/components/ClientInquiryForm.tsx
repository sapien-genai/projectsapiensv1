import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';

const inputClass = 'mt-2 block min-h-12 w-full rounded-lg border border-[#172820]/30 bg-white/50 px-4 py-3 text-base text-[#172820] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#68745b]';

export default function ClientInquiryForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const sending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    sending.current = true;
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/client-inquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('Submission failed');
      setStatus('sent');
      form.reset();
    } catch {
      setError('Your inquiry could not be confirmed. Please try again, or email Tony using the link below. Your details are still here.');
      setStatus('error');
    } finally { sending.current = false; }
  }

  return <section id="contact" aria-labelledby="contact-title" className="scroll-mt-8 py-16 md:py-20">
    <div className="grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-16">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">New projects & collaborations</p>
        <h2 id="contact-title" className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">Something worth building together?</h2>
        <p className="mt-5 leading-relaxed text-[#526055]">Tell us what you’re trying to build or improve, who it’s for, and where you are today. Tony will review your inquiry and get back to you.</p>
        <p className="mt-4 text-sm leading-relaxed text-[#526055]">An early idea is welcome. Budget and timing can be approximate.</p>
      </div>
      <div>
        <div role="status" aria-live="polite">
          {status === 'sent' && <div className="rounded-xl border border-[#172820]/20 bg-white/50 p-6"><h3 className="text-xl font-semibold">Thanks for getting in touch.</h3><p className="mt-3 leading-relaxed text-[#526055]">Your inquiry has been submitted. Tony will follow up at the email address you provided.</p></div>}
        </div>
        {status !== 'sent' && <form onSubmit={submit} method="post" action="/api/client-inquiry" aria-label="New client inquiry" className="space-y-5">
          <p className="text-sm text-[#526055]">Fields marked * are required.</p>
          <fieldset disabled={status === 'sending'} className="space-y-5 disabled:opacity-70">
            <div className="hidden" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></label></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold" htmlFor="inquiry-name">Name *<input className={inputClass} id="inquiry-name" name="name" autoComplete="name" required maxLength={120} /></label>
              <label className="block text-sm font-semibold" htmlFor="inquiry-email">Email *<input className={inputClass} id="inquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
            </div>
            <label className="block text-sm font-semibold" htmlFor="inquiry-company">Company<input className={inputClass} id="inquiry-company" name="company" autoComplete="organization" maxLength={200} /></label>
            <label className="block text-sm font-semibold" htmlFor="inquiry-project">What would you like to build or improve? *<textarea className={inputClass} id="inquiry-project" name="project" rows={5} required maxLength={5000} aria-describedby="inquiry-project-help" /></label>
            <p id="inquiry-project-help" className="text-sm text-[#526055]">A short description of the problem, audience, and what success would look like.</p>
            <label className="block text-sm font-semibold" htmlFor="inquiry-stage">Current stage<select className={inputClass} id="inquiry-stage" name="stage" defaultValue=""><option value="">Select if known</option>{['Exploring an idea', 'Defined concept', 'Prototype exists', 'Product in development', 'Existing product needs improvement', 'Production system needs scaling'].map(value => <option key={value}>{value}</option>)}</select></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold" htmlFor="inquiry-budget">Approximate budget<select className={inputClass} id="inquiry-budget" name="budget" defaultValue=""><option value="">Select if known</option>{['Under $10,000', '$10,000–$25,000', '$25,000–$50,000', '$50,000–$100,000', '$100,000+', 'Not sure yet'].map(value => <option key={value}>{value}</option>)}</select></label>
              <label className="block text-sm font-semibold" htmlFor="inquiry-timeline">Desired timeline<select className={inputClass} id="inquiry-timeline" name="timeline" defaultValue=""><option value="">Select if known</option>{['ASAP', '1–3 months', '3–6 months', '6+ months', 'Flexible'].map(value => <option key={value}>{value}</option>)}</select></label>
            </div>
            <p className="text-sm leading-relaxed text-[#526055]">We’ll use these details to respond to your inquiry. Please leave out passwords and confidential information.</p>
            <button className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#172820] px-6 py-3 font-semibold text-[#f4f2ec] hover:bg-[#2b4032] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait" type="submit">{status === 'sending' ? 'Sending…' : 'Send inquiry'}<ArrowUpRight aria-hidden="true" size={18} /></button>
          </fieldset>
          {status === 'error' && <p role="alert" className="rounded-lg border border-red-800/30 p-4 text-sm text-red-900">{error}</p>}
        </form>}
        <p className="mt-6 text-sm text-[#526055]">Prefer email? <a href="mailto:tony@projectsapiens.xyz" className="inline-block py-2 font-semibold underline underline-offset-4">tony@projectsapiens.xyz</a></p>
      </div>
    </div>
  </section>;
}
