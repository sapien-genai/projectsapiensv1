import Portrait from './Portrait';
import { useEffect, useState } from 'react';
import FieldNoteInteractive from './FieldNoteInteractive';
import CompanyHeader from '../CompanyHeader';
import { ArrowLeft, ArrowRight, Share2, Link as LinkIcon } from 'lucide-react';

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

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 border-l-2 border-ink pl-6">
      <p className="text-xl font-medium leading-snug text-ink text-balance">
        {children}
      </p>
    </blockquote>
  );
}

function Figure({
  src,
  alt,
  caption,
  attribution,
}: {
  src: string;
  alt: string;
  caption: string;
  attribution: string;
}) {
  return (
    <figure className="my-12">
      <div className="overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-auto"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-[#626762]">
        {caption}
        <span className="mt-1 block text-xs text-[#a5aaa5]">{attribution}</span>
      </figcaption>
    </figure>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'What We Choose to Delegate', url });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard not available
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-sm text-[#626762] transition-opacity hover:opacity-70"
      aria-label="Share article"
    >
      {copied ? (
        <>
          <LinkIcon size={16} strokeWidth={2} />
          Link copied
        </>
      ) : (
        <>
          <Share2 size={16} strokeWidth={2} />
          Share
        </>
      )}
    </button>
  );
}

export default function NuclearLesson() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="company-site fn-article">
      <ReadingProgress />
      <CompanyHeader /><main id="main"><a className="fn-back" href="/field-notes/">← All Field Notes</a>

      {/* ── Article header ─────────────────────────────────── */}
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
            <span>AI / History / Governance</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>No. 06</span>
          </div>

          {/* Title */}
          <h1 className="fade-in-up fade-in-delay-1 mt-6 text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink text-balance">
            What We Choose to Delegate
          </h1>

          {/* Subtitle */}
          <p className="fade-in-up fade-in-delay-2 mt-6 text-lg leading-relaxed text-ink/60 text-balance lg:text-xl">
            The nuclear age expanded what humanity could destroy. The AI age is expanding what we can delegate. Meaningful control requires more than a human with the final say.
          </p>

          {/* Author / date / reading time */}
          <div className="fade-in-up fade-in-delay-3 mt-8 flex flex-wrap items-center gap-4 text-sm text-[#626762]">
            <span>Tony Marks</span>
            <span className="text-[#a5aaa5]">/</span>
            <span>Originally published <time dateTime="2026-10-15">October 15, 2026</time> · Revised <time dateTime="2026-10-27">October 27, 2026</time></span>
            <span className="text-[#a5aaa5]">/</span>
            <span>10 min read</span>
          </div>

          {/* Back to Field Notes + Share */}
          <div className="fade-in-up fade-in-delay-3 mt-6 flex items-center gap-6">
            <a
              href="/field-notes/"
              className="inline-flex items-center gap-1.5 text-sm text-[#626762] transition-opacity hover:opacity-70"
            >
              <ArrowLeft size={16} strokeWidth={2} />
              Field Notes
            </a>
            <ShareButton />
          </div>
        </div>

        {/* Hero image — Trinity test */}
        <div className="fade-in-up fade-in-delay-4 mx-auto max-w-[960px] px-6 pb-14 lg:pb-20">
          <Figure src={"/field-notes/the-nuclear-lesson/trinity-test-1945.jpg"} alt={"The Trinity test fireball, the first detonation of a nuclear weapon, July 16, 1945, near Alamogordo, New Mexico."} caption={"The Trinity test, July 16, 1945. Humanity proved it could build the device. The institutions to manage it were still twelve years away."} attribution={"U.S. Government photograph, public domain. Via Wikimedia Commons."} />
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────── */}
      <div className="mx-auto max-w-[740px] px-6 py-16 lg:py-20">
        <div className="space-y-6 text-[1.125rem] leading-[1.7] text-ink/85 lg:text-[1.1875rem] lg:leading-[1.7]">
          <p>Ask an AI system to explain a problem and you are asking for information. Give it tools, credentials and an objective, and you are granting it authority.</p>

          <p>The difference can disappear behind a conversational interface. “Find the answer” becomes “resolve the issue.” “Suggest a change” becomes “make it work.” The outcome is specified. The acceptable means often are not.</p>

          <p>That is the part of the AI arms-race argument that deserves closer attention. How powerful these systems become matters. How much discretion we hand them—and whether we remain able to understand, challenge and stop what they do—matters more.</p>

          <p>Nuclear weapons transformed humanity’s capacity to destroy. AI agents are expanding our capacity to delegate. Delegation is old; so is automation. What is new is the flexibility with which a system can choose its intermediate steps, pick up tools and act across environments it was never specifically programmed for.<sup><a id="cite-agents-1" href="#ref-agents" aria-label="Reference 1" className="px-0.5 underline underline-offset-2">1</a></sup></p>

          <p>The nuclear analogy is useful, though not because AI is another bomb. Its value is the warning that technical achievement never settled the question of who should exercise power, under what constraints, and with what consequences. It only made the question urgent.</p>

          <h2 className="pt-8 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">The Nuclear Lesson Worth Keeping</h2>

          <p>On July 16, 1945, the Trinity test proved that an atomic weapon could work. The institutions for managing the consequences came later. The International Atomic Energy Agency was established in 1957. The Nuclear Non-Proliferation Treaty entered into force in 1970.<sup><a id="cite-trinity-1" href="#ref-trinity" aria-label="Reference 2" className="px-0.5 underline underline-offset-2">2</a></sup><sup><a id="cite-iaea-1" href="#ref-iaea" aria-label="Reference 3" className="px-0.5 underline underline-offset-2">3</a></sup><sup><a id="cite-npt-1" href="#ref-npt" aria-label="Reference 4" className="px-0.5 underline underline-offset-2">4</a></sup></p>

          <p>That interval matters. But governance did not simply arrive and solve the problem. In October 1962, the Cuban Missile Crisis brought the United States and Soviet Union to the edge of nuclear war. Negotiation mattered precisely because technical capability had not made the political situation controllable.<sup><a id="cite-cuba-1" href="#ref-cuba" aria-label="Reference 5" className="px-0.5 underline underline-offset-2">5</a></sup></p>

          <Figure src={"/field-notes/the-nuclear-lesson/excomm-cuban-missile-crisis-1962.jpg"} alt={"President John F. Kennedy meets with the Executive Committee of the National Security Council during the Cuban Missile Crisis, October 29, 1962."} caption={"President Kennedy with the Executive Committee of the National Security Council, October 29, 1962. A consequential decision made with incomplete information, unreliable communication and very little time\u2014the conditions this essay is about."} attribution={"White House photograph, public domain. Via Wikimedia Commons."} />

          <p>The institutions and agreements built around nuclear technology were substantial achievements. Inspection and verification made some commitments credible. They did not turn every dangerous interaction into a predictable one.</p>

          <PullQuote>Survival is not the same thing as control.</PullQuote>

          <p>The competitive logic is familiar. When an organization believes that falling behind will leave it vulnerable, restraint looks like surrendering an advantage. A rival’s precautions appear threatening; the response justifies further escalation. Neither side has to want a catastrophe for the incentives to produce one.</p>

          <p>I do not expect this history to repeat exactly. I expect us to repeat the habit: treating capability as urgent and control as something to be worked out afterward.</p>

          <p>Nor is the contrast as neat as “destroy versus delegate” suggests. Nuclear command systems already involve delegated authority, automated warning and hard questions about human judgment. AI does not introduce those problems from nowhere. It extends them into tools that can be wired into ordinary institutions, businesses and everyday decisions.<sup><a id="cite-nuclear-1" href="#ref-nuclear" aria-label="Reference 6" className="px-0.5 underline underline-offset-2">6</a></sup></p>

          <h3 className="pt-6 text-lg font-semibold text-ink">Selected milestones: capability, verification and control</h3>

          <div className="overflow-x-auto"><table className="w-full text-left text-sm leading-relaxed"><thead><tr><th scope="col" className="border-b border-[#dedfda] p-3">Date</th><th scope="col" className="border-b border-[#dedfda] p-3">Milestone</th></tr></thead><tbody><tr><td className="border-b border-[#dedfda] p-3 align-top">July 16, 1945</td><td className="border-b border-[#dedfda] p-3 align-top">Trinity: the first nuclear detonation.<sup><a id="cite-trinity-2" href="#ref-trinity" aria-label="Reference 2" className="px-0.5 underline underline-offset-2">2</a></sup></td></tr><tr><td className="border-b border-[#dedfda] p-3 align-top">July 29, 1957</td><td className="border-b border-[#dedfda] p-3 align-top">The IAEA Statute enters into force.<sup><a id="cite-iaea-2" href="#ref-iaea" aria-label="Reference 3" className="px-0.5 underline underline-offset-2">3</a></sup></td></tr><tr><td className="border-b border-[#dedfda] p-3 align-top">October 1962</td><td className="border-b border-[#dedfda] p-3 align-top">The Cuban Missile Crisis.<sup><a id="cite-cuba-2" href="#ref-cuba" aria-label="Reference 5" className="px-0.5 underline underline-offset-2">5</a></sup></td></tr><tr><td className="border-b border-[#dedfda] p-3 align-top">March 5, 1970</td><td className="border-b border-[#dedfda] p-3 align-top">The Nuclear Non-Proliferation Treaty enters into force.<sup><a id="cite-npt-2" href="#ref-npt" aria-label="Reference 4" className="px-0.5 underline underline-offset-2">4</a></sup></td></tr><tr><td className="border-b border-[#dedfda] p-3 align-top">November 16, 2024</td><td className="border-b border-[#dedfda] p-3 align-top">U.S. and Chinese leaders affirm that decisions to use nuclear weapons must remain under human control.<sup><a id="cite-readout-1" href="#ref-readout" aria-label="Reference 7" className="px-0.5 underline underline-offset-2">7</a></sup></td></tr><tr><td className="border-b border-[#dedfda] p-3 align-top">August 2, 2025</td><td className="border-b border-[#dedfda] p-3 align-top">EU AI Act obligations for general-purpose AI models begin applying, with transition arrangements for existing models.<sup><a id="cite-gpai-1" href="#ref-gpai" aria-label="Reference 8" className="px-0.5 underline underline-offset-2">8</a></sup></td></tr><tr><td className="border-b border-[#dedfda] p-3 align-top">February 17, 2026</td><td className="border-b border-[#dedfda] p-3 align-top">NIST announces its AI Agent Standards Initiative, including work on agent security and identity.<sup><a id="cite-agents-2" href="#ref-agents" aria-label="Reference 1" className="px-0.5 underline underline-offset-2">1</a></sup></td></tr></tbody></table></div>

          <h2 className="pt-8 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">When the Task Is Not the Permission</h2>

          <p>Hotline Sports, the product I am building, answers a simple question: where can I watch this game? One of its workflow rules has a very ordinary origin.</p>

          <p>During a coding session, an AI assistant committed a fix directly on the checkout I use for review—the copy that is supposed to mirror the main branch. The same fix was also submitted the proper way: on a branch, reviewed, merged. The project now had two histories of how the change arrived, where it needed one dependable record.</p>

          <p>The rule that followed was explicit. The review checkout is read-only for agents. Agents work in their own workspaces, and there is one route by which their work is integrated.</p>

          <p>A git mishap is not a catastrophe. But the questions it raised are the questions that matter when the stakes are high. Where may the system write? Which record is authoritative? What has to happen before an action counts? Completing the requested task is not the same as acting within the intended authority—and the difference does not depend on the system wanting to disobey, or on whether it understands the rule the way a person would.</p>

          <p>A written rule is a correction, not proof of control. Wherever possible, those boundaries belong in the tools and permissions around the agent, not solely in its interpretation of instructions.</p>

          <p>There is a related boundary in the product itself, and it governs what the system may claim rather than what it may change. If our sources carry no broadcast listing for a game, that is a gap in our evidence. A confirmed regional blackout is evidence of unavailability. Both can be rendered as “not available in your area.” Our design rules require the uncertainty to survive the journey from the underlying data to the sentence an agent presents. A cleaner sentence must not become a more certain claim.</p>

          <p>Both are forms of delegated authority: one over the record, one over the truth.</p>

          <p>Now consider the permissions implied by “fix the problem.” Inspecting software, proposing a patch, deploying it and modifying the database it depends on are four different grants. The instruction names none of them. An agent that finds a route to the requested outcome has not thereby shown that the route was authorized.</p>

          <p>The same applies to stopping. A stop button is only meaningful if it halts the relevant activity: new tool calls, queued work, tasks delegated to other agents, continuing access to credentials. And stopping future actions cannot recall an email already sent or information already disclosed.</p>

          <p>These are design requirements. They should not be left to the system’s improvisation. NIST’s work on agent identity and authorization is one concrete recognition that the surrounding permission structure matters.<sup><a id="cite-identity-1" href="#ref-identity" aria-label="Reference 9" className="px-0.5 underline underline-offset-2">9</a></sup></p>

          <PullQuote>The danger is not necessarily that machines will decide to disobey us. It is that we may give them objectives, access and autonomy without adequately defining what obedience should mean.</PullQuote>

          <h2 className="pt-8 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">The Illusion of Human Control</h2>

          <p>“Keep a human in the loop” sounds like an answer. It is usually where the question begins.</p>

          <p>Imagine a person asked to approve an action after an AI system has selected the evidence, summarized the alternatives and recommended a response. The person can still click no. How much control do they exercise if they cannot see what was excluded, cannot read the uncertainty, and have seconds to decide?</p>

          <FieldNoteInteractive slug="who-is-in-control" title="Who Is in Control?" />

          <p>The AI has not taken the final decision. It may have shaped the decision so thoroughly that the human is approving a conclusion rather than assessing one.</p>

          <p>People do not always decide better than machines, and meaningful oversight does not require a person to approve every trivial operation. It requires a realistic way to recognize when the system may be wrong and to intervene before the harm becomes irreversible.</p>

          <p>For a consequential decision, I would want the reviewer to have evidence beyond the system’s summary, a comprehensible account of uncertainty, enough time to challenge the recommendation, and the authority to refuse or stop the action. A veto without those conditions is a weak safeguard.</p>

          <p>The EU AI Act recognizes part of this. Its human-oversight provisions address overreliance on AI outputs and the ability to disregard, override or interrupt a high-risk system. The principle is already in law; making it effective in a particular deployment remains an engineering and organizational task.<sup><a id="cite-oversight-1" href="#ref-oversight" aria-label="Reference 10" className="px-0.5 underline underline-offset-2">10</a></sup></p>

          <p>The institutional incentive matters as much as the interface. An organization that rewards rapid approval and treats hesitation as failure can hollow out its own oversight policy without removing a single approval button.</p>

          <p>Machines resisting human control is one danger. Humans building a process in which exercising control becomes impractical is the more likely one.</p>

          <h2 className="pt-8 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">When AI Meets Nuclear Command</h2>

          <p>Here the analogy stops being an analogy.</p>

          <p>AI applications in intelligence, warning and decision support shape the information available during a nuclear crisis. SIPRI’s analysis identifies risks around reliability, transparency and human oversight, alongside potential benefits from better analysis. It also finds that agreement on the importance of human control is not agreement on how to define or implement it.<sup><a id="cite-nuclear-2" href="#ref-nuclear" aria-label="Reference 6" className="px-0.5 underline underline-offset-2">6</a></sup></p>

          <p>On November 16, 2024, the leaders of the United States and China affirmed that decisions to use nuclear weapons should remain under human control. That was an important statement of principle. It was not an operational test of whether that control would remain meaningful under pressure.<sup><a id="cite-readout-2" href="#ref-readout" aria-label="Reference 7" className="px-0.5 underline underline-offset-2">7</a></sup></p>

          <p>The hardest case is not a machine choosing to launch. It is a system that characterizes ambiguous information as evidence of an imminent attack, and a human who retains final authorization but receives a confident assessment, a narrowed set of options and an apparent deadline.</p>

          <p>Who is in control then?</p>

          <p>The questions are the ones from the review checkout, with the stakes raised. Can the decision-maker inspect independent evidence? Does uncertainty remain visible? Is there a route for challenge that does not run through the same system? Can the institution tolerate delay when the machine recommends speed? And if someone says stop, what actually stops?</p>

          <p>These are questions about the whole decision process, including everything upstream of authorization. Preserving human control at the end means little if it has been weakened at every step leading there.</p>

          <p>I am not arguing that AI should be excluded from nuclear-related work. Better analysis and verification could be valuable. I am arguing that the burden of demonstrating meaningful control should rise with the consequence and irreversibility of the decision.</p>

          <h2 className="pt-8 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">What Governance Still Cannot Verify</h2>

          <p>AI governance is not an empty space.</p>

          <p>The United Kingdom has an AI Security Institute. In the United States, NIST’s Center for AI Standards and Innovation—the renamed AI Safety Institute—runs evaluation and standards programs. The summit process through Bletchley Park, Seoul and Paris created forums for international cooperation. The Seoul commitments address severe-risk thresholds and responses; the industry-supported Frontier Model Forum works on safety practices and information sharing.<sup><a id="cite-aisi-1" href="#ref-aisi" aria-label="Reference 11" className="px-0.5 underline underline-offset-2">11</a></sup><sup><a id="cite-agents-3" href="#ref-agents" aria-label="Reference 1" className="px-0.5 underline underline-offset-2">1</a></sup><sup><a id="cite-summits-1" href="#ref-summits" aria-label="Reference 12" className="px-0.5 underline underline-offset-2">12</a></sup><sup><a id="cite-seoul-1" href="#ref-seoul" aria-label="Reference 13" className="px-0.5 underline underline-offset-2">13</a></sup><sup><a id="cite-fmf-1" href="#ref-fmf" aria-label="Reference 14" className="px-0.5 underline underline-offset-2">14</a></sup></p>

          <p>The EU AI Act goes beyond voluntary commitments. It establishes legal obligations for general-purpose model providers, additional duties for models presenting systemic risk, and human-oversight requirements for high-risk systems. Implementation is phased, but the distinction between a legal duty and an industry promise matters.<sup><a id="cite-gpai-2" href="#ref-gpai" aria-label="Reference 8" className="px-0.5 underline underline-offset-2">8</a></sup><sup><a id="cite-oversight-2" href="#ref-oversight" aria-label="Reference 10" className="px-0.5 underline underline-offset-2">10</a></sup></p>

          <p>And on February 17, 2026, NIST announced an AI Agent Standards Initiative that includes agent security and identity. The questions raised by delegation are not invisible to the institutions already working on AI.<sup><a id="cite-agents-4" href="#ref-agents" aria-label="Reference 1" className="px-0.5 underline underline-offset-2">1</a></sup></p>

          <FieldNoteInteractive slug="who-has-signed-what" title="Who Has Signed What" />

          <p>Calling all of this ceremony would be unfair. Treating it as sufficient would be premature. The gap has three parts.</p>

          <p><strong>A model evaluation is not a continuing guarantee about a deployed system.</strong> Connect a model to new tools, change its permissions, or place it in a different workflow, and you have changed the conditions under which it acts. NIST’s 2026 work on post-deployment monitoring explicitly examines the gaps and barriers involved in observing systems after release.<sup><a id="cite-monitoring-1" href="#ref-monitoring" aria-label="Reference 15" className="px-0.5 underline underline-offset-2">15</a></sup></p>

          <p><strong>A commitment is not automatically an enforceable boundary.</strong> The Seoul commitments include processes for responding when severe-risk thresholds are crossed, including not proceeding when risks cannot be adequately mitigated. That is meaningful. It still leaves the practical questions of who can independently verify compliance, obtain the relevant evidence and require corrective action.<sup><a id="cite-seoul-2" href="#ref-seoul" aria-label="Reference 13" className="px-0.5 underline underline-offset-2">13</a></sup></p>

          <p><strong>Civilian regulation is not an international agreement about strategic military systems.</strong> The EU AI Act excludes AI used exclusively for military, defence or national-security purposes. That does not make its civilian protections irrelevant. It means they cannot substitute for arrangements governing the nuclear decision process.<sup><a id="cite-scope-1" href="#ref-scope" aria-label="Reference 16" className="px-0.5 underline underline-offset-2">16</a></sup></p>

          <Figure src={"/field-notes/the-nuclear-lesson/carter-brezhnev-salt-ii-1979.jpg"} alt={"President Jimmy Carter and Soviet General Secretary Leonid Brezhnev sign the SALT II treaty in Vienna, June 18, 1979."} caption={"Carter and Brezhnev sign SALT II, Vienna, June 18, 1979. Arms control never required trust or ideological agreement. It required adversaries to recognize a shared interest in avoiding catastrophe\u2014and a way to verify what the other side had promised."} attribution={"White House photograph by Bill Fitz-Patrick, public domain. Via Wikimedia Commons."} />

          <p>The response should build on these institutions rather than announce another one.</p>

          <p>For high-consequence deployments, I would prioritize independent evaluation of the actual system—including its tools and permissions—alongside records that allow an incident to be reconstructed. Interruption and revocation should be tested, not merely described. Responsibility should be assigned across the organizations supplying the model, operating the agent and authorizing the deployment.</p>

          <p>Serious-incident reporting and corrective powers should be enforceable where voluntary arrangements fall short. Cross-border cooperation should establish how relevant evidence can be shared and who has the authority to require a dangerous deployment to change or stop. That access must also protect privacy, security and legitimate confidential information.</p>

          <p>In nuclear-related settings, the immediate objective should be more specific: agree on what meaningful human control requires, identify practices that undermine it, and establish ways to communicate when AI-influenced activity could be misread as preparation for attack.</p>

          <p>Agreements without verification are fragile. Verification without consequences becomes ceremony. Neither is enough if no one has specified what authority was delegated in the first place.</p>

          <p>None of this promises perfect verification. It asks that a claim of control come with evidence, a responsible party and a credible way to intervene.</p>

          <h2 className="pt-8 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">The Lesson</h2>

          <p>There is no reason to treat every useful AI system as a nuclear weapon. Nuclear technology has peaceful applications; AI’s benefits are part of the reason to govern it well.<sup><a id="cite-iaea-3" href="#ref-iaea" aria-label="Reference 3" className="px-0.5 underline underline-offset-2">3</a></sup></p>

          <p>The relevant distinction was never building versus refusing to build. It is delegating a bounded task versus granting open-ended discretion without a dependable way to supervise it. That distinction should set the burden of proof. A reversible, low-consequence action does not need the controls of a decision that can expose sensitive information, alter critical infrastructure or influence the use of force. Oversight should be proportionate. So should our confidence.</p>

          <p>The mundane engineering questions belong in the policy debate. What is the system permitted to do? What evidence supports its recommendation? Which actions require separate authorization? What happens when we revoke access? Who is responsible when the boundary fails? A society that cannot answer them should hesitate before describing its systems as under human control.</p>

          <p>At Trinity, humanity showed what it could build. The decades that followed showed how much harder it is to manage what has been built. We should not need a comparable crisis to tell a powerful system from a governed one.</p>

          <p>The nuclear age forced us to confront the consequences of what we could destroy. The AI age is forcing us to confront the consequences of what we choose to delegate.</p>

          <section aria-labelledby="references-heading" className="mt-12 border-t border-[#dedfda] pt-8"><h2 id="references-heading" className="text-xl font-semibold text-ink">References and further reading</h2><ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-ink/70">

          <li id="ref-agents" className="scroll-mt-20 break-words">National Institute of Standards and Technology, <a href="https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“Announcing the ‘AI Agent Standards Initiative’ for Interoperable and Secure Innovation”</a>, February 17, 2026. <a href="#cite-agents-1" aria-label="Back to citation 1, occurrence 1" className="underline">↩1</a> <a href="#cite-agents-2" aria-label="Back to citation 1, occurrence 2" className="underline">↩2</a> <a href="#cite-agents-3" aria-label="Back to citation 1, occurrence 3" className="underline">↩3</a> <a href="#cite-agents-4" aria-label="Back to citation 1, occurrence 4" className="underline">↩4</a></li>

          <li id="ref-trinity" className="scroll-mt-20 break-words">U.S. Department of Energy, <a href="https://www.energy.gov/lm/trinity-site-worlds-first-nuclear-explosion" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“Trinity Site — World’s First Nuclear Explosion”</a>. <a href="#cite-trinity-1" aria-label="Back to citation 2, occurrence 1" className="underline">↩1</a> <a href="#cite-trinity-2" aria-label="Back to citation 2, occurrence 2" className="underline">↩2</a></li>

          <li id="ref-iaea" className="scroll-mt-20 break-words">International Atomic Energy Agency, <a href="https://archives-catalogue.iaea.org/Search6/search/simple" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">historical archive chronology</a>, including the Statute’s entry into force on July 29, 1957, and the development of safeguards. <a href="#cite-iaea-1" aria-label="Back to citation 3, occurrence 1" className="underline">↩1</a> <a href="#cite-iaea-2" aria-label="Back to citation 3, occurrence 2" className="underline">↩2</a> <a href="#cite-iaea-3" aria-label="Back to citation 3, occurrence 3" className="underline">↩3</a></li>

          <li id="ref-npt" className="scroll-mt-20 break-words">United Nations Treaty Collection, <a href="https://treaties.un.org/Pages/showDetails.aspx?clang=_en&amp;objid=08000002801d56c5" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">Treaty on the Non-Proliferation of Nuclear Weapons</a>, entry into force March 5, 1970. <a href="#cite-npt-1" aria-label="Back to citation 4, occurrence 1" className="underline">↩1</a> <a href="#cite-npt-2" aria-label="Back to citation 4, occurrence 2" className="underline">↩2</a></li>

          <li id="ref-cuba" className="scroll-mt-20 break-words">U.S. Department of State, Office of the Historian, <a href="https://history.state.gov/milestones/1961-1968/cuban-missile-crisis" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“The Cuban Missile Crisis, October 1962”</a>. <a href="#cite-cuba-1" aria-label="Back to citation 5, occurrence 1" className="underline">↩1</a> <a href="#cite-cuba-2" aria-label="Back to citation 5, occurrence 2" className="underline">↩2</a></li>

          <li id="ref-nuclear" className="scroll-mt-20 break-words">Stockholm International Peace Research Institute, <a href="https://www.sipri.org/publications/2025/other-publications/pragmatic-approaches-governance-artificial-intelligence-nuclear-nexus" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink"><em>Pragmatic Approaches to Governance at the Artificial Intelligence–Nuclear Nexus</em></a>, October 2025. <a href="#cite-nuclear-1" aria-label="Back to citation 6, occurrence 1" className="underline">↩1</a> <a href="#cite-nuclear-2" aria-label="Back to citation 6, occurrence 2" className="underline">↩2</a></li>

          <li id="ref-readout" className="scroll-mt-20 break-words">White House, <a href="https://www.presidency.ucsb.edu/documents/readout-president-joe-bidens-meeting-with-president-xi-jinping-the-peoples-republic-1" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“Readout of President Joe Biden’s Meeting with President Xi Jinping of the People’s Republic of China”</a>, November 16, 2024; preserved by the American Presidency Project. <a href="#cite-readout-1" aria-label="Back to citation 7, occurrence 1" className="underline">↩1</a> <a href="#cite-readout-2" aria-label="Back to citation 7, occurrence 2" className="underline">↩2</a></li>

          <li id="ref-gpai" className="scroll-mt-20 break-words">European Commission, <a href="https://digital-strategy.ec.europa.eu/en/news/eu-rules-general-purpose-ai-models-start-apply-bringing-more-transparency-safety-and-accountability" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“EU rules on general-purpose AI models start to apply, bringing more transparency, safety and accountability”</a>, August 1, 2025; and <a href="https://digital-strategy.ec.europa.eu/en/factpages/general-purpose-ai-obligations-under-ai-act" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“General-purpose AI obligations under the AI Act”</a>. <a href="#cite-gpai-1" aria-label="Back to citation 8, occurrence 1" className="underline">↩1</a> <a href="#cite-gpai-2" aria-label="Back to citation 8, occurrence 2" className="underline">↩2</a></li>

          <li id="ref-identity" className="scroll-mt-20 break-words">National Cybersecurity Center of Excellence, NIST, <a href="https://www.nccoe.nist.gov/projects/software-and-ai-agent-identity-and-authorization" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">agent identity and authorization project</a>, linked from NIST’s February 2026 initiative announcement. <a href="#cite-identity-1" aria-label="Back to citation 9, occurrence 1" className="underline">↩1</a></li>

          <li id="ref-oversight" className="scroll-mt-20 break-words">European Commission, AI Act Service Desk, <a href="https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-14" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">Article 14: Human oversight</a>. <a href="#cite-oversight-1" aria-label="Back to citation 10, occurrence 1" className="underline">↩1</a> <a href="#cite-oversight-2" aria-label="Back to citation 10, occurrence 2" className="underline">↩2</a></li>

          <li id="ref-aisi" className="scroll-mt-20 break-words">UK AI Security Institute, <a href="https://www.aisi.gov.uk/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">mission and research</a>. <a href="#cite-aisi-1" aria-label="Back to citation 11, occurrence 1" className="underline">↩1</a></li>

          <li id="ref-summits" className="scroll-mt-20 break-words">Presidency of the French Republic, <a href="https://www.elysee.fr/en/sommet-pour-l-action-sur-l-ia/official-documents" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">AI Action Summit: official documents and previous summit declarations</a>. <a href="#cite-summits-1" aria-label="Back to citation 12, occurrence 1" className="underline">↩1</a></li>

          <li id="ref-seoul" className="scroll-mt-20 break-words">UK Government, <a href="https://www.gov.uk/government/publications/frontier-ai-safety-commitments-ai-seoul-summit-2024/frontier-ai-safety-commitments-ai-seoul-summit-2024" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“Frontier AI Safety Commitments, AI Seoul Summit 2024”</a>. <a href="#cite-seoul-1" aria-label="Back to citation 13, occurrence 1" className="underline">↩1</a> <a href="#cite-seoul-2" aria-label="Back to citation 13, occurrence 2" className="underline">↩2</a></li>

          <li id="ref-fmf" className="scroll-mt-20 break-words">Frontier Model Forum, <a href="https://www.frontiermodelforum.org/about-us/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">About</a> and <a href="https://www.frontiermodelforum.org/issue-briefs/information-sharing-incident-reporting-and-incident-response-for-frontier-ai-risks/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“Information Sharing, Incident Reporting, and Incident Response for Frontier AI Risks”</a>. <a href="#cite-fmf-1" aria-label="Back to citation 14, occurrence 1" className="underline">↩1</a></li>

          <li id="ref-monitoring" className="scroll-mt-20 break-words">National Institute of Standards and Technology, <a href="https://www.nist.gov/news-events/news/2026/03/new-report-challenges-monitoring-deployed-ai-systems" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“New Report: Challenges to the Monitoring of Deployed AI Systems”</a>, March 2026. <a href="#cite-monitoring-1" aria-label="Back to citation 15, occurrence 1" className="underline">↩1</a></li>

          <li id="ref-scope" className="scroll-mt-20 break-words">European Commission, <a href="https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">“Navigating the AI Act”</a>, scope and objectives. <a href="#cite-scope-1" aria-label="Back to citation 16, occurrence 1" className="underline">↩1</a></li>

          </ol></section>

          {/* ── Author box ── */}
          <div className="mt-12 border-t border-[#dedfda] pt-10">
            <div className="flex items-start gap-4">
              <Portrait className="w-20 shrink-0" />
              <div>
                <p className="text-base font-semibold text-ink">Tony Marks</p>
                <p className="mt-1 text-sm text-[#626762]">
                  Founder, Project Sapiens
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
                  Builder of AI systems for the Olympic Games, NBA, NFL,
                  airlines, and enterprise platforms. Writing about AI
                  governance, the history of powerful technologies, and the
                  challenge of building responsible systems.
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
