export type AssistantId = 'chatgpt' | 'claude' | 'gemini';

export interface Citation { url: string; title?: string }
export interface AssistantAnswer { text: string; citations: Citation[]; searched: boolean; model: string }

/** Asks one assistant one question, the way a member of the public would. */
export type Ask = (prompt: string) => Promise<AssistantAnswer>;
/** Returns raw text from a cheap model; used for extraction and grading, never shown to visitors. */
export type Complete = (prompt: string) => Promise<string>;

export interface BusinessProfile { name: string; category: string; summary: string; audience: string; queries: string[] }

export interface SignalCheck { id: string; label: string; passed: boolean | null; detail: string; weight: number }
export interface SiteSignals {
  reachable: boolean; finalUrl: string; status: number; title: string; description: string; h1: string;
  text: string; wordCount: number; score: number | null; checks: SignalCheck[];
}

export interface DiscoveryResult { query: string; mentioned: boolean; answer: string; citations: Citation[] }
export interface AssistantResult {
  id: AssistantId; label: string; model: string; searched: boolean; error?: string;
  scores: { recognition: number | null; discovery: number | null; accuracy: number | null };
  summary: string; recognitionAnswer: string; recognitionCitations: Citation[];
  issues: string[]; competitors: string[]; discovery: DiscoveryResult[];
}

export interface Recommendation { title: string; detail: string; priority: 'high' | 'medium' | 'low' }

export interface Report {
  version: 1; domain: string; url: string; generatedAt: string;
  profile: BusinessProfile; overall: number | null; verdict: string;
  signals: Omit<SiteSignals, 'text'>;
  assistants: AssistantResult[]; recommendations: Recommendation[]; method: string;
}

/** What a visitor sees before giving an email: numbers and counts, none of the underlying answers. */
export interface ReportPreview {
  version: 1; domain: string; generatedAt: string; overall: number | null; verdict: string;
  business: { name: string; category: string };
  signalsScore: number | null;
  assistants: Array<Pick<AssistantResult, 'id' | 'label' | 'scores' | 'searched'> & { failed: boolean }>;
  locked: { issues: number; competitors: number; recommendations: number; failedChecks: number; answers: number };
  method: string;
}

export type ProgressStep = 'site' | 'profile' | 'assistants' | 'scoring';
