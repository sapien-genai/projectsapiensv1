/** Shared by the homepage section and the /ai-visibility page so the two never drift apart. */
export const VISIBILITY_ASSISTANTS = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];

export const VISIBILITY_QUESTIONS = [
  { name: 'Recognition', question: 'Does AI know who you are?', detail: 'We ask each assistant about your company by name and compare the answer with the facts: what you do, who you serve, where you operate, and who leads it.' },
  { name: 'Discovery', question: 'Does AI bring you up when someone describes your category?', detail: 'We ask the way a customer would, without naming you, and record which companies are recommended, in what order, and with which sources.' },
  { name: 'Accuracy', question: 'Is what it says about you correct?', detail: 'We look for gaps and errors in how your products, people, history, and positioning are described, including details that are out of date or belong to another company.' },
  { name: 'Signals', question: 'Can AI read what you publish?', detail: 'We check whether crawlers can reach and read your site, then review the public sources assistants lean on: documentation, structured data, founder writing, press, and third-party profiles.' },
];
