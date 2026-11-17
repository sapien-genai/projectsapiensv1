import TimelineIllustration from './illustrations/HotlineBroadcastDeepDive';
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

/* ──────────────────────────────────────────────────────────────────────
   Animated timeline — 100 years of sports broadcast complexity
   Uses the same draw-path / draw-delay-* CSS animation system as the
   other field-note hero illustrations.
   ────────────────────────────────────────────────────────────────────── */


/* ── Animated rights-cost chart ──────────────────────────────────────── */
function RightsCostChart() {
  const bars = [
    { year: '1939', value: 8, label: '$2.5K' },
    { year: '1951', value: 14, label: '$75K' },
    { year: '1962', value: 22, label: '$10M' },
    { year: '1987', value: 35, label: '$2M/yr' },
    { year: '2015', value: 58, label: '$13.8B' },
    { year: '2025', value: 82, label: '$30.5B' },
    { year: '2030', value: 100, label: '$37B' },
  ];

  return (
    <svg
      viewBox="0 0 800 420"
      className="w-full h-auto"
      fill="none"
      stroke="#111111"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="A bar chart showing the exponential growth of US sports broadcast rights spending from $2,500 in 1939 to a projected $37 billion by 2030."
    >
      {/* ── Baseline ────────────────────────────────────────── */}
      <line x1="60" y1="340" x2="760" y2="340" strokeWidth="1" className="draw-path" />

      {/* ── Bars ─────────────────────────────────────────────── */}
      {bars.map((bar, i) => {
        const barWidth = 70;
        const gap = (700 - bars.length * barWidth) / (bars.length - 1);
        const x = 60 + i * (barWidth + gap);
        const barHeight = (bar.value / 100) * 260;
        const y = 340 - barHeight;
        const delayClass = `draw-delay-${Math.min(i + 1, 8)}`;
        return (
          <g key={bar.year} className={delayClass}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              strokeWidth="1"
              className={`draw-path chart-bar ${delayClass}`}
            />
            {/* Year label */}
            <text
              x={x + barWidth / 2}
              y="362"
              textAnchor="middle"
              fontSize="11"
              strokeWidth="0"
              fill="#111111"
              opacity="0.6"
              className={`draw-path ${delayClass}`}
            >
              {bar.year}
            </text>
            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={y - 10}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              strokeWidth="0"
              fill="#111111"
              opacity="0.7"
              className={`draw-path ${delayClass}`}
            >
              {bar.label}
            </text>
          </g>
        );
      })}

      {/* ── Y-axis label ─────────────────────────────────────── */}
      <text
        x="60"
        y="40"
        fontSize="10"
        letterSpacing="2"
        strokeWidth="0"
        fill="#111111"
        opacity="0.4"
        className="draw-path draw-delay-2"
      >
        US SPORTS RIGHTS SPENDING
      </text>

      {/* ── Subtle grain overlay ────────────────────────────── */}
      <defs>
        <filter id="grain-filter-cost" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0"
          />
        </filter>
      </defs>
      <rect x="0" y="0" width="800" height="420" filter="url(#grain-filter-cost)" />
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

export default function HotlineBroadcastDeepDive() {
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
            <span>Sports &amp; AI</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>No. 04</span>
          </div>

          {/* Title */}
          <h1 className="fade-in-up fade-in-delay-1 mt-6 text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink text-balance">
            Why Is It So Hard to Watch Sports?
          </h1>

          {/* Subtitle */}
          <p className="fade-in-up fade-in-delay-2 mt-6 text-lg leading-relaxed text-ink/60 text-balance lg:text-xl">
            A deep dive into 100 years of broadcast complexity&mdash;from Harold
            Arlin&rsquo;s converted telephone microphone in 1921 to the
            six-subscription NFL viewing experience of 2026.
          </p>

          {/* Meta line */}
          <div className="fade-in-up fade-in-delay-3 mt-8 flex items-center gap-4 text-sm text-[#626762]">
            <span>August 2026</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>Hotline Sports Research and Perplexity AI.</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>~18 min read</span>
          </div>
        </div>

        {/* Hero illustration — animated timeline */}
        <div className="fade-in-up fade-in-delay-4 mx-auto max-w-[740px] px-6 pb-14 lg:pb-20">
          <TimelineIllustration />
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────── */}
      <div className="mx-auto max-w-[740px] px-6 py-16 lg:py-20">
        <div className="space-y-6 text-[1.125rem] leading-[1.7] text-ink/85 lg:text-[1.1875rem] lg:leading-[1.7]">
          {/* ── Introduction ── */}
          <p>
            It&rsquo;s Sunday afternoon in October. Your team is playing. You sit
            down, remote in hand, and start clicking. Is it on CBS? FOX? NBC?
            Wait&mdash;is this a flex game? Is it on ESPN? Maybe it&rsquo;s on the
            local affiliate. Or was it moved to Amazon? You pull out your phone,
            open three different apps, check a Reddit thread, and&mdash;seven
            minutes into the first quarter&mdash;you finally find the game. On a
            service you&rsquo;re pretty sure you&rsquo;re already paying for.
          </p>

          <p>
            Congratulations. You&rsquo;ve just completed the modern American
            sports-viewing experience.
          </p>

          <PullQuote>
            This is not an accident. It is the cumulative outcome of 100 years
            of decisions made by leagues, networks, Congress, and cable
            companies&mdash;almost none of which were made with the fan in mind.
          </PullQuote>

          <p>
            According to Hub Entertainment Research, 90% of sports fans say it is
            frustrating to figure out where to watch games across TV and
            streaming platforms. Nearly 25% describe it as &ldquo;very
            frustrating.&rdquo; That number is remarkable on its own. But when
            you understand the history, it&rsquo;s a miracle the number
            isn&rsquo;t higher.
          </p>

          <p>
            This is that history. It&rsquo;s a story about money, technology,
            antitrust law, and the slow substitution of fan access for rights
            revenue. It&rsquo;s a story about a 1961 law that bent the arc of
            American sports broadcasting toward consolidation and away from the
            viewer. And it&rsquo;s a story about why, in 2026, watching the team
            you love requires a spreadsheet, a law degree, and about five
            separate monthly subscriptions.
          </p>

          <p>
            Hotline Sports was built because this problem is real, it is
            structural, and it is not going away. We are a where-to-watch
            intelligence engine&mdash;for fans trying to find the game, and for
            venues trying to legally show it. To understand why that matters,
            you have to understand how we got here.
          </p>

          <figure className="my-14 space-y-6 md:-mx-12">
            <div className="space-y-6">
              <img
                src="/field-notes/no-4/Screenshot_2026-08-12_at_1.05.52_PM.png"
                alt="Hotline Sports where-to-watch schedule showing live games and broadcast options"
                className="h-auto w-full rounded-xl border border-[#dedfda]"
              />
              <img
                src="/field-notes/no-4/Screenshot_2026-08-12_at_1.08.40_PM.png"
                alt="Hotline Sports coverage view showing team recommendations and streaming options"
                className="h-auto w-full rounded-xl border border-[#dedfda]"
              />
            </div>
            <figcaption className="text-center text-xs leading-relaxed text-[#626762]">
              Hotline Sports turns a fragmented rights landscape into a clearer path to the game.
            </figcaption>
          </figure>

          {/* ── Section: The Radio Age ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The Radio Age: When Sports Found Its Voice (1921&ndash;1939)
          </h2>

          <p>
            The story begins on April 11, 1921, in Pittsburgh.
          </p>

          <p>
            Harold Arlin&mdash;a 26-year-old station operator at KDKA, the
            country&rsquo;s first commercial radio station&mdash;sat at a
            converted telephone microphone and described a boxing match between
            Johnny Ray and Johnny Dundee. It was the first sports radio
            broadcast in American history, and almost nobody heard it. Radio
            receivers were rare, reception was poor, and the idea that millions
            of people might one day listen to sports in their living rooms would
            have seemed like science fiction.
          </p>

          <p>
            It didn&rsquo;t take long for that fiction to become fact. A few
            months later, on August 5, 1921, Arlin sat back down at that same
            converted telephone microphone and called the first baseball game
            ever broadcast on radio&mdash;the Pittsburgh Pirates versus the
            Philadelphia Phillies. By the end of that same year, RCA had
            broadcast the World Series. David Sarnoff, the visionary RCA
            executive who would shape American broadcasting for decades,
            understood exactly what was happening: &ldquo;We had to have
            baseball,&rdquo; he reportedly said, &ldquo;in order to sell enough
            sets to go on to other programming.&rdquo; Sports weren&rsquo;t just
            content. They were the engine driving the entire medium.
          </p>

          <p>
            The growth was explosive. By 1924, there were 1,400 radio stations
            across the country, 3 million receivers in American homes, and
            almost daily sports broadcasts filling the airwaves. In 1934, Ford
            Motor Company paid $100,000 to sponsor the World Series on
            radio&mdash;one of the first major sports sponsorship deals in
            history&mdash;foreshadowing the trillion-dollar media rights economy
            that would follow.
          </p>

          <PullQuote>
            Radio made sports democratic. If you had a receiver, you had the
            game. There were no subscriptions, no blackout policies, no carriage
            disputes.
          </PullQuote>

          <p>
            Sports leagues&mdash;initially skeptical, fearing that broadcast
            would cannibalize ticket sales&mdash;quickly discovered the opposite
            was true. Radio built fan bases. Radio created national audiences for
            regional teams. Radio made sports a cultural institution.
          </p>

          <p>
            That democratic promise would take decades to fully erode. But the
            erosion had already begun before the first television camera ever
            pointed at a playing field. On May 17, 1939, NBC broadcast a college
            baseball game between Columbia and Princeton&mdash;the first
            televised sports event in American history. Approximately 400
            television receivers existed in the New York area at the time. The
            audience was negligible. But the model had been demonstrated. And
            everyone who mattered in sports and broadcasting was paying
            attention.
          </p>

          {/* ── Section: The Television Age ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The Television Age: When the Money Started Flowing (1947&ndash;1961)
          </h2>

          <p>
            Television arrived in American living rooms after World War II with a
            speed that startled even its own evangelists. By 1948, the NFL was
            already broadcasting its championship game on ABC. By 1947, the
            league had given teams permission to sell local broadcast rights to
            local stations.
          </p>

          <p>
            The experiment immediately produced a result that would haunt sports
            broadcasters for decades: attendance dropped.
          </p>

          <p>
            The Los Angeles Rams tested home-game television broadcasts in 1950.
            Season ticket sales fell. The experiment was quickly curtailed. The
            NFL, spooked, implemented its first broadcasting blackout policy in
            1951&mdash;any game could be blacked out within 75 miles of the home
            city. The logic was straightforward: if you could watch it for free
            at home, why would you pay for a ticket? The tension between
            broadcast access and gate revenue had been formally institutionalized.
          </p>

          <p>
            The financial stakes became clear almost immediately. In 1939, the
            Mutual Broadcasting System had paid the NFL a grand total of $2,500
            for the right to broadcast the NFL championship game on radio across
            120 stations. By 1951, DuMont Network paid $75,000 to televise the
            NFL championship game coast-to-coast&mdash;the same year NBC produced
            the first nationwide coast-to-coast college football broadcast (Duke
            vs. Pitt). In roughly a decade, broadcast rights had increased in
            value by a factor of 30. The escalator had started moving. It has
            never stopped.
          </p>

          <p>
            Then, in 1960, the American Football League&mdash;the scrappy
            upstart competing with the established NFL&mdash;signed a
            groundbreaking deal with ABC worth approximately $2 million per year.
            What made it revolutionary wasn&rsquo;t the money. It was the
            structure: the AFL and ABC agreed to pool all team rights and divide
            proceeds equally among all franchises. For the first time, a league
            was selling itself as a single entity rather than a collection of
            individual teams. Small-market franchises received the same cut as
            large-market franchises. The model created competitive balance,
            financial stability, and a template the entire sports industry
            would adopt.
          </p>

          <p>
            The NFL noticed. In April 1961, the NFL duplicated the AFL&rsquo;s
            structure with CBS. A federal judge promptly blocked it as an
            antitrust violation. The NFL couldn&rsquo;t negotiate as a single
            entity&mdash;that was, by law, collusive monopolistic behavior.
          </p>

          <p>So the NFL went to Congress.</p>

          {/* ── Section: The Sports Broadcasting Act ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The Sports Broadcasting Act of 1961: The Fork in the Road
          </h2>

          <p>
            On September 30, 1961, President John F. Kennedy signed the Sports
            Broadcasting Act into law.
          </p>

          <p>
            In six paragraphs, the SBA did something extraordinary: it exempted
            the NFL, MLB, NBA, and NHL from antitrust law specifically for the
            purpose of negotiating television rights. The four major
            professional sports leagues could now collectively pool their
            broadcast rights, sell them to a single national network as a
            package, and divide the proceeds equally&mdash;activities that would
            be illegal for virtually any other industry in America.
          </p>

          <p>
            The stated rationale was equalizing competition between large- and
            small-market teams. Without pooled rights revenue, the New York
            Giants could sign a massive TV deal while the Green Bay Packers were
            left behind, creating an unclosable competitive gap. The SBA was
            framed as a small, targeted fix to a specific competitive imbalance
            problem.
          </p>

          <PullQuote>
            It was the most consequential piece of media legislation in American
            sports history, and almost no one outside the industry has ever heard
            of it.
          </PullQuote>

          <p>
            In 1962, the NFL signed its first CBS contract under the new law for
            approximately $10 million. That deal was the foundation of what
            would ultimately become an $110 billion empire. The SBA didn&rsquo;t
            just solve the competitive imbalance problem&mdash;it handed leagues
            an instrument of extraordinary economic power. They could now
            negotiate from a position of monopolistic strength against any single
            broadcaster. They could extract maximum value, demand exclusivity,
            and control distribution in ways that would have been legally
            impossible in any other industry.
          </p>

          <p>
            For 64 years, the SBA did its quiet work. Then, in June 2026, the
            House Judiciary Committee released an interim staff report calling
            the SBA &ldquo;A Special-Interest Antitrust Exemption Gone Awry,&rdquo;
            concluding that the NFL had stretched the exemption far beyond its
            original purpose&mdash;to the direct detriment of consumers. The fan
            who can&rsquo;t figure out which of their six streaming subscriptions
            carries tonight&rsquo;s game is, in part, a product of a 1961 law
            designed to solve a problem that no longer exists.
          </p>

          <p>
            The fork in the road was 1961. Everything that followed&mdash;the
            cable era, the RSN model, the streaming fragmentation&mdash;was built
            on the foundation laid that September afternoon on the South Lawn of
            the White House.
          </p>

          {/* ── Section: The Cable Empire ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The Cable Empire: ESPN and the Balkanization Begins (1979&ndash;1990s)
          </h2>

          <p>
            For nearly two decades after the Sports Broadcasting Act, the
            broadcast sports landscape was actually relatively simple. The major
            leagues sold national rights to the major broadcast networks. Fans
            with televisions&mdash;which, by the 1970s, meant essentially
            everyone&mdash;could watch national games for free. Local teams
            appeared on local broadcast affiliates. The system wasn&rsquo;t
            perfect, but it was legible.
          </p>

          <p>
            Then, on September 7, 1979, a startup network launched from a
            converted warehouse in Bristol, Connecticut.
          </p>

          <p>
            ESPN&mdash;the Entertainment and Sports Programming Network&mdash;was
            conceived by Bill Rasmussen and his son Scott on August 16, 1978.
            Getty Oil funded it with an 85% stake. In its early days, it
            broadcast Australian rules football, slow-pitch softball, and
            collegiate sports that nobody else wanted. The conventional wisdom
            was that nobody would watch sports 24 hours a day on cable TV.
          </p>

          <p>
            The conventional wisdom was spectacularly wrong.
          </p>

          <p>
            ESPN&rsquo;s breakthrough moment came on March 1, 1979, when the NCAA
            granted it exclusive cable rights&mdash;the first major sports
            exclusive in cable history. The logic of the ESPN model clicked into
            place with that single deal: pay fees for exclusive cable rights,
            require cable distribution to deliver the content, charge cable
            companies carriage fees to carry the channel, use that money to pay
            for more rights, and repeat. To watch college sports on cable, you
            needed ESPN. To get ESPN, you needed a cable subscription. To get a
            cable subscription, you paid a monthly bill&mdash;whether you wanted
            ESPN&rsquo;s other programming or not.
          </p>

          <p>
            By March 15, 1987, ESPN had its first NFL cable contract. By January
            5, 1989, it had reached a four-year agreement with MLB. The pay-TV
            sports model was fully operational.
          </p>

          <p>
            Meanwhile, something equally significant was happening at the local
            level. The concept of the Regional Sports Network&mdash;a cable
            channel dedicated exclusively to carrying local team games&mdash;had
            been pioneered by the Madison Square Garden Network, which began
            broadcasting Knicks and Rangers games in May 1969. SportsChannel New
            York followed in 1976, evolving into the first modern-style RSN
            model. By the time Fox Sports Net launched on November 1, 1996,
            rapidly expanding RSN presence nationally, a complete two-tier system
            had been constructed: ESPN and the broadcast networks for national
            games, RSNs for local teams.
          </p>

          <p>
            The cable bundle that housed this system was the great hidden tax of
            20th-century sports fandom. RSNs charged cable companies carriage
            fees of $3.50 to $8 per subscriber per month&mdash;meaning every
            cable customer in a market paid for the RSN whether they watched it
            or not. Sports fans subsidized the model. Non-sports fans subsidized
            it too. Nobody had a choice. The bundle was all-or-nothing, and
            sports were embedded deep inside it.
          </p>

          <PullQuote>
            The fan had no agency. But at least they had access.
          </PullQuote>

          {/* ── Section: The RSN Era ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The RSN Era: A Gilded Cage (1990s&ndash;2022)
          </h2>

          <p>
            By the peak of the RSN era, the system had achieved a kind of baroque
            elegance. Every major market had a regional sports network. Every
            local team had a home on that RSN. National networks carried the
            marquee matchups. The local-national split felt natural, even
            inevitable.
          </p>

          <p>
            The financial dependency was staggering. By 2011, RSNs were integral
            to the financial health of nearly every major professional franchise.
            S&amp;P Global data shows the scale: media rights accounted for 54%
            of total NBA revenue (41% national, 13% local/RSN), 49% of MLB
            revenue (26% national, 23% local/RSN), and 38% of NHL revenue (19%
            national, 19% local/RSN). Local RSN deals weren&rsquo;t supplemental
            income. They were structural. Teams had built their financial
            models&mdash;player salaries, stadium debt, operational
            costs&mdash;around RSN revenue flowing reliably every year.
          </p>

          <p>Then people started cutting the cord.</p>

          <p>
            Streaming services arrived. Broadband improved. Cable&rsquo;s bundled
            model&mdash;long protected by inertia and lack of
            alternatives&mdash;started losing customers. RSN carriage fees, which
            were per-subscriber payments, began declining as subscriber bases
            shrank. The math that had made RSNs enormously profitable turned
            against them: high fixed costs (rights fees) combined with shrinking
            revenue bases (fewer cable subscribers) created an inexorable
            squeeze.
          </p>

          <p>
            The denouement came in slow motion, then all at once. Fox Sports
            Networks&mdash;the largest RSN group in the country&mdash;was acquired
            by Diamond Sports Group from Disney in 2019, as the DOJ required the
            divestiture during Disney&rsquo;s $71 billion acquisition of 21st
            Century Fox. Diamond took on significant debt to complete the
            purchase. On March 31, 2021, the channels were rebranded as Bally
            Sports, in a sponsorship deal with the casino company. The
            rebranding felt, in retrospect, like rearranging deck chairs.
          </p>

          <p>
            On February 15, 2023, Diamond Sports missed a $140 million interest
            payment. On March 14, 2023, Diamond Sports filed for Chapter 11
            bankruptcy. The largest regional sports network operator in America
            was insolvent. Over the following months, teams began scrambling for
            alternatives as rights negotiations collapsed. In October 2024, the
            channels were renamed again&mdash;FanDuel Sports Network, in a deal
            with the gambling company. In February 2026, FanDuel Sports Network
            lost rights to all nine MLB clubs it had been broadcasting after
            failing to make payments. Main Street Sports Group, FanDuel Sports
            Network&rsquo;s parent company, began issuing WARN Act notices for
            layoffs and permanent closures. The last RSNs went dark by early May
            2026.
          </p>

          <p>
            Dozens of MLB, NBA, and NHL teams found themselves without a primary
            local broadcast partner. Some struck direct streaming deals. Some
            moved games to over-the-air affiliates with limited coverage. Some
            games simply weren&rsquo;t available anywhere. The Kansas City
            Royals&rsquo; situation captured the absurdity perfectly: FanDuel
            Sports Kansas City showed &ldquo;No Channel Listing&rdquo; on
            DirecTV&rsquo;s channel guide. The team existed. The games were being
            played. And fans couldn&rsquo;t find them.
          </p>

          <PullQuote>
            The gilded cage had collapsed. What replaced it was not freedom. It
            was chaos.
          </PullQuote>

          {/* ── Rights cost chart ── */}
          <div className="my-14">
            <div className="mb-8 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
                The Escalator
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/60 text-balance">
                US sports broadcast rights spending, 1939&ndash;2030 (projected).
                From $2,500 to $37 billion.
              </p>
            </div>
            <RightsCostChart />
          </div>

          {/* ── Section: The Streaming Wars ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The Streaming Wars: Every Dollar Chases Its Own App (2020s)
          </h2>

          <p>
            The collapse of the RSN model did not return power to fans. It
            transferred power to streaming platforms&mdash;and the leagues used
            the transition to extract more money than ever from more sources
            than ever.
          </p>

          <p>
            Consider the scale. US sports rights spending was $13.8 billion in
            2015. By 2025, it had reached $30.5 billion&mdash;a 122% increase in
            a single decade. S&amp;P Global projects it will reach $37 billion by
            2030. Every year, leagues sign deals worth more than the year before,
            with more platforms, on more exclusive terms.
          </p>

          <p>
            The NFL, as always, provides the most extreme illustration. The
            league&rsquo;s current rights package, running from 2023 to 2034,
            totals approximately $110 billion over 11 years. The money breaks
            down across a bewildering array of partners: ESPN/ABC pays $2.7
            billion per year for Monday Night Football; CBS pays $2.1 billion
            per year for Sunday afternoons; FOX pays $2.25 billion for Sunday
            afternoons; Amazon Prime Video pays $1 billion per year for Thursday
            Night Football (exclusively); NBC/Peacock pays $2 billion per year
            for Sunday Night Football; Netflix pays $150 million for Christmas
            Day games (exclusively); and YouTube TV pays $2 billion per year for
            NFL Sunday Ticket.
          </p>

          <p>
            To watch every nationally broadcast NFL game in a given season, a
            fan needs: a cable or satellite subscription (for CBS, FOX, NBC, and
            ESPN/ABC), plus Amazon Prime, plus Peacock, plus Netflix, plus
            YouTube TV. That is five or six separate paid services for a single
            sport.
          </p>

          <p>
            The NBA&rsquo;s new deal, which took effect in the 2025&ndash;26
            season, distributed games across ESPN/ABC ($2.62 billion per year),
            NBC/Peacock ($2.45 billion per year), and Amazon Prime Video ($1.8
            billion per year)&mdash;a total of $76 billion over 11 years, nearly
            tripling the previous deal&rsquo;s value. The practical consequence
            appeared immediately: the first four games of a recent playoff
            series aired on four different networks&mdash;ABC, ESPN, NBC, and
            Peacock. Four games, four services, four separate login screens.
          </p>

          <p>
            Major League Soccer chose a different path, signing an exclusive
            $2.5 billion, 10-year deal with Apple TV+&mdash;making it the first
            major American professional sports league to move entirely off
            traditional broadcast television. No cable, no broadcast affiliates,
            no RSNs. Streaming only. It was hailed as visionary by some and
            criticized as exclusionary by others. Either way, it added another
            must-have subscription to the list.
          </p>

          <p>
            And then there are the 96 separate local live game rights deals that
            exist just for MLB, NBA, NHL, and WNBA teams and local television
            stations, as S&amp;P Global documents. Each with different terms.
            Different geographies. Different windows. Different platforms.
            Ninety-six separate arrangements, each of which must be understood in
            order to confidently tell a fan whether their local team&rsquo;s game
            is available to them tonight.
          </p>

          <PullQuote>
            Leagues have maximized revenue. Fans have maximized confusion. These
            two outcomes are not a coincidence&mdash;they are the same outcome,
            described from different perspectives.
          </PullQuote>

          {/* ── Section: Blackouts and Disputes ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Blackouts, Disputes, and the Invisible Lines
          </h2>

          <p>
            The blackout policy that the NFL implemented in 1951&mdash;preventing
            local broadcasts of home games&mdash;was designed to protect ticket
            sales. It was a clumsy instrument that made some economic sense in an
            era when stadium revenue was the primary income stream. Over the
            following seven decades, it evolved and mutated into a thicket of
            restrictions that persist to this day, long after the original
            rationale has dissolved.
          </p>

          <p>
            The formal FCC blackout rule for NFL games was eliminated in 2014.
            But the underlying geography of broadcast rights&mdash;the invisible
            market boundaries drawn by decades of rights deals&mdash;did not
            disappear. The NFL&rsquo;s &ldquo;home market&rdquo; and
            &ldquo;away market&rdquo; concepts remain embedded in how rights are
            sold and how streams are geofenced. Out-of-market packages exist
            specifically to solve a problem created by those boundaries. The 96
            local rights deals each contain their own geographic restrictions.
            DirecTV offers RSN channels nationally but live games are blacked out
            outside home markets&mdash;meaning you can pay for a channel and still
            not receive the programming you&rsquo;re paying for.
          </p>

          <p>
            Carriage disputes add another layer of unpredictability. These occur
            when distributors&mdash;cable companies, satellite providers, virtual
            MVPDs&mdash;and content owners fail to agree on the fees the
            distributor must pay to carry a channel. The negotiations are
            private, the stakes are massive, and the fans are the collateral
            damage.
          </p>

          <p>
            In November 2025, Fubo TV dropped all NBCUniversal channels&mdash;
            including coverage of NFL Sunday Night Football and Premier League
            soccer&mdash;over a carriage dispute that left subscribers without
            content they had specifically paid to receive. Earlier in 2025, a
            dispute between Disney and YouTube TV blacked out ESPN and ABC for
            YouTube TV&rsquo;s approximately 10 million subscribers for two weeks
            before a deal was reached.
          </p>

          <p>
            These disputes are not aberrations. They are structural features of a
            rights market where every party has leverage and no party has a legal
            obligation to prioritize consumer access. When the deal breaks down,
            the fan is the one who finds a blank screen.
          </p>

          <p>
            The result is a broadcast landscape where the answer to
            &ldquo;where can I watch this game?&rdquo; depends not just on which
            platform holds the rights, but on which distributor you use, which
            market you live in, whether a carriage contract has recently lapsed,
            and whether the game is subject to a local blackout, a national
            blackout, or an out-of-market restriction that nobody bothered to
            explain in plain English.
          </p>

          {/* ── Section: The Venue Problem ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            The Venue Problem: Why Your Sports Bar Is Also Suffering
          </h2>

          <p>
            Everything described above applies to the individual fan sitting at
            home. The sports bar operator has a separate and distinctly worse
            problem.
          </p>

          <p>
            A business cannot legally show a game using a residential
            subscription. This is not a terms-of-service technicality&mdash;it is
            copyright law. The subscriber on a home account has purchased personal
            use rights only. Public performance&mdash;showing the content to
            customers in a commercial setting&mdash;requires a separate commercial
            license, separately negotiated, separately priced.
          </p>

          <p>
            The commercial licensing infrastructure is exactly as complicated as
            everything else in this ecosystem. Bars and restaurants must purchase
            commercial packages from providers like DirecTV for Business,
            Spectrum Business, or Dish Business. The cost scales with
            establishment size, number of screens, and the complexity of rights
            required. One New York City sports bar reportedly pays approximately
            $100,000 per year to ensure the rights to show every game a customer
            might walk in and want to see.
          </p>

          <p>
            The streaming era has made this dramatically more complicated, not
            less. Commercial licensing was originally designed around a world
            where all sports content flowed through cable and satellite systems
            that had clear commercial licensing pathways. Streaming platforms
            weren&rsquo;t part of that world&mdash;and some of them have been slow
            to build adequate commercial infrastructure.
          </p>

          <p>
            The Netflix NFL Christmas Day 2024 games crystallized the problem.
            DirecTV opted not to pay the six-figure licensing fee required to
            carry those Netflix games on its commercial platform. Sports bars
            that wanted to show the games had to obtain access through
            EverPass&mdash;a commercial streaming aggregator that covers Amazon
            Thursday Night Football, Netflix NFL games, and Peacock games&mdash;or
            simply not show the game at all. EverPass covers some platforms. It
            does not cover all of them. Venues still need a base cable or
            satellite subscription for the channels EverPass doesn&rsquo;t carry,
            meaning they&rsquo;re stacking multiple commercial licensing
            relationships just to cover the full rights landscape.
          </p>

          <p>
            Then, after the 2025 season, DirecTV ended its partnership with
            EverPass Media entirely&mdash;leaving sports bars facing deep
            uncertainty about NFL Sunday Ticket commercial access for the 2026
            season. The commercial licensing ecosystem, already a labyrinth, had
            lost one of its key bridges.
          </p>

          <p>
            The RSN collapse has compounded this further. More than 80% of NBA,
            MLB, and NHL regular season games are broadcast on local RSNs&mdash;
            the very RSNs that have been collapsing. A bar operator who purchased
            a commercial RSN package from DirecTV for Business and relied on it
            to show local baseball or hockey now finds channels with &ldquo;No
            Channel Listing&rdquo; where the games used to be. The rights moved.
            Nobody sent a memo.
          </p>

          <PullQuote>
            The bar owner who can&rsquo;t show your team isn&rsquo;t negligent or
            cheap. They&rsquo;re navigating a licensing labyrinth that was never
            designed to be navigated&mdash;it was designed to maximize revenue
            extraction from every possible distribution point.
          </PullQuote>

          {/* ── Section: Why We're Building Hotline Sports ── */}
          <hr className="border-[#dedfda]" />

          <h2 className="pt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
            Why We&rsquo;re Building Hotline Sports
          </h2>

          <p>
            The fan deserves an answer, not a scavenger hunt.
          </p>

          <p>
            That sentence is the founding principle of Hotline Sports. And after
            a hundred years of sports broadcast history&mdash;from Harold
            Arlin&rsquo;s converted telephone microphone in Pittsburgh to the
            six-subscription NFL viewing experience of 2026&mdash;it should be
            clear that the answer is harder to provide than it has any right to
            be.
          </p>

          <p>
            The problem is structural and it is getting worse. US sports rights
            spending is projected to grow from $30.5 billion to more than $37
            billion by 2030. New platforms will continue signing exclusive deals.
            New streaming services will continue fragmenting the rights
            landscape. The 96 separate local rights deals for MLB, NBA, NHL, and
            WNBA teams will continue to shift, renew, expire, and migrate.
            Carriage disputes will continue interrupting access. The commercial
            licensing ecosystem will continue lagging behind the pace of rights
            movement.
          </p>

          <p>
            Hub Entertainment Research found that 60% of fans say they would be
            more likely to subscribe to a service that consolidates rights to a
            sport they follow. Jon Giegengack, principal at Hub, said it directly:
            &ldquo;Fans will go to great lengths to watch the sports they care
            about&mdash;but that doesn&rsquo;t mean they enjoy hunting across
            multiple apps to find them. Services that simplify the experience of
            watching sports&mdash;whether through discovery tools or by
            consolidating rights to an entire sport&mdash;are delivering more
            value to fans.&rdquo;
          </p>

          <p>
            ESPN built a &ldquo;Where to Watch&rdquo; discovery tool. Seventy
            percent of those who&rsquo;ve used it say it improves their sports
            viewing experience. That stat is both encouraging and
            damning&mdash;encouraging because it shows that better discovery tools
            genuinely help, damning because ESPN&rsquo;s tool only tells you
            where a game is broadcasting. It can&rsquo;t tell you whether
            it&rsquo;s blacked out in your market. It can&rsquo;t tell you whether
            a carriage dispute has just pulled that channel from your provider.
            It can&rsquo;t tell you whether the RSN that carried your team&rsquo;s
            games last month is still operational. It can&rsquo;t tell you what a
            bar owner needs to do to legally show the game on their eight screens.
          </p>

          <p>
            Hotline Sports is built to answer those questions. We are the
            intelligence layer between the rights complexity and the person who
            just wants to watch the game.
          </p>

          <p>
            That means two distinct user problems, both of which are real and
            underserved. The first is the consumer: the fan navigating a labyrinth
            of apps, subscriptions, blackouts, and carriage disputes, trying to
            find the game on a Sunday afternoon without spending the first
            quarter looking for it. The second is the venue operator: the bar
            owner, the restaurant manager, the hotel, the sports club&mdash;any
            commercial establishment that needs to know, with legal certainty,
            which platforms and licenses they need to carry tonight&rsquo;s slate
            of games for their customers.
          </p>

          <PullQuote>
            The Sports Broadcasting Act gave leagues the power to make access
            complicated. A hundred years of broadcast economics made it more
            complicated still. Hotline Sports exists to make it simple again.
          </PullQuote>

          <p>
            The promise of Harold Arlin&rsquo;s first broadcast was a simple one:
            the game, delivered to anyone who wanted to hear it. That promise was
            never formally revoked. It was just buried under a century of rights
            deals, network negotiations, antitrust exemptions, cable bundles, RSN
            bankruptcies, streaming exclusives, carriage disputes, commercial
            licensing requirements, and geographic blackout rules.
          </p>

          <p className="text-ink font-medium">We&rsquo;re digging it back out.</p>

          {/* ── Key Takeaways ── */}
          <div className="mt-16 rounded-lg border border-[#dedfda] px-6 py-8 lg:px-10 lg:py-10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#626762]">
              Key Takeaways
            </p>
            <ul className="mt-5 space-y-4">
              {[
                '90% of sports fans find it frustrating to figure out where to watch games.',
                'The Sports Broadcasting Act of 1961 exempted major leagues from antitrust law for TV rights negotiation\u2014the most consequential media legislation in American sports history.',
                'US sports rights spending grew from $2,500 in 1939 to $30.5 billion in 2025, and is projected to reach $37 billion by 2030.',
                'The RSN model collapsed by 2026, leaving dozens of teams without a primary local broadcast partner.',
                'Watching every NFL game now requires five or six separate paid subscriptions.',
                '96 separate local live game rights deals exist for MLB, NBA, NHL, and WNBA teams alone.',
                'Sports bars cannot legally use residential subscriptions and face a commercial licensing labyrinth.',
                'Hotline Sports is building the intelligence layer between rights complexity and the person who just wants to watch the game.',
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
              <img
                src="/brand/project-sapiens-circle.png"
                alt=""
                aria-hidden="true"
                className="sapien-mark mt-1 h-6 w-6 shrink-0"
              />
              <div>
                <p className="text-base font-semibold text-ink">
                  Hotline Sports Research Team
                </p>
                <p className="mt-1 text-sm text-[#626762]">
                  Where-to-watch intelligence for fans and venues
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
                  Hotline Sports is a where-to-watch intelligence engine for
                  sports fans and venues. This document was produced as
                  foundational research for the Hotline Sports editorial and
                  product team.
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
