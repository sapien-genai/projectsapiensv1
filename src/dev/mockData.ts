import type { User } from '@supabase/supabase-js';

export const MOCK_USER = {
  id: 'dev-preview-user-00000000',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'preview@dev.local',
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { username: 'PreviewUser', full_name: 'Preview User' },
  identities: [],
  factors: [],
} as unknown as User;

export const MOCK_USAGE_STATUS = {
  plan: 'pro' as const,
  limit: 120,
  used: 37,
  remaining: 83,
  resets_at: new Date(Date.now() + 86_400_000).toISOString(),
};
