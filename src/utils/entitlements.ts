import { supabase } from '../lib/supabase';

export interface Entitlement {
  plan: 'free' | 'pro';
  features: {
    labs: boolean;
    exports: boolean;
    priority_support: boolean;
    network: boolean;
  };
  monthly_token_allowance: number;
  token_balance: number;
  token_reset_at: string | null;
}

export interface Subscription {
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface FullEntitlement extends Entitlement {
  subscription: Subscription | null;
}

export async function getEntitlements(userId: string): Promise<FullEntitlement | null> {
  try {
    const { data: entitlement, error: entitlementError } = await supabase
      .from('entitlements')
      .select('plan, features, monthly_token_allowance, token_balance, token_reset_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (entitlementError) {
      console.error('Failed to fetch entitlements:', entitlementError);
      return null;
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .maybeSingle();

    if (!entitlement) {
      return null;
    }

    return {
      ...entitlement,
      subscription: subscription || null,
    };
  } catch (error) {
    console.error('Error fetching entitlements:', error);
    return null;
  }
}

export async function getTokenHistory(userId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('token_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch token history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching token history:', error);
    return [];
  }
}

export function hasFeature(entitlement: FullEntitlement | null, feature: keyof Entitlement['features']): boolean {
  if (!entitlement) {
    return false;
  }
  return entitlement.features[feature] === true;
}

export function isPro(entitlement: FullEntitlement | null): boolean {
  return entitlement?.plan === 'pro';
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}
