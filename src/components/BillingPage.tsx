import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, TrendingUp, RefreshCw, Zap, Clock, Coins, AlertCircle } from 'lucide-react';
import { useBilling } from '../contexts/BillingContext';
import UpgradeModal from './UpgradeModal';
import { formatTokens } from '../utils/entitlements';

interface BillingPageProps {
  onBack: () => void;
}

export default function BillingPage({ onBack }: BillingPageProps) {
  const {
    usageStatus,
    loading,
    error,
    refreshUsageStatus,
    isAtLimit,
    percentUsed,
    checkoutLoading,
    checkoutError,
    startCheckout,
    clearCheckoutError,
    portalLoading,
    portalError,
    startPortal,
    clearPortalError,
  } = useBilling();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.title = 'Billing & Usage – Project Sapiens';
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUsageStatus();
    setRefreshing(false);
  };

  const formatResetTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const hoursUntil = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutesUntil = Math.floor(((date.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursUntil < 1) {
      return `in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`;
    }
    return `in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold hover:text-[#FF6A00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          BACK TO DASHBOARD
        </button>

        <div className="mb-8">
          <h1 className="font-extrabold text-4xl uppercase tracking-tighter mb-2">
            BILLING & USAGE
          </h1>
          <p className="text-sm leading-relaxed">
            Manage your plan and track your AI practice sessions.
          </p>
        </div>

        {(error || portalError) && (
          <div className="bg-[#FF6A00] border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_#000000]">
            <div className="space-y-2 text-sm font-semibold text-black">
              {error && <p>{error}</p>}
              {portalError && (
                <div className="flex items-center justify-between gap-4">
                  <p>{portalError}</p>
                  <button
                    onClick={clearPortalError}
                    className="text-xs font-bold uppercase hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && !usageStatus ? (
          <div className="bg-white border-2 border-black p-12 text-center shadow-[4px_4px_0px_#000000]">
            <div className="inline-block w-8 h-8 border-4 border-black border-t-[#FF6A00] animate-spin mb-4"></div>
            <p className="font-semibold">Loading billing information...</p>
          </div>
        ) : usageStatus ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_#000000]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" strokeWidth={2} />
                    <h2 className="font-extrabold text-lg uppercase">CURRENT PLAN</h2>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="hover:text-[#FF6A00] transition-colors disabled:opacity-50"
                    aria-label="Refresh usage"
                  >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">PLAN TYPE:</p>
                    <div className="flex items-center gap-2">
                      {usageStatus.plan === 'pro' ? (
                        <>
                          <span className="bg-[#FF6A00] text-black border-2 border-black px-4 py-2 font-extrabold text-lg uppercase">
                            PRO
                          </span>
                          <TrendingUp className="w-5 h-5" strokeWidth={2} />
                        </>
                      ) : (
                        <span className="bg-white border-2 border-black px-4 py-2 font-extrabold text-lg uppercase">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                  {usageStatus.plan === 'free' && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full bg-[#FF6A00] text-black border-2 border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      UPGRADE TO PRO
                    </button>
                  )}
                  <button
                    onClick={startPortal}
                    disabled={portalLoading}
                    className="w-full bg-white text-black border-2 border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {portalLoading ? 'OPENING STRIPE...' : 'REVIEW BILLING IN STRIPE'}
                  </button>
                  <p className="text-xs text-[#888888]">
                    Update payment details, view invoices, or manage your subscription securely in Stripe.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_#000000]">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5" strokeWidth={2} />
                  <h2 className="font-extrabold text-lg uppercase">TODAY'S USAGE</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">AI PRACTICE SESSIONS:</p>
                    <p className="text-4xl font-extrabold">
                      {usageStatus.used} <span className="text-2xl text-[#888888]">/ {usageStatus.limit}</span>
                    </p>
                  </div>
                  <div>
                    <div className="bg-[#F4F4F4] border-2 border-black h-6 overflow-hidden">
                      <div
                        className={`h-full ${
                          isAtLimit
                            ? 'bg-[#FF6A00]'
                            : percentUsed > 80
                            ? 'bg-[#FFD700]'
                            : 'bg-black'
                        } transition-all duration-300`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-semibold mt-2">
                      {usageStatus.remaining} remaining
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_#000000]">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="w-5 h-5" strokeWidth={2} />
                  <h2 className="font-extrabold text-lg uppercase">TOKEN BALANCE</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">CURRENT BALANCE:</p>
                    <p className="text-4xl font-extrabold">
                      {formatTokens(usageStatus.token_balance)} <span className="text-lg text-[#888888]">tokens</span>
                    </p>
                  </div>
                  {usageStatus.plan === 'pro' && usageStatus.monthly_token_allowance > 0 && (
                    <div className="bg-[#F4F4F4] border-2 border-black p-4">
                      <p className="text-xs font-semibold mb-1">MONTHLY ALLOWANCE:</p>
                      <p className="text-xl font-extrabold">
                        {formatTokens(usageStatus.monthly_token_allowance)}
                      </p>
                      {usageStatus.token_reset_at && (
                        <p className="text-xs text-[#888888] mt-2">
                          Next grant: {new Date(usageStatus.token_reset_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-[#888888]">
                    Tokens are used for advanced AI features, exports, and special operations.
                  </p>
                </div>
              </div>

              {usageStatus.subscription_status && (
                <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_#000000]">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5" strokeWidth={2} />
                    <h2 className="font-extrabold text-lg uppercase">SUBSCRIPTION</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">STATUS:</p>
                      <span className={`inline-block px-3 py-1 text-xs font-extrabold uppercase border-2 border-black ${
                        usageStatus.subscription_status === 'active' || usageStatus.subscription_status === 'trialing'
                          ? 'bg-green-400'
                          : usageStatus.subscription_status === 'past_due'
                          ? 'bg-yellow-400'
                          : 'bg-[#FF6A00]'
                      }`}>
                        {usageStatus.subscription_status}
                      </span>
                    </div>
                    {usageStatus.current_period_end && (
                      <div>
                        <p className="text-sm font-semibold mb-2">
                          {usageStatus.cancel_at_period_end ? 'ENDS ON:' : 'RENEWS ON:'}
                        </p>
                        <p className="font-extrabold">
                          {new Date(usageStatus.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {usageStatus.cancel_at_period_end && (
                      <div className="bg-[#FF6A00] border-2 border-black p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-xs font-semibold">
                          Your subscription will not renew. Access continues until the end date.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5" strokeWidth={2} />
                <h2 className="font-extrabold text-lg uppercase">RESET INFORMATION</h2>
              </div>
              <p className="text-sm leading-relaxed">
                Your daily AI practice sessions reset <strong>{formatResetTime(usageStatus.resets_at)}</strong> at midnight UTC.
              </p>
              <p className="text-xs text-[#888888] mt-2">
                Resets at: {new Date(usageStatus.resets_at).toLocaleString()}
              </p>
            </div>

            {isAtLimit && (
              <div className="bg-[#FF6A00] border-2 border-black p-6 shadow-[4px_4px_0px_#000000]">
                <h3 className="font-extrabold text-xl uppercase mb-3">DAILY LIMIT REACHED</h3>
                <p className="text-sm leading-relaxed mb-4">
                  You've used all {usageStatus.limit} of today's AI practice sessions. Your limit will reset {formatResetTime(usageStatus.resets_at)}.
                </p>
                {usageStatus.plan === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-black text-white border-2 border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    UPGRADE FOR MORE SESSIONS
                  </button>
                )}
              </div>
            )}

            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_#000000]">
              <h2 className="font-extrabold text-lg uppercase mb-4">WHAT COUNTS AS A SESSION?</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  One AI practice session is counted each time you successfully interact with the AI in any of our lab environments.
                </p>
                <p>
                  This includes:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6A00] font-extrabold">&gt;</span>
                    <span>Writing lab conversations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6A00] font-extrabold">&gt;</span>
                    <span>Analysis lab queries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6A00] font-extrabold">&gt;</span>
                    <span>Creative brainstorming sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6A00] font-extrabold">&gt;</span>
                    <span>Strategy and code lab interactions</span>
                  </li>
                </ul>
                <p className="text-xs text-[#888888] mt-4">
                  Failed requests or system errors do not count toward your daily limit.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsed={usageStatus?.used}
        currentLimit={usageStatus?.limit}
        onCheckout={startCheckout}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        onClearError={clearCheckoutError}
      />
    </div>
  );
}
