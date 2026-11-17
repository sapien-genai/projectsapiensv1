import VoiceIllustration from './illustrations/PronunciationIntelligence';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import CompanyHeader from '../CompanyHeader';

export default function PronunciationIntelligence() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="company-site fn-article">
      <CompanyHeader /><main id="main"><a className="fn-back" href="/field-notes/">← All Field Notes</a>

      {/* Field Note */}
      <div className="mx-auto max-w-[740px] px-6 py-20 lg:py-24">
        {/* Title block */}
        <div className="border-b border-[#dedfda] pb-10">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
            <img
              src="/brand/project-sapiens-circle.png"
              alt=""
              aria-hidden="true"
              className="sapien-mark h-[13px] w-[13px] shrink-0"
            />
            Field Notes
            <span className="text-[#a5aaa5]">/</span>
            <span>No. 01</span>
          </p>
          <h1 className="mt-5 text-[clamp(1.7rem,3.8vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-ink text-balance">
            How We Accidentally Started Building Pronunciation Intelligence
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink/60 text-balance">
            A small product problem during a Chicago Bears AI project turned into
            years of thinking about names, speech, and one of the most human
            problems in artificial intelligence.
          </p>
          <p className="mt-5 text-sm text-[#626762]">8 min read</p>
        </div>

        <div className="mt-10"><VoiceIllustration /></div>

        {/* Body */}
        <div className="mt-10 space-y-6 text-[1.125rem] leading-[1.7] text-ink/85 lg:text-[1.1875rem] lg:leading-[1.7]">
          {/* Introduction */}
          <p>
            One of the more interesting projects I&rsquo;ve worked on didn&rsquo;t
            begin as a startup idea. It didn&rsquo;t begin as research. It began
            while we were building conversational AI with the Chicago Bears
            Digital Team.
          </p>

          <p>
            At the time, our focus wasn&rsquo;t pronunciation. We were building
            conversational experiences for fans. Like most AI teams, we spent our
            time thinking about conversations, latency, user experience, and
            making interactions feel more natural.
          </p>

          {/* Section: The bug that wasn't just a bug */}
          <h2 className="pt-4 text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
            The bug that wasn&rsquo;t just a bug
          </h2>

          <p>
            Then we started testing with real player names. Everything worked
            remarkably well until the AI introduced an athlete. It consistently
            mispronounced names that weren&rsquo;t common in English. Sometimes
            it was close. Sometimes it wasn&rsquo;t even recognizable.
          </p>

          <p>
            At first we treated this like any other software bug. Look up the
            pronunciation. Update the phonemes. Test again. Move on. After doing
            that enough times, we realized we weren&rsquo;t fixing names anymore.
            We were repeating the same workflow over and over again.
          </p>

          <p>
            Every correction required someone to verify how that athlete
            actually pronounced their own name. Then we had to understand the
            phonetics. Then generate phoneme mappings. Then test them. Then test
            them again.
          </p>

          <p>
            Eventually someone asked the obvious question.
          </p>

          <p className="text-ink font-medium">
            Why is everyone solving this individually?
          </p>

          <p>
            Developers were searching YouTube. Broadcasters were listening to
            interviews. Journalists were checking Google. Everyone had invented
            their own process because there wasn&rsquo;t a trusted source of
            truth.
          </p>

          {/* Section: From corrections to infrastructure */}
          <h2 className="pt-4 text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
            From corrections to infrastructure
          </h2>

          <p>
            That was the moment the project changed. Instead of correcting
            pronunciations one player at a time, we started thinking about
            infrastructure. What if there was a verified pronunciation database?
            Not just names&mdash;verified audio, structured phoneme mappings,
            developer-friendly APIs. One source of truth that everyone could
            build upon.
          </p>

          <p>
            The more we researched, the more obvious the problem became. Sports
            are global. Athletes come from every language, culture, and country.
            Most speech systems perform reasonably well with common English
            names. They&rsquo;re much less reliable when names fall outside those
            patterns.
          </p>

          <p>
            Correct pronunciation isn&rsquo;t simply a speech problem.
            It&rsquo;s an identity problem.
          </p>

          <p className="text-ink font-medium">Names matter.</p>

          {/* Section: Finding the names speech systems miss */}
          <h2 className="pt-4 text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
            Finding the names speech systems miss
          </h2>

          <p>
            To support the research, we partnered with Sportradar. Their data
            gave us access to millions of athlete names across more than 500
            leagues dating back to the late 1800s. That allowed us to identify
            uncommon and diverse names at scale instead of manually hunting for
            them one at a time.
          </p>

          <p>
            From there we began pairing verified pronunciations with structured
            phoneme mappings and reference audio. The long-term vision became
            surprisingly simple. Instead of every developer solving pronunciation
            independently, we wanted infrastructure that anyone could use.
          </p>

          {/* Section: What a phoneme mapping looks like */}
          <h2 className="pt-4 text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
            What a phoneme mapping looks like
          </h2>

          <p>
            Most people only see a name. Speech systems need something much more
            structured. A single athlete&rsquo;s name moves through several
            layers before a voice interface can say it correctly.
          </p>

          {/* Compact phoneme example block */}
          <div className="my-8 rounded-lg border border-[#dedfda] bg-[#a5aaa5]/30 px-6 py-6">
            <div className="divide-y divide-border">
              <div className="pb-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
                  Name
                </p>
                <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-ink">
                  Joel Iyiegbuniwe
                </p>
              </div>

              <div className="py-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
                  Verified pronunciation
                </p>
                <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-ink">
                  JOEL&nbsp;&nbsp;ee-YAY-boo-NEE-way
                </p>
              </div>

              <div className="py-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
                  Phoneme mapping
                </p>
                <div className="mt-1.5 space-y-1 text-[1.0625rem] leading-relaxed text-ink">
                  <p>
                    <span className="text-ink/60">Joel</span>
                    &nbsp;&nbsp;
                    <span className="font-mono text-[0.9375rem]">dʒoʊl</span>
                  </p>
                  <p>
                    <span className="text-ink/60">Iyiegbuniwe</span>
                    &nbsp;&nbsp;
                    <span className="font-mono text-[0.9375rem]">
                      i-jeɪ-bu-ni-weɪ
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
                  Speech engine markup
                </p>
                <pre className="mt-2 overflow-x-auto text-[0.8125rem] leading-relaxed text-ink/80"><code className="font-mono">{`<phoneme alphabet="ipa" ph="dʒoʊl">
  Joel
</phoneme>

<phoneme alphabet="ipa" ph="i-jeɪ-bu-ni-weɪ">
  Iyiegbuniwe
</phoneme>`}</code></pre>
              </div>
            </div>
          </div>

          <p>
            One request. One answer. No guessing. That&rsquo;s the shape of the
            infrastructure we wanted to build.
          </p>

          {/* Section: Phonemes as a Service */}
          <h2 className="pt-4 text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
            Phonemes as a Service
          </h2>

          <p>
            The project eventually evolved into what we internally called
            &ldquo;Phonemes as a Service.&rdquo; An API capable of providing
            verified pronunciations and phoneme combinations to developers
            building voice interfaces, sports products, conversational AI, and
            media experiences.
          </p>

          <p>
            The goal wasn&rsquo;t simply better speech synthesis. It was making
            AI more respectful, more inclusive, and more accurate&mdash;so that
            the next team building a voice product wouldn&rsquo;t have to start
            from zero.
          </p>

          {/* Section: What stayed with me */}
          <h2 className="pt-4 text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
            What stayed with me
          </h2>

          <p>
            What stayed with me wasn&rsquo;t only the phoneme work. It was the
            realization that many meaningful improvements in AI do not come from
            larger models. They come from solving the small problems everyone
            quietly accepts.
          </p>

          <p>
            Names are one of those problems. People notice when software gets
            them wrong, and rarely notice when it gets them right. That is
            exactly why I still find pronunciation intelligence worth exploring.
          </p>

          <p className="text-ink font-medium">
            Most AI systems guess. I&rsquo;m interested in helping them know.
          </p>

          {/* Section: Current exploration */}
          <div className="mt-12 border-t border-[#dedfda] pt-8">
            <h2 className="text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
              Current exploration
            </h2>

            <p className="mt-4">
              This remains an active area of research. I&rsquo;m continuing to
              explore:
            </p>

            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-3">
                <span className="mt-3 h-px w-4 shrink-0 bg-[#a5aaa5]" />
                <span>verified pronunciation databases</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-3 h-px w-4 shrink-0 bg-[#a5aaa5]" />
                <span>multilingual phoneme mappings</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-3 h-px w-4 shrink-0 bg-[#a5aaa5]" />
                <span>pronunciation APIs</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-3 h-px w-4 shrink-0 bg-[#a5aaa5]" />
                <span>voice interfaces</span>
              </li>
            </ul>
          </div>

          {/* Related Field Notes */}
          <div className="mt-16 border-t border-[#dedfda] pt-10">
            <p className="mb-6 text-sm font-medium text-ink">Related Field Notes</p>
            <div className="grid gap-6 sm:grid-cols-2">
              <a
                href="/field-notes/attention-is-all-you-need"
                className="group flex flex-col border-t border-[#dedfda] pt-5 transition-colors hover:border-ink/30"
              >
                <h3 className="text-base font-semibold leading-snug text-ink">
                  What &ldquo;Attention Is All You Need&rdquo; Actually Changed
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">
                  The Transformer paper changed AI. More importantly, it
                  changed how I think about building products.
                </p>
                <span className="mt-3 text-sm text-[#626762]">~9 min read</span>
              </a>
              <a
                href="/field-notes/hotline-broadcast-deep-dive"
                className="group flex flex-col border-t border-[#dedfda] pt-5 transition-colors hover:border-ink/30"
              >
                <h3 className="text-base font-semibold leading-snug text-ink">
                  Why Is It So Hard to Watch Sports?
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">
                  A deep dive into 100 years of broadcast complexity&mdash;from
                  the first radio broadcast in 1921 to the six-subscription NFL
                  viewing experience of 2026.
                </p>
                <span className="mt-3 text-sm text-[#626762]">~18 min read</span>
              </a>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-12 border-t border-[#dedfda] pt-8">
            <a
              href="/#research"
              className="inline-flex items-center gap-1.5 text-sm text-[#626762] transition-opacity hover:opacity-70"
            >
              <ArrowLeft size={16} strokeWidth={2} />
              Back to Pronunciation Intelligence
            </a>
          </div>
        </div>
      </div>
    </main></article>
  );
}
