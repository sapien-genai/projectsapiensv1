import { useState } from 'react';
import { Lock, Mail, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analytics } from '../utils/analytics';

interface AuthPageProps {
  onSuccess?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
}

export default function AuthPage({ onSuccess, onTermsClick, onPrivacyClick }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
          analytics.trackError('Login failed', 'AUTH_ERROR', { error: signInError.message });
        } else {
          analytics.trackUserLogin('email');
          onSuccess?.();
        }
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password, username);
        if (signUpError) {
          setError(signUpError.message);
          analytics.trackError('Signup failed', 'AUTH_ERROR', { error: signUpError.message });
        } else {
          analytics.trackUserSignup('email');
          onSuccess?.();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      analytics.trackError('Auth error', 'AUTH_ERROR', { error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold hover:text-[#FF6A00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          BACK TO HOME
        </a>

        <div className="bg-white border border-black p-8 shadow-[8px_8px_0px_#000000]">
          <h1 className="font-extrabold text-4xl uppercase tracking-tighter mb-2">
            {isLogin ? 'WELCOME BACK' : 'JOIN SAPIENS'}
          </h1>
          <p className="text-sm mb-8 leading-relaxed">
            {isLogin
              ? 'Continue your journey toward AI mastery.'
              : 'Start your transformation from AI User to AI Architect.'}
          </p>

          {error && (
            <div className="bg-[#FF6A00] border border-black p-4 mb-6 shadow-[2px_2px_0px_#000000]">
              <p className="text-sm font-semibold text-black">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block font-extrabold text-sm uppercase tracking-tight mb-2">
                  USERNAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-black pl-12 pr-4 py-3 focus:outline-none focus:border-[#0A74FF] transition-colors"
                    placeholder="sapiens_user"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block font-extrabold text-sm uppercase tracking-tight mb-2">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-black pl-12 pr-4 py-3 focus:outline-none focus:border-[#0A74FF] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block font-extrabold text-sm uppercase tracking-tight mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-black pl-12 pr-12 py-3 focus:outline-none focus:border-[#0A74FF] transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-[#FF6A00] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-[#888888] text-center leading-relaxed">
              By continuing, you agree to our{' '}
              {onTermsClick && (
                <button
                  onClick={onTermsClick}
                  className="text-[#FF6A00] font-semibold hover:underline"
                >
                  Terms of Service
                </button>
              )}
              {' '}and{' '}
              {onPrivacyClick && (
                <button
                  onClick={onPrivacyClick}
                  className="text-[#FF6A00] font-semibold hover:underline"
                >
                  Privacy Policy
                </button>
              )}.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6A00] text-black border border-black px-8 py-4 font-extrabold text-base uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'PROCESSING...' : isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-black">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-semibold hover:text-[#FF6A00] transition-colors"
            >
              {isLogin ? "Don't have an account? SIGN UP" : 'Already have an account? LOG IN'}
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white border border-black p-6 shadow-[3px_3px_0px_#000000]">
          <h3 className="font-extrabold text-sm uppercase tracking-tight mb-3">
            WHAT YOU'LL GET:
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#FF6A00] font-extrabold">&gt;</span>
              <span>Access to all 5 learning paths</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6A00] font-extrabold">&gt;</span>
              <span>Interactive lab environments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6A00] font-extrabold">&gt;</span>
              <span>AI Fluency progression tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6A00] font-extrabold">&gt;</span>
              <span>Community challenges and badges</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
