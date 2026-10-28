import { ArrowUpRight } from 'lucide-react';

export default function CompanyHeader() {
  const link = 'inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';
  return (
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b border-[#172820]/20 px-6 py-6 md:px-10">
        <a href="/" className="flex min-h-11 items-center gap-3 font-bold tracking-tight"><img src="/sapien-mark.svg" alt="" aria-hidden="true" className="company-sapien-mark h-[17px] w-[17px] shrink-0 md:h-[18px] md:w-[18px]" /> PROJECT SAPIENS</a>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-6 text-sm">
          <a className={link} href="/#work">Our work</a><a className={link} href="/#field-notes">Field Notes</a><a className={link} href="/#company">Company</a><a className={link} href="/work-with-us/">Work with us</a><a className={link} href="/#contact">Get in touch <ArrowUpRight aria-hidden="true" size={16} /></a>
        </nav>
      </header>
  );
}
