import { ReactNode } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useEntitlements } from '../hooks/useEntitlements';
import { useBilling } from '../contexts/BillingContext';

interface ProGuardProps {
  children: ReactNode;
  feature?: 'labs' | 'exports' | 'priority_support' | 'network';
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export default function ProGuard({
  children,
  feature,
  fallback,
  showUpgrade = true,
}: ProGuardProps) {
  const { entitlements, loading } = useEntitlements();
  const { startCheckout } = useBilling();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPro = entitlements?.plan === 'pro';
  const hasAccess = feature ? entitlements?.features[feature] === true : isPro;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_#000000] text-center">
      <div className="bg-[#FF6A00] border-2 border-black w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8" strokeWidth={2} />
      </div>

      <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
        Pro Feature
      </h3>

      <p className="text-sm mb-6 max-w-md mx-auto">
        {feature === 'exports'
          ? 'Export your learning data and projects with a Pro subscription.'
          : feature === 'priority_support'
          ? 'Get priority support with faster response times as a Pro member.'
          : feature === 'network'
          ? 'Join the full intentional network and connect with other learners as a Pro member.'
          : 'Unlock this feature and more with Project Sapiens Pro.'}
      </p>

      <button
        onClick={startCheckout}
        className="bg-[#FF6A00] border-2 border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" strokeWidth={2.5} />
        UPGRADE TO PRO
      </button>
    </div>
  );
}
