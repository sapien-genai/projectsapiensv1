import { ArrowUpRight, ArrowDownRight, ArrowUp } from 'lucide-react';
import { useEffect } from 'react';
import CompanyHeader from './CompanyHeader';
import OpenAISolutions from './OpenAISolutions';
import ClientInquiryForm from './ClientInquiryForm';
import HeroSculpture from './HeroSculpture';
import './CompanyHome.css';
import './CompanyPreview.css';

export default function CompanyHome() {
 useEffect(() => { document.title = 'Project Sapiens — Intelligence built for your business'; }, []);
 return <div className="company-site sp-site">
<a className="sp-skip" href="#main">Skip to content</a>
<CompanyHeader/>
<main id="main">
<div className="wrap">
<section className="hero">
<div className="hero-top">
<span className="eyebrow">Member of the OpenAI Partner Network</span>
<span className="eyebrow status">
<i className="dot">
</i> Strategy → Product → Progress</span>
</div>
<h1>Intelligence.<br />
<em>Built for<br />your business.</em>
</h1>
<HeroSculpture />
<div className="hero-bottom">
<div>
<p className="intro">We turn OpenAI technology into practical products, agents, and voice experiences. From the first useful prototype to the work your business depends on.</p>
<div className="hero-ctas">
<a className="pill" href="#work">See what we’re building <span className="arrow"><ArrowDownRight className="sp-inline-arrow" aria-hidden="true" /></span>
</a>
<a className="textlink" href="#contact">Build with us <ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></a>
</div>
</div>
</div>
</section>
</div>
<div className="partner-band">
<div className="partner-lockup">
<span className="membership-mark" aria-hidden="true"><ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></span>
<div>
<small>PROJECT SAPIENS IS A MEMBER OF THE</small>
<strong>OpenAI Partner Network</strong>
</div>
</div>
<p>OpenAI technology.<br />Independent expertise. Hands-on delivery.</p>
<a href="#solutions">Explore what we can build <span><ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></span>
</a>
</div>
<div className="wrap">
<OpenAISolutions />
</div>
<section className="work" id="work">
<div className="wrap">
<div className="section-top">
<div className="eyebrow">02 / Out in the world</div>
<h2>Ideas are good.<br />Built is better.</h2>
</div>
<div className="work-layout">
<div>
<span className="eyebrow">Live product / Sports discovery</span>
<h3>Find the game.<br />Find your way<br />to watch.</h3>
<p>Hotline Sports brings schedules, broadcast information, and personalized watch options into one useful guide.</p>
<a className="textlink" href="https://hotlinesports.com/" target="_blank" rel="noopener">Explore Hotline Sports <ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></a>
</div>
<a className="sports-art actual-product" href="https://hotlinesports.com/" target="_blank" rel="noopener">
<img className="hotline-wordmark" src="/hotline-sports-logo.png" alt="Hotline Sports" />
<img className="product-screen" src="/hotline-preview.jpg" alt="Hotline Sports game discovery interface" loading="lazy" />
<span>Explore the live product <ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></span>
</a>
</div>
<div className="research" id="research">
<div>
<span className="eyebrow">Ongoing research / Pronunciation intelligence</span>
<h3>Every name matters.</h3>
<p>Exploring how speech systems can get people’s names right—with verified references and phoneme mappings.</p>
<a className="textlink" href="/field-notes/pronunciation-intelligence/">Inside the research <ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></a>
</div>
<div>
<div className="wave" aria-hidden="true">
<i style={{"height": "15px"}}>
</i>
<i style={{"height": "24px"}}>
</i>
<i style={{"height": "35px"}}>
</i>
<i style={{"height": "38px"}}>
</i>
<i style={{"height": "25px"}}>
</i>
<i style={{"height": "31px"}}>
</i>
<i style={{"height": "56px"}}>
</i>
<i style={{"height": "65px"}}>
</i>
<i style={{"height": "47px"}}>
</i>
<i style={{"height": "22px"}}>
</i>
<i style={{"height": "64px"}}>
</i>
<i style={{"height": "87px"}}>
</i>
<i style={{"height": "75px"}}>
</i>
<i style={{"height": "30px"}}>
</i>
<i style={{"height": "56px"}}>
</i>
<i style={{"height": "96px"}}>
</i>
<i style={{"height": "98px"}}>
</i>
<i style={{"height": "58px"}}>
</i>
<i style={{"height": "35px"}}>
</i>
<i style={{"height": "90px"}}>
</i>
<i style={{"height": "110px"}}>
</i>
<i style={{"height": "83px"}}>
</i>
<i style={{"height": "23px"}}>
</i>
<i style={{"height": "70px"}}>
</i>
<i style={{"height": "105px"}}>
</i>
<i style={{"height": "96px"}}>
</i>
<i style={{"height": "49px"}}>
</i>
<i style={{"height": "42px"}}>
</i>
<i style={{"height": "87px"}}>
</i>
<i style={{"height": "94px"}}>
</i>
<i style={{"height": "63px"}}>
</i>
<i style={{"height": "16px"}}>
</i>
<i style={{"height": "60px"}}>
</i>
<i style={{"height": "77px"}}>
</i>
<i style={{"height": "63px"}}>
</i>
<i style={{"height": "29px"}}>
</i>
<i style={{"height": "34px"}}>
</i>
<i style={{"height": "51px"}}>
</i>
<i style={{"height": "47px"}}>
</i>
<i style={{"height": "30px"}}>
</i>
<i style={{"height": "18px"}}>
</i>
<i style={{"height": "25px"}}>
</i>
<i style={{"height": "22px"}}>
</i>
</div>
<div className="eyebrow" style={{"textAlign": "center"}}>Human detail. Technical depth.</div>
</div>
</div>
</div>
</section>
<div className="wrap">
<section className="proof">
<div className="proof-label">Selected past work by Tony Marks and the Sapien AI team</div>
<div className="logos">
<img src="/clients/riowhite.png" alt="Rio 2016" loading="lazy" />
<img src="/clients/PyeongChang_2018_Winter_Olympics.png" alt="PyeongChang 2018" loading="lazy" />
<img src="/clients/olympicchannelwhite.png" alt="Olympic Channel" loading="lazy" />
<img src="/clients/newbalancewhite.png" alt="New Balance" loading="lazy" />
<img src="/clients/virginatlanticwhite.png" alt="Virgin Atlantic" loading="lazy" />
<img src="/clients/broncoswhite.png" alt="Denver Broncos" loading="lazy" />
</div>
</section>
<section id="company" className="section about">
<div>
<div className="eyebrow">03 / The way we think</div>
<h2>Curious minds.<br />Working hands.</h2>
</div>
<div>
<p>The interesting part of AI is what people can do with it.</p>
<p className="small">Founded by Tony Marks, Project Sapiens brings experience in conversational AI, voice, and digital products to the work of building useful software. We connect strategic judgment with hands-on development, from the first question to the next iteration.</p>
<a className="textlink" href="/about/#founder">Meet the founder <ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></a>
</div>
</section>
<section className="section" id="field-notes" style={{"paddingTop": "0"}}>
<div className="section-top">
<div className="eyebrow">04 / Field Notes</div>
<div><h2>Thinking in public.</h2><a className="textlink" href="/field-notes/" style={{display: "inline-block", marginTop: "22px"}}>Explore all Field Notes <ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></a></div>
</div>
<div className="notes">
<a className="note" href="/field-notes/the-nuclear-lesson/">
<small>NO. 06 / AI & JUDGMENT</small>
<h3>What We Choose<br />to Delegate</h3>
<span className="arrow"><ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></span>
</a>
<a className="note" href="/field-notes/attention-is-all-you-need/">
<small>NO. 05 / RESEARCH & PRODUCT</small>
<h3>What “Attention Is All You Need” Actually Changed</h3>
<span className="arrow"><ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></span>
</a>
<a className="note" href="/field-notes/ai-brand-visibility/">
<small>NO. 02 / AI & DISCOVERY</small>
<h3>AI Brand<br />Visibility</h3>
<span className="arrow"><ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></span>
</a>
</div>
</section>
</div>
<section className="engagement wrap">
<div className="eyebrow">Work with us</div>
<h2>Experienced help.<br />The right level.</h2>
<p>Project-based strategy and development, fractional AI leadership, and ongoing advisory.</p>
<a className="pill" href="/work-with-us/">Explore working together <ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></a>
</section>
<div className="wrap inquiry-wrap">
<ClientInquiryForm previewOnly={import.meta.env.DEV} />
</div>
</main>
<div className="wrap">
<footer>
<span>© 2026 Project Sapiens, Inc.</span>
<a href="/academy/login">Learning platform sign in <ArrowUpRight className="sp-inline-arrow" aria-hidden="true" /></a>
<a href="#">Back to top <ArrowUp className="sp-inline-arrow" aria-hidden="true" /></a>
</footer>
</div>{import.meta.env.DEV && <div className="sp-preview-label">LOCAL PREVIEW · NOT PUBLISHED</div>}</div>;
}
