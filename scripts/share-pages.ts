import { FIELD_NOTES } from '../src/data/fieldNotes';
import { SERVICES } from '../src/data/services';
export const origin = 'https://www.projectsapiens.ai';
export const sharePages = [
  ...SERVICES.map(service => ({ path: `/${service.slug}/`, slug: service.slug, title: service.title, description: service.description, label: 'PROJECT SAPIENS / SERVICES', lines: service.slug === 'custom-ai-agents' ? ['Custom AI agents.', 'Built for your work.'] : ['Voice AI.', 'Built for conversation.'], size: 78 })),
  { path: '/terms/', slug: 'terms', title: 'Terms of Service — Project Sapiens', description: 'Terms for using the Project Sapiens company website and submitting project inquiries.', label: 'TRUST & LEGAL', lines: ['Terms of', 'Service'], size: 100 },
  { path: '/privacy/', slug: 'privacy', title: 'Privacy Policy — Project Sapiens', description: 'How Project Sapiens handles website inquiries, technical information, and privacy requests.', label: 'TRUST & LEGAL', lines: ['Privacy', 'Policy'], size: 100 },
  { path: '/openai-partner-network/', slug: 'openai-partner-network', title: 'OpenAI Partner Network — Project Sapiens', description: 'Our experience, our role in the OpenAI Partner Network, and how we approach practical AI adoption, data protection, and security.', label: 'OPENAI PARTNER NETWORK', lines: ['Powerful AI.', 'Experienced hands.'], size: 84 },
  { path: '/', slug: 'home', title: 'Project Sapiens — Custom AI Agents & Voice AI Development', description: 'Custom AI agents, voice AI, and OpenAI product development for businesses. Independent expertise, fractional AI leadership, and hands-on delivery.', label: 'INTELLIGENCE, IN SYNC', lines: ['Intelligence.', 'Built for', 'your business.'], size: 88 },
  { path: '/about/', slug: 'about', title: 'About Project Sapiens — Meet Tony Marks', description: 'Meet Project Sapiens and founder Tony Marks. Practical AI strategy, product development, and experience building intelligent systems.', label: 'ABOUT PROJECT SAPIENS', lines: ['Curious minds.', 'Working hands.'], size: 88 },
  { path: '/work-with-us/', slug: 'work-with-us', title: 'Work with Project Sapiens', description: 'AI strategy and development, fractional AI leadership, and ongoing advisory. Turn a promising idea into a product people can use.', label: 'WORK WITH US', lines: ['From AI idea', 'to useful product.'], size: 88 },
  { path: '/ai-visibility/', slug: 'ai-visibility', title: 'AI Brand Visibility — Project Sapiens', description: 'Find out how ChatGPT, Claude, Gemini, and Perplexity describe your company, where the picture is missing or wrong, and what to change.', label: 'AI BRAND VISIBILITY', lines: ['What does AI', 'say about you?'], size: 96 },
  { path: '/field-notes/', slug: 'field-notes', title: 'Field Notes — Project Sapiens', description: 'Observations from building at the edge of AI. Essays by Tony Marks on technology, product design, and the human details.', label: 'FIELD NOTES / TONY MARKS', lines: ['Thinking', 'in public.'], size: 104 },
  ...FIELD_NOTES.map(note => ({ path: `${note.href}/`, slug: note.href.split('/').pop()!, title: `${note.title} — Project Sapiens`, description: note.excerpt, label: `FIELD NOTES ${note.number} / TONY MARKS`, ...({
    '06': { lines: ['What We Choose', 'to Delegate'], size: 88 },
    '05': { lines: ['What “Attention', 'Is All You Need”', 'Actually Changed'], size: 76 },
    '04': { lines: ['Why Is It So Hard', 'to Watch Sports?'], size: 82 },
    '03': { lines: ['AI Has Entered Its', 'Infrastructure Era'], size: 80 },
    '02': { lines: ['AI Brand', 'Visibility'], size: 104 },
    '01': { lines: ['How We Accidentally', 'Started Building', 'Pronunciation Intelligence'], size: 65 },
  }[note.number]!) })),
];
