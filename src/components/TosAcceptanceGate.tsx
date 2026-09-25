import { useState } from 'react';
import { FileText, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';

interface TosAcceptanceGateProps {
  onAccept: () => Promise<{ error: string | null }>;
}

/**
 * Full-screen gate shown to signed-in users who have not yet accepted the
 * current Terms of Service version. Blocks the app until they accept, or
 * signs them out if they decline.
 */
export default function TosAcceptanceGate({ onAccept }: TosAcceptanceGateProps) {
  const { signOut } = useAuth();
  const [showDoc, setShowDoc] = useState<'terms' | 'privacy' | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (showDoc === 'terms') {
    return <TermsPage onBack={() => setShowDoc(null)} />;
  }

  if (showDoc === 'privacy') {
    return <PrivacyPage onBack={() => setShowDoc(null)} />;
  }

  const handleAccept = async () => {
    setError('');
    setSubmitting(true);
    const { error: acceptError } = await onAccept();
    if (acceptError) {
      setError(acceptError);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-ink p-8 shadow-brutal-xl">
          <div className="w-14 h-14 bg-accent border-2 border-ink flex items-center justify-center mb-6">
            <FileText className="w-7 h-7 text-ink" strokeWidth={2} />
          </div>

          <h1 className="font-extrabold text-3xl uppercase tracking-tighter mb-2">
            TERMS OF SERVICE
          </h1>
          <p className="text-sm mb-8 leading-relaxed">
            Before you continue, please review and accept our Terms of Service
            and Privacy Policy.
          </p>

          {error && (
            <div className="bg-accent border border-ink p-4 mb-6 shadow-brutal-sm">
              <p className="text-sm font-semibold text-ink">{error}</p>
            </div>
          )}

          <label className="flex items-start gap-3 mb-8 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 border-2 border-ink cursor-pointer"
            />
            <span className="text-sm leading-relaxed">
              I have read and agree to the{' '}
              <button
                type="button"
                onClick={() => setShowDoc('terms')}
                className="text-accent font-semibold hover:underline"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setShowDoc('privacy')}
                className="text-accent font-semibold hover:underline"
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>

          <button
            type="button"
            onClick={handleAccept}
            disabled={!agreed || submitting}
            className="w-full bg-accent text-ink border border-ink px-8 py-4 font-extrabold text-base uppercase tracking-tight shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'SAVING...' : 'ACCEPT & CONTINUE'}
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-white text-ink border border-ink px-8 py-3 font-extrabold text-sm uppercase tracking-tight shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            DECLINE & SIGN OUT
          </button>
        </div>
      </div>
    </div>
  );
}
