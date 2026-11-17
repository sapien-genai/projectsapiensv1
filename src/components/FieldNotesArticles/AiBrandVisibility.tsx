import Portrait from './Portrait';
import HeroIllustration from './illustrations/AiBrandVisibility';
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
    href: '/field-notes/infrastructure-era',
    title: 'AI Has Entered Its Infrastructure Era',
    excerpt:
      'Why the biggest AI story isn\u2019t just the models anymore\u2014it\u2019s the infrastructure, capital, regulation, and businesses being built around them.',
    meta: '8 min read',
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



function ReportDiagram() {
  return (
    <svg
      viewBox="0 0 800 1040"
      className="w-full h-auto"
      fill="none"
      stroke="#111111"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="A conceptual AI Brand Visibility Report diagram: a company evaluated by four AI models, producing a narrative summary, recognition and discovery assessments, knowledge gaps, public signals, and recommendations."
    >
      {/* ── Header rule ────────────────────────────────── */}
      <line x1="40" y1="60" x2="760" y2="60" strokeWidth="1" />
      <line x1="40" y1="64" x2="760" y2="64" strokeWidth="0.5" opacity="0.4" />

      {/* ── Company + Models ───────────────────────────── */}
      <text x="40" y="92" fontSize="10" letterSpacing="3" strokeWidth="0" fill="#111" opacity="0.5">
        COMPANY
      </text>
      <text x="40" y="116" fontSize="15" strokeWidth="0" fill="#111">
        example.com
      </text>

      <line x1="40" y1="134" x2="760" y2="134" strokeWidth="0.5" opacity="0.3" />

      <text x="40" y="158" fontSize="10" letterSpacing="3" strokeWidth="0" fill="#111" opacity="0.5">
        MODELS
      </text>
      <text x="40" y="182" fontSize="13" strokeWidth="0" fill="#111">
        ChatGPT
      </text>
      <text x="180" y="182" fontSize="13" strokeWidth="0" fill="#111">
        Claude
      </text>
      <text x="320" y="182" fontSize="13" strokeWidth="0" fill="#111">
        Gemini
      </text>
      <text x="460" y="182" fontSize="13" strokeWidth="0" fill="#111">
        Perplexity
      </text>

      {/* Down arrow */}
      <line x1="400" y1="200" x2="400" y2="228" strokeWidth="1" />
      <path d="M 394 224 L 400 234 L 406 224" strokeWidth="1" />

      {/* ── Current Understanding ──────────────────────── */}
      <line x1="40" y1="252" x2="760" y2="252" strokeWidth="0.5" opacity="0.3" />
      <text x="40" y="276" fontSize="10" letterSpacing="3" strokeWidth="0" fill="#111" opacity="0.5">
        CURRENT UNDERSTANDING
      </text>
      <text x="400" y="300" textAnchor="middle" fontSize="13" strokeWidth="0" fill="#111" opacity="0.7">
        Narrative summary
      </text>

      {/* Down arrow */}
      <line x1="400" y1="316" x2="400" y2="344" strokeWidth="1" />
      <path d="M 394 340 L 400 350 L 406 340" strokeWidth="1" />

      {/* ── Recognition ────────────────────────────────── */}
      <line x1="40" y1="368" x2="760" y2="368" strokeWidth="0.5" opacity="0.3" />
      <text x="40" y="392" fontSize="10" letterSpacing="3" strokeWidth="0" fill="#111" opacity="0.5">
        RECOGNITION
      </text>
      <text x="400" y="416" textAnchor="middle" fontSize="13" strokeWidth="0" fill="#111" opacity="0.7">
        Can AI identify us by name?
      </text>

      {/* Down arrow */}
      <line x1="400" y1="432" x2="400" y2="460" strokeWidth="1" />
      <path d="M 394 456 L 400 466 L 406 456" strokeWidth="1" />

      {/* ── Discovery ──────────────────────────────────── */}
      <line x1="40" y1="484" x2="760" y2="484" strokeWidth="0.5" opacity="0.3" />
      <text x="40" y="508" fontSize="10" letterSpacing="3" strokeWidth="0" fill="#111" opacity="0.5">
        DISCOVERY
      </text>
      <text x="400" y="532" textAnchor="middle" fontSize="13" strokeWidth="0" fill="#111" opacity="0.7">
        Does AI recommend us when describing our category?
      </text>

      {/* Down arrow */}
      <line x1="400" y1="548" x2="400" y2="576" strokeWidth="1" />
      <path d="M 394 572 L 400 582 L 406 572" strokeWidth="1" />

      {/* ── Knowledge Gaps ─────────────────────────────── */}
      <line x1="40" y1="600" x2="760" y2="600" strokeWidth="0.5" opacity="0.3" />
      <text x="40" y="624" fontSize="10" letterSpacing="3" strokeWidth="0" fill="#111" opacity="0.5">
        KNOWLEDGE GAPS
      </text>
      <g fontSize="13" strokeWidth="0" fill="#111" opacity="0.7">
        <text x="120" y="652">Products</text>
        <text x="280" y="652">Founder</text>
        <text x="440" y="652">History</text>
        <text x="600" y="652">Messaging</text>
      </g>
      {/* Gap markers */}
      <g strokeWidth="1" opacity="0.5">
        <line x1="120" y1="664" x2="120" y2="676" />
        <line x1="116" y1="672" x2="124" y2="672" />
        <line x1="280" y1="664" x2="280" y2="676" />
        <line x1="276" y1="672" x2="284" y2="672" />
        <line x1="440" y1="664" x2="440" y2="676" />
        <line x1="436" y1="672" x2="444" y2="672" />
        <line x1="600" y1="664" x2="600" y2="676" />
        <line x1="596" y1="672" x2="604" y2="672" />
      </g>

      {/* Down arrow */}
      <line x1="400" y1="692" x2="400" y2="720" strokeWidth="1" />
      <path d="M 394 716 L 400 726 L 406 716" strokeWidth="1" />

      {/* ── Public Signals ─────────────────────────────── */}
      <line x1="40" y1="744" x2="760" y2="744" strokeWidth="0.5" opacity="0.3" />
      <text x="40" y="768" fontSize="10" letterSpacing="3" strokeWidth="0" fill="#111" opacity="0.5">
        PUBLIC SIGNALS
      </text>
      <g fontSize="13" strokeWidth="0" fill="#111" opacity="0.7">
        <text x="80" y="796">Website</text>
        <text x="220" y="796">Documentation</text>
        <text x="380" y="796">Structured data</text>
        <text x="540" y="796">Founder writing</text>
        <text x="80" y="820">Press</text>
        <text x="220" y="820">GitHub</text>
      </g>

      {/* Down arrow */}
      <line x1="400" y1="840" x2="400" y2="868" strokeWidth="1" />
      <path d="M 394 864 L 400 874 L 406 864" strokeWidth="1" />

      {/* ── Recommendations ───────────────────────────── */}
      <line x1="40" y1="892" x2="760" y2="892" strokeWidth="0.5" opacity="0.3" />
      <text x="40" y="916" fontSize="10" letterSpacing="3" strokeWidth="0" fill="#111" opacity="0.5">
        RECOMMENDATIONS
      </text>
      <g fontSize="14" strokeWidth="0" fill="#111">
        <text x="100" y="948">Clarify</text>
        <text x="260" y="948">Document</text>
        <text x="420" y="948">Connect</text>
        <text x="580" y="948">Strengthen</text>
      </g>

      {/* ── Footer rule ────────────────────────────────── */}
      <line x1="40" y1="1000" x2="760" y2="1000" strokeWidth="1" />
      <line x1="40" y1="1004" x2="760" y2="1004" strokeWidth="0.5" opacity="0.4" />
    </svg>
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

export default function AiBrandVisibility() {
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
            <span>No. 02</span>
          </div>

          {/* Title */}
          <h1 className="fade-in-up fade-in-delay-1 mt-6 text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink text-balance">
            AI Brand Visibility
          </h1>

          {/* Subtitle */}
          <p className="fade-in-up fade-in-delay-2 mt-6 text-lg leading-relaxed text-ink/60 text-balance lg:text-xl">
            Why AI systems are changing what it means for a company to be
            discoverable&mdash;and why understanding may become more important
            than ranking.
          </p>

          {/* Meta line */}
          <div className="fade-in-up fade-in-delay-3 mt-8 flex items-center gap-4 text-sm text-[#626762]">
            <span>August 2026</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>~8 min read</span>
          </div>

          {/* Observation */}
          <div className="fade-in-up fade-in-delay-4 mt-10 border-t border-[#dedfda] pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
              Observation
            </p>
            <p className="mt-4 text-xl font-medium leading-snug text-ink text-balance">
              Companies are no longer simply being indexed.
            </p>
            <p className="mt-2 text-xl font-medium leading-snug text-ink text-balance">
              They&rsquo;re being interpreted.
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
          {/* ── Introduction ── */}
          <p>
            For most of the last twenty years, being discoverable meant one
            thing: showing up in a search engine. Companies invested in
            keywords, backlinks, page structure, and content designed to be
            read by crawlers. The goal was simple. Be found when someone
            typed a query.
          </p>

          <p>
            That model is changing. Increasingly, people don&rsquo;t search.
            They ask. They open ChatGPT, Claude, Gemini, or Perplexity and pose
            a question in natural language. Instead of a list of links, they
            receive a synthesized answer. The web is still underneath, but the
            interface has shifted from pages to conversation.
          </p>

          {/* ── Section: The shift from search to conversation ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The shift from search to conversation
          </h2>

          <p>
            The difference is subtle but structural. A search engine returns
            options. A language model returns a position. When someone asks an
            AI for a recommendation, the AI doesn&rsquo;t present a menu of
            links to evaluate. It synthesizes an answer from what it
            understands about the world. The company that appears in that
            answer is there because the model has formed a representation of
            it. The company that is absent is absent because it hasn&rsquo;t.
          </p>

          <p>
            This changes the unit of visibility. In the link-based world,
            visibility was a ranking problem. In the answer-based world,
            visibility is an understanding problem. Being found no longer
            means being indexed. It means being interpretable.
          </p>

          <PullQuote>
            Companies are no longer being read. They&rsquo;re being summarized.
          </PullQuote>

          {/* ── Section: What AI systems actually understand ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            What AI systems actually understand
          </h2>

          <p>
            Language models don&rsquo;t browse the web the way people do. They
            rely on training data, retrieval pipelines, and structured signals
            to form an understanding of the world. When a model describes a
            company, it draws on whatever it has encountered: public
            documentation, press coverage, schema markup, Wikipedia entries,
            and the overall shape of a brand&rsquo;s presence across the web.
          </p>

          <p>
            If that material is thin, inconsistent, or hard to interpret, the
            model&rsquo;s description will be too. Not because the company is
            unimportant, but because the signals weren&rsquo;t clear enough for
            an AI system to form an accurate picture.
          </p>

          <p>
            Understanding is different from indexing. A crawler can index a
            page without comprehending it. A language model forms a
            representation&mdash;an entity, a set of relationships, a narrative.
            That representation is what surfaces when someone asks. If it is
            vague, the company is vague. If it is wrong, the company is
            misrepresented. If it doesn&rsquo;t exist, the company is invisible.
          </p>

          <PullQuote>
            Understanding is different from indexing.
          </PullQuote>

          {/* ── Section: Recognition isn't discovery ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Recognition isn&rsquo;t discovery
          </h2>

          <p>
            There is a difference between being recognized and being
            recommended. An AI system may know a company exists. It may
            correctly identify the founder, the product, the category. But
            when asked to describe the landscape of a market, it may omit
            that company entirely. Recognition is not the same as discovery.
          </p>

          <p>
            This is the gap most organizations haven&rsquo;t examined. They
            know their search rankings. They rarely know what happens when
            someone asks an AI, &ldquo;What does this company do?&rdquo; The
            answer might be accurate. It might be vague. It might be outdated.
            It might confuse the company with a competitor. In most cases, no
            one has checked.
          </p>

          <p>
            That gap will widen as more decisions move inside AI
            interfaces&mdash;from product research to vendor selection to
            plain curiosity. The companies that are easier for AI systems to
            understand will be better represented in the answers people
            receive.
          </p>

          <PullQuote>
            AI may know your company exists without ever recommending it.
          </PullQuote>

          {/* ── Section: Not AI SEO ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Not AI SEO
          </h2>

          <p>
            This isn&rsquo;t about tricking language models or gaming their
            outputs. Attempting to manipulate how an AI describes a company is
            a fragile strategy. Models update. Retrieval changes. Signals that
            work today may not work tomorrow.
          </p>

          <p>
            A better approach is to make a company genuinely easier to
            understand. Clear public documentation. Consistent entity
            information. Structured content that connects products, people,
            and context. Documentation that holds up whether the reader is a
            person or a model.
          </p>

          <PullQuote>
            The goal isn&rsquo;t to manipulate AI. It&rsquo;s to become easier
            to understand.
          </PullQuote>

          {/* ── Section: What I'm imagining ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            What I&rsquo;m imagining
          </h2>

          <p>
            I don&rsquo;t think AI Brand Visibility will be measured with a
            single score. It&rsquo;s much more interesting than that. Imagine
            entering your company URL and receiving a report that explains not
            only whether AI systems know your company exists&mdash;but how they
            understand it.
          </p>

          <p>
            A report that shows what each major model currently understands.
            Where the gaps are. Which public signals are being read. Which are
            being missed. What would need to change for the company to be more
            accurately represented.
          </p>

          {/* ── Report illustration ── */}
          <div className="my-14">
            <div className="mb-8 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
                AI Brand Visibility Report
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/60 text-balance">
                A conceptual report exploring how modern AI systems understand
                an organization.
              </p>
            </div>
            <ReportDiagram />
          </div>

          <p>
            This isn&rsquo;t a product today. It&rsquo;s the direction
            I&rsquo;m exploring.
          </p>

          <p>
            I don&rsquo;t think AI visibility will ultimately be measured by a
            single score. I think it will be understood through a richer
            picture of how AI systems currently interpret an organization.
          </p>

          {/* ── Section: Why this matters ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Why this matters
          </h2>

          <p>
            We are early in a transition. Search isn&rsquo;t disappearing, but
            it is no longer the only place where decisions begin. More people
            will form their first impression of a company through an AI
            summary than through a homepage.
          </p>

          <p>
            Companies that treat this as a real channel&mdash;not a gimmick,
            not a trick&mdash;will be better positioned as the shift
            accelerates. The work is unglamorous. It is mostly clarity,
            structure, and consistency. But it compounds.
          </p>

          <p className="text-ink font-medium">
            Search isn&rsquo;t disappearing. But AI has become another front
            door.
          </p>

          {/* ── Key Takeaways ── */}
          <div className="mt-16 rounded-lg border border-[#dedfda] px-6 py-8 lg:px-10 lg:py-10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
              Key Takeaways
            </p>
            <ul className="mt-5 space-y-4">
              {[
                'Companies are no longer simply indexed. They are interpreted.',
                'Recognition and recommendation are different problems.',
                'AI Brand Visibility is about understanding, not manipulation.',
                'Clear documentation becomes infrastructure for AI systems.',
                'The goal isn\u2019t ranking.',
                'The goal is being understood.',
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
                'AI Brand Visibility',
                'knowledge architecture',
                'entity understanding',
                'structured content',
                'founder writing',
                'documentation for the LLM era',
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
                  airlines, and enterprise platforms. Currently exploring AI
                  Brand Visibility, knowledge architecture, and how
                  organizations become understood by AI systems.
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
