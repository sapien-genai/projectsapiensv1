import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import './ClientLogoCarousel.css';

const logos = [
  ['riowhite.png', 'Rio 2016'],
  ['PyeongChang_2018_Winter_Olympics.png', 'PyeongChang 2018'],
  ['olympicchannelwhite.png', 'Olympic Channel'],
  ['newbalancewhite.png', 'New Balance'],
  ['virginatlanticwhite.png', 'Virgin Atlantic'],
  ['broncoswhite.png', 'Denver Broncos'],
  ['cardinalswhite.png', 'Arizona Cardinals'],
  ['kingswhite.png', 'LA Kings'],
  ['baskinrobbinswhite.png', 'Baskin-Robbins'],
  ['publixwhite.png', 'Publix'],
  ['Anthropic_logo.svg.png', 'Anthropic'],
];

export default function ClientLogoCarousel() {
  const [paused, setPaused] = useState(false);
  return <section className={`sp-client-carousel${paused ? ' is-paused' : ''}`} aria-label="Organizations from our team's experience">
    <div className="sp-client-window" tabIndex={0} aria-label="Brand logos. Motion pauses while focused.">
      <div className="sp-client-track">
        {[0, 1].map(copy => <div className="sp-client-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
          {logos.map(([file, name]) => <div className="sp-client-logo" key={name}><img src={`/clients/${file}`} alt={copy === 0 ? name : ''} width="150" height="80" decoding="async" /></div>)}
        </div>)}
      </div>
    </div>
    <button className="sp-client-toggle" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play brand carousel' : 'Pause brand carousel'} aria-pressed={paused}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>
  </section>;
}
