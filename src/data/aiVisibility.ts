/** Shared by the homepage section and the /ai-visibility page so the two never drift apart. */
export const VISIBILITY_ASSISTANTS = ['ChatGPT', 'Claude', 'Gemini'];

export const VISIBILITY_QUESTIONS = [
  { name: 'Recognition', question: 'Does AI know who you are?', detail: 'We ask each assistant about your company by name and compare its description with your public website. This tests prompted recognition, not independent discovery.' },
  { name: 'Discovery', question: 'Does AI bring you up when someone describes your category?', detail: 'We ask sample customer questions without naming you, and record mentions and cited sources. A mention is not necessarily a recommendation.' },
  { name: 'Accuracy', question: 'Is what it says about you correct?', detail: 'We flag potential inconsistencies against public website information for you to verify. An automated comparison is not an independent fact check.' },
  { name: 'Signals', question: 'Can AI read what you publish?', detail: 'We sample public pages, metadata, structured data and standard discovery files, and show the sources assistants cited. A successful fetch does not prove access by every crawler.' },
];
