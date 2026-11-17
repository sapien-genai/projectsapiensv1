import Portrait from './Portrait';
import HeroIllustration from './illustrations/InfrastructureEra';
import { useEffect, useState } from 'react';
import CompanyHeader from '../CompanyHeader';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const RELATED_NOTES = [
  {
    href: '/field-notes/attention-is-all-you-need',
    title: 'What \u201CAttention Is All You Need\u201D Actually Changed',
    excerpt:
      'The Transformer paper changed AI. More importantly, it changed how I think about building products.',
    meta: '~9 min read',
  },
  {
    href: '/field-notes/hotline-broadcast-deep-dive',
    title: 'Why Is It So Hard to Watch Sports?',
    excerpt:
      'A deep dive into 100 years of broadcast complexity\u2014from the first radio broadcast in 1921 to the six-subscription NFL viewing experience of 2026.',
    meta: '~18 min read',
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

export default function InfrastructureEra() {
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
            <span>Artificial Intelligence</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>No. 03</span>
          </div>

          {/* Title */}
          <h1 className="fade-in-up fade-in-delay-1 mt-6 text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink text-balance">
            AI Has Entered Its Infrastructure Era
          </h1>

          {/* Subtitle */}
          <p className="fade-in-up fade-in-delay-2 mt-6 text-lg leading-relaxed text-ink/60 text-balance lg:text-xl">
            Why the biggest AI story isn&rsquo;t just the models anymore&mdash;it&rsquo;s
            the infrastructure, capital, regulation, and businesses being built
            around them.
          </p>

          {/* Meta line */}
          <div className="fade-in-up fade-in-delay-3 mt-8 flex items-center gap-4 text-sm text-[#626762]">
            <span>August 2026</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>~8 min read</span>
          </div>
        </div>

        {/* Hero illustration */}
        <div className="fade-in-up fade-in-delay-4 mx-auto max-w-[740px] px-6 pb-14 lg:pb-20">
          <HeroIllustration />
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────── */}
      <div className="mx-auto max-w-[740px] px-6 py-16 lg:py-20">
        <div className="space-y-6 text-[1.125rem] leading-[1.7] text-ink/85 lg:text-[1.1875rem] lg:leading-[1.7]">
          {/* ── Introduction ── */}
          <p>
            For the last few years, the AI conversation has been dominated by a
            single question: which model is best? Benchmarks, leaderboards,
            and capability comparisons have framed how the industry thinks
            about progress. But something has shifted. The most consequential
            decisions in AI are no longer only about the models. They are about
            what surrounds them.
          </p>

          <p>
            The data centers powering inference. The energy contracts
            sustaining them. The regulatory frameworks forming around them. The
            businesses being built on top of them. The story is no longer just
            about intelligence. It is about infrastructure.
          </p>

          <PullQuote>
            AI is no longer just a software story. It&rsquo;s becoming an
            infrastructure story.
          </PullQuote>

          {/* ── Section: The capital behind the models ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The capital behind the models
          </h2>

          <p>
            The scale of investment has changed the nature of the conversation.
            When companies commit tens of billions of dollars to compute, they
            are no longer simply funding research. They are building industrial
            capacity. Data centers, cooling systems, power purchase agreements,
            custom silicon&mdash;these are not software decisions. They are
            infrastructure decisions with decades-long horizons.
          </p>

          <p>
            That capital is reshaping the competitive landscape. The companies
            that can afford to build at this scale are becoming fewer. The gap
            between frontier capabilities and everyone else is increasingly a
            gap in infrastructure, not just in research talent. Model quality
            still matters. But the ability to train, serve, and scale models
            reliably is becoming the deeper moat.
          </p>

          <p>
            This is why capital spending now matters as much as model quality.
            A team that produces a marginally better model but cannot deploy it
            globally at low latency is at a structural disadvantage. The
            infrastructure is the product.
          </p>

          {/* ── Section: Search becomes discovery ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Search becomes discovery
          </h2>

          <p>
            One of the most visible shifts is happening in search. For two
            decades, search meant a list of links. You typed a query, scanned
            results, clicked through, and synthesized the answer yourself. That
            model is being replaced. Increasingly, people ask a question and
            receive a synthesized answer directly. The underlying web is still
            there, but the interface has changed from navigation to
            conversation.
          </p>

          <p>
            This changes what it means to be discoverable. In the link-based
            world, visibility meant ranking. In the answer-based world,
            visibility means being understood. AI systems don&rsquo;t simply
            index pages. They form representations of entities, relationships,
            and context. A company that is easy for AI to understand will appear
            in more answers. A company that is hard to interpret will be omitted,
            regardless of how good its product is.
          </p>

          <PullQuote>
            Search is evolving into AI discovery. Being found now means being
            understood.
          </PullQuote>

          <p>
            This is why AI Brand Visibility is becoming strategically important.
            It is not a marketing tactic. It is a structural shift in how
            organizations become visible. The companies that treat it as a real
            channel&mdash;not a gimmick&mdash;will be better positioned as the
            shift accelerates.
          </p>

          {/* ── Section: The regulatory frontier ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The regulatory frontier
          </h2>

          <p>
            Governments have moved from observers to participants. The EU AI
            Act, US executive orders, and emerging frameworks in the UK, Japan,
            and elsewhere are shaping how frontier models can be developed,
            deployed, and sold. Regulation is no longer a future
            consideration. It is a present variable in product decisions.
          </p>

          <p>
            This introduces a new kind of constraint. Companies building AI
            systems now navigate export controls, compute reporting
            requirements, model evaluation mandates, and risk classification
            frameworks. The cost of compliance is real, and it is reshaping
            which companies can operate in which markets. Governments are
            beginning to shape frontier AI&mdash;not always gracefully, and not
            always coherently, but meaningfully.
          </p>

          <p>
            The companies that treat regulation as a design constraint from the
            beginning will move faster than those that treat it as an
            afterthought. Infrastructure includes legal infrastructure.
          </p>

          {/* ── Section: Hosted vs downloadable ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Hosted vs downloadable
          </h2>

          <p>
            The open vs closed debate has framed how the industry thinks about
            model access. But a more practical distinction is emerging:
            hosted vs downloadable. A model that can be downloaded and run
            locally offers autonomy, privacy, and control. A model that is
            hosted behind an API offers convenience, scale, and continuous
            improvement. These are not just deployment choices. They reflect
            fundamentally different relationships with AI.
          </p>

          <p>
            Hosted models can be updated continuously, moderated, and
            orchestrated at scale. Downloadable models can be audited, adapted,
            and run without a network connection. As AI becomes infrastructure,
            this distinction may become more important than open vs closed. A
            company might release model weights freely but still build its
            business around a hosted version that is faster, safer, and better
            integrated. The weights are open. The infrastructure is not.
          </p>

          <PullQuote>
            Hosted vs downloadable may become a more important distinction than
            open vs closed.
          </PullQuote>

          {/* ── Section: What this means for builders ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            What this means for builders
          </h2>

          <p>
            For anyone building AI products, the implication is clear. The
            model is a component, not the product. The product is the system
            around the model: the data pipeline, the inference infrastructure,
            the evaluation harness, the safety layer, the user experience, the
            regulatory posture. Companies that focus only on model quality
            will find themselves outpaced by companies that build the full
            stack.
          </p>

          <p>
            This is also why the most interesting AI companies right now are not
            always the ones with the best models. They are the ones with the
            best infrastructure. The ones who can ship, scale, and comply. The
            ones who understand that AI is no longer just a research
            discipline&mdash;it is an industrial one.
          </p>

          <p className="text-ink font-medium">
            The model is a component. The infrastructure is the product.
          </p>

          {/* ── Key Takeaways ── */}
          <div className="mt-16 rounded-lg border border-[#dedfda] px-6 py-8 lg:px-10 lg:py-10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
              Key Takeaways
            </p>
            <ul className="mt-5 space-y-4">
              {[
                'AI has entered an infrastructure phase.',
                'Capital spending now matters as much as model quality.',
                'Search is evolving into AI discovery.',
                'AI Brand Visibility is becoming strategically important.',
                'Governments are beginning to shape frontier AI.',
                'Hosted vs downloadable AI may become a more important distinction than open vs closed.',
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
                  airlines, and enterprise platforms. Currently exploring AI
                  infrastructure, AI Brand Visibility, and the future of
                  human-computer interaction.
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
