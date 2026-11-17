import Portrait from './Portrait';
import HeroIllustration from './illustrations/AttentionIsAllYouNeed';
import { useEffect, useState } from 'react';
import CompanyHeader from '../CompanyHeader';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const RELATED_NOTES = [
  {
    href: '/field-notes/the-nuclear-lesson',
    title: 'What We Choose to Delegate',
    excerpt:
      'The nuclear age expanded what humanity could destroy. The AI age is expanding what we can delegate. Meaningful control requires more than a human with the final say.',
    meta: '10 min read',
  },
  {
    href: '/field-notes/infrastructure-era',
    title: 'AI Has Entered Its Infrastructure Era',
    excerpt:
      'Why the biggest AI story isn\u2019t just the models anymore\u2014it\u2019s the infrastructure, capital, regulation, and businesses being built around them.',
    meta: '8 min read',
  },
  {
    href: '/field-notes/ai-brand-visibility',
    title: 'AI Brand Visibility',
    excerpt:
      'Why AI systems are changing what it means for a company to be discoverable\u2014and why understanding may become more important than ranking.',
    meta: '~8 min read',
  },
];

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      className="reading-progress"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}



function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 border-l-2 border-ink pl-6">
      <p className="text-xl font-medium leading-snug text-ink text-balance">
        {children}
      </p>
    </blockquote>
  );
}

export default function AttentionIsAllYouNeed() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="company-site fn-article">
      <ReadingProgress />

      <CompanyHeader /><main id="main"><a className="fn-back" href="/field-notes/">← All Field Notes</a>

      {/* ── Full-width hero ──────────────────────────────── */}
      <div className="border-b border-[#dedfda]">
        <div className="mx-auto max-w-[740px] px-6 pt-16 pb-10 lg:pt-24 lg:pb-14">
          {/* Meta */}
          <div className="fade-in-up flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
            <img
              src="/brand/project-sapiens-circle.png"
              alt=""
              aria-hidden="true"
              className="sapien-mark h-[13px] w-[13px] shrink-0"
            />
            <span>Field Notes</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>Observation</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>No. 05</span>
          </div>

          {/* Title */}
          <h1 className="fade-in-up fade-in-delay-1 mt-6 text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink text-balance">
            What &ldquo;Attention Is All You Need&rdquo; Actually Changed
          </h1>

          {/* Subtitle */}
          <p className="fade-in-up fade-in-delay-2 mt-6 text-lg leading-relaxed text-ink/60 text-balance lg:text-xl">
            The Transformer paper changed AI. More importantly, it changed how I
            think about building products.
          </p>

          {/* Meta line */}
          <div className="fade-in-up fade-in-delay-3 mt-8 flex items-center gap-4 text-sm text-[#626762]">
            <span>August 2026</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>~9 min read</span>
          </div>

          {/* Observation */}
          <div className="fade-in-up fade-in-delay-4 mt-10 border-t border-[#dedfda] pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
              Observation
            </p>
            <p className="mt-4 text-xl font-medium leading-snug text-ink text-balance">
              Attention isn&rsquo;t just a machine learning mechanism.
            </p>
            <p className="mt-2 text-xl font-medium leading-snug text-ink text-balance">
              It&rsquo;s a product design principle.
            </p>
          </div>
        </div>

        {/* Hero illustration */}
        <div className="fade-in-up fade-in-delay-5 mx-auto max-w-[740px] px-6 pb-14 lg:pb-20">
          <HeroIllustration />
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────── */}
      <div className="mx-auto max-w-[740px] px-6 py-16 lg:py-20">
        <div className="space-y-6 text-[1.125rem] leading-[1.7] text-ink/85 lg:text-[1.1875rem] lg:leading-[1.7]">
          {/* ── Section 1: The paper ── */}
          <p>
            In 2017, a team of researchers at Google published a paper called
            &ldquo;Attention Is All You Need.&rdquo; The premise was
            deceptively simple. Instead of processing information sequentially,
            a model could look at everything at once and learn which parts
            mattered most. It could assign weight. It could prioritize. It could
            decide what deserved attention and what didn&rsquo;t.
          </p>

          <p>
            That single idea reshaped the trajectory of artificial intelligence.
            Models built on attention mechanisms could capture relationships
            across entire passages of text, not just adjacent words. They could
            hold context. They could understand that a word at the beginning of
            a sentence might matter more than the word right next to it. The
            result was a leap in capability so dramatic that nearly every
            modern AI system traces back to that paper.
          </p>

          <p>
            But the deeper insight wasn&rsquo;t just architectural. It was
            conceptual. Attention gave machines a way to separate signal from
            noise. To look at a universe of information and decide what
            mattered. That idea&mdash;that intelligence is partly about knowing
            what to ignore&mdash;turned out to be far bigger than machine
            learning.
          </p>

          <p className="text-ink font-medium">
            Attention isn&rsquo;t just how modern AI works. It&rsquo;s
            increasingly how modern products work.
          </p>

          {/* ── Section 2: Attention becomes product design ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Attention becomes product design
          </h2>

          <p>
            Every product makes an implicit decision about what deserves
            attention. A dashboard shows every metric equally and overwhelms
            the user. A well-designed interface surfaces the one number that
            matters and lets the rest recede. The difference isn&rsquo;t the
            data. It&rsquo;s the editorial judgment about which part of the data
            deserves to be seen first.
          </p>

          <p>
            Users don&rsquo;t need more information. They need the right
            information. They need a system that has already done the work of
            deciding what matters in this moment, for this person, in this
            context. That&rsquo;s what attention means in product design. Not
            showing everything. Showing the right thing.
          </p>

          <p>
            Consider how many products fail at this. Search engines that return
            ten blue links when you needed one answer. Dashboards that display
            fifty metrics when one decision matters. News apps that present
            five hundred stories when you have three minutes. The problem
            isn&rsquo;t a lack of data. It&rsquo;s a lack of prioritization.
          </p>

          <PullQuote>
            Users don&rsquo;t need more information. They need the right
            information.
          </PullQuote>

          <p>
            The products that feel intelligent&mdash;the ones that create a
            sense of relief rather than burden&mdash;are almost always products
            that have made a strong decision about what to attend to. They
            reduce noise. They increase signal. They treat the user&rsquo;s
            attention as the scarce resource it actually is.
          </p>

          {/* ── Section 3: The pattern in my own work ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The pattern in my own work
          </h2>

          <p>
            I didn&rsquo;t set out to build products around a theory of
            attention. But looking back at the last decade, the pattern is hard
            to miss. Each project I&rsquo;ve built was, at its core, a system
            for deciding what deserves attention.
          </p>

          {/* ── Centered editorial diagram ── */}
          <div className="my-14">
            <div className="mb-8 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
                One Pattern, Four Products
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/60 text-balance">
                Each product reduces noise and increases attention in a
                different domain.
              </p>
            </div>
            <HeroIllustration />
          </div>

          <p>
            <span className="font-semibold text-ink">Project Sapiens</span> helps
            people focus on the right AI concept instead of every concept. The
            problem isn&rsquo;t a lack of AI tools or educational content. There
            is an overwhelming surplus of both. The problem is figuring out
            which concept matters for the person, at their level, right now.
            Attention means filtering the curriculum before it reaches the
            user.
          </p>

          <p>
            <span className="font-semibold text-ink">Hotline Sports</span> helps
            fans find the one game they can actually watch instead of showing
            every game. The sports broadcast landscape is a maze of
            subscriptions, blackouts, and regional restrictions. Showing a fan
            every game being played today is useless. Showing them the one
            game they can access, on the service they already pay for, is
            attention as product design.
          </p>

          <p>
            <span className="font-semibold text-ink">Pronunciation
            Intelligence</span> helps voice AI pay attention to the one detail
            people always notice&mdash;their name. A voice assistant can get
            weather, traffic, and calendar right. But if it mispronounces
            someone&rsquo;s name, that&rsquo;s the only thing they remember.
            Attention means knowing which details are small in the data but
            large in the experience.
          </p>

          <p>
            <span className="font-semibold text-ink">AI Brand Visibility</span>
            helps AI systems pay attention to the information that best
            represents an organization. When a model forms an understanding of a
            company, it draws on whatever signals are available. If the
            strongest signals are noise, the understanding is noise. Attention
            means making sure the right information is the most visible
            information.
          </p>

          <PullQuote>
            Each product reduces noise. Each product increases attention. The
            domain changes. The principle doesn&rsquo;t.
          </PullQuote>

          {/* ── Section 4: Reflection ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Reflection
          </h2>

          <p>
            I didn&rsquo;t notice the pattern while it was forming. Each project
            felt like its own problem. Pronunciation was a speech problem.
            Hotline Sports was a sports media problem. Project Sapiens was an
            education problem. AI Brand Visibility was a discovery problem.
            Different domains, different users, different technologies.
          </p>

          <p>
            But looking back, they all shared one structure. Each one took a
            landscape of overwhelming information and built a system to decide
            what mattered. Each one reduced noise. Each one increased
            attention. The products looked different from the outside. Inside,
            they were doing the same thing.
          </p>

          <p>
            That&rsquo;s what makes &ldquo;attention&rdquo; such a useful mental
            model for building products. It reframes the work. The question
            stops being &ldquo;what can we show the user?&rdquo; and becomes
            &ldquo;what should we attend to?&rdquo; The answer is almost never
            &ldquo;everything.&rdquo; It&rsquo;s usually one thing, chosen well,
            presented clearly, with the rest available but not demanding.
          </p>

          <p className="text-ink font-medium">
            Looking back, I don&rsquo;t think I&rsquo;ve spent the last decade
            building AI. I think I&rsquo;ve spent the last decade building
            systems that help people&mdash;and increasingly AI&mdash;pay
            attention to the right things.
          </p>

          <p className="text-ink font-medium">
            Different products. Same question. What deserves attention?
          </p>

          {/* ── Key Takeaways ── */}
          <div className="mt-16 rounded-lg border border-[#dedfda] px-6 py-8 lg:px-10 lg:py-10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
              Key Takeaways
            </p>
            <ul className="mt-5 space-y-4">
              {[
                'Attention is becoming a product design principle.',
                'Great AI products reduce noise.',
                'AI is increasingly deciding what deserves attention.',
                'Every product reflects a philosophy of attention.',
                'Attention creates understanding.',
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-ink"
                >
                  <span className="mt-3 h-px w-4 shrink-0 bg-[#a5aaa5]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Current exploration ── */}
          <div className="mt-12 border-t border-[#dedfda] pt-8">
            <h2 className="text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
              Current exploration
            </h2>

            <p className="mt-4">I&rsquo;m continuing to explore:</p>

            <ul className="mt-3 space-y-2">
              {[
                'AI attention systems',
                'personalized AI interfaces',
                'watch intelligence',
                'pronunciation intelligence',
                'AI brand visibility',
                'human-centered AI',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-3 h-px w-4 shrink-0 bg-[#a5aaa5]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Author box ── */}
          <div className="mt-12 border-t border-[#dedfda] pt-10">
            <div className="flex items-start gap-4">
              <Portrait className="w-20 shrink-0" />
              <div>
                <p className="text-base font-semibold text-ink">Tony Marks</p>
                <p className="mt-1 text-sm text-[#626762]">
                  Founder of Project Sapiens
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
                  Builder of AI systems for the Olympic Games, NBA, NFL,
                  airlines, and enterprise platforms. Currently exploring
                  attention as a product design principle, personalized AI
                  interfaces, and human-centered AI.
                </p>
                <a
                  href="/"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#626762] transition-opacity hover:opacity-70"
                >
                  <ArrowLeft size={16} strokeWidth={2} />
                  Back to homepage
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Field Notes ─────────────────────────── */}
      <section className="border-t border-[#dedfda] py-16 lg:py-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <p className="mb-8 text-sm font-medium text-ink">Related Field Notes</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RELATED_NOTES.map((note) => (
              <a
                key={note.href}
                href={note.href}
                className="group flex flex-col border-t border-[#dedfda] pt-6 transition-colors hover:border-ink/30"
              >
                <h3 className="text-base font-semibold leading-snug text-ink">
                  {note.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/60">
                  {note.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-[#626762] transition-opacity group-hover:opacity-70">
                  <span>{note.meta}</span>
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main></article>
  );
}
