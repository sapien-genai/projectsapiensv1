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

export interface AuditPage {
  id: string; url: string; status: number | null; readable: boolean;
  title: string; description: string; h1: string; canonical: string; schemaTypes: string[];
  wordCount: number; excerpt: string;
}
export interface AuditAction {
  title: string; priority: 'high' | 'medium' | 'low'; classification: 'observed' | 'verify' | 'opportunity';
  evidenceIds: string[]; observation: string; why: string; steps: string[];
  example: string; owner: string; effort: string; validation: string;
}
export interface WebsiteAudit {
  version: 1; checkedAt: string; status: 'complete' | 'partial'; summary: string;
  pages: AuditPage[]; discovered: string[]; resources: Array<{ id: string; url: string; status: number | null; readable: boolean; excerpt: string }>;
  strengths: Array<{ detail: string; evidenceIds: string[] }>;
  actions: AuditAction[]; limitations: string[];
}

export interface Report {
  version: 1; domain: string; url: string; generatedAt: string;
  profile: BusinessProfile; overall: number | null; verdict: string;
  signals: Omit<SiteSignals, 'text'>;
  assistants: AssistantResult[]; recommendations: Recommendation[]; method: string;
  audit?: WebsiteAudit;
}

/** What a visitor sees before giving an email: numbers and counts, none of the underlying answers. */
export interface ReportPreview {
  investigation?: { read: number; sampled: number; status: 'complete' | 'partial' };
  version: 1; domain: string; generatedAt: string; overall: number | null; verdict: string;
  business: { name: string; category: string };
  signalsScore: number | null;
  assistants: Array<Pick<AssistantResult, 'id' | 'label' | 'scores' | 'searched'> & { failed: boolean; mentions?: number; discoveryAnswers?: number; expectedDiscovery?: number }>;
  locked: { issues: number; competitors: number; recommendations: number; failedChecks: number; answers: number };
  method: string;
}

export type ProgressStep = 'site' | 'profile' | 'assistants' | 'scoring';
