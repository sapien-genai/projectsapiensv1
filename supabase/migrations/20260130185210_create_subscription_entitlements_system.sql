/*
  # Subscription & Entitlements System

  1. New Tables
    - `profiles`
      - Stores Stripe customer ID and basic user profile data
      - Links to auth.users
    - `subscriptions`
      - Tracks active Stripe subscription details
      - Status, price, billing period
    - `entitlements`
      - User's current plan and feature access
      - Token allowance and balance
    - `token_ledger`
      - Complete history of token grants, spends, purchases

  2. Triggers
    - Auto-create profile and entitlements on user signup
    - Grant starter tokens (25,000) to new users

  3. Security
    - Enable RLS on all tables
    - Users can read own data
    - Only service role can write to entitlements/subscriptions/ledger
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create entitlements table
CREATE TABLE IF NOT EXISTS entitlements (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  features jsonb DEFAULT '{"labs":true,"exports":false,"priority_support":false,"network":false}'::jsonb,
  monthly_token_allowance bigint DEFAULT 0,
  token_balance bigint DEFAULT 0,
  token_reset_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements"
  ON entitlements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create token_ledger table
CREATE TABLE IF NOT EXISTS token_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('grant', 'spend', 'purchase', 'refund', 'adjustment')),
  amount bigint NOT NULL,
  source text NOT NULL,
  ref_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_ledger_user_id ON token_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_token_ledger_created_at ON token_ledger(created_at DESC);

ALTER TABLE token_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own token history"
  ON token_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to initialize new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  -- Create entitlements with starter tokens
  INSERT INTO public.entitlements (
    user_id,
    plan,
    features,
    monthly_token_allowance,
    token_balance
  ) VALUES (
    NEW.id,
    'free',
    '{"labs":true,"exports":false,"priority_support":false,"network":false}'::jsonb,
    0,
    25000
  );

  -- Log the initial token grant
  INSERT INTO public.token_ledger (
    user_id,
    type,
    amount,
    source,
    metadata
  ) VALUES (
    NEW.id,
    'grant',
    25000,
    'signup_bonus',
    '{"description":"Welcome bonus for new users"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migrate existing data to new schema
DO $$
BEGIN
  -- Migrate all existing auth.users to profiles
  INSERT INTO profiles (id, created_at)
  SELECT
    id,
    created_at
  FROM auth.users
  ON CONFLICT (id) DO NOTHING;

  -- Check if billing_profiles table exists and migrate
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'billing_profiles') THEN
    -- Update profiles with stripe_customer_id
    UPDATE profiles p
    SET stripe_customer_id = bp.stripe_customer_id
    FROM billing_profiles bp
    WHERE p.id = bp.user_id AND bp.stripe_customer_id IS NOT NULL;

    -- Create entitlements for existing billing_profiles users
    INSERT INTO entitlements (
      user_id,
      plan,
      features,
      monthly_token_allowance,
      token_balance
    )
    SELECT
      bp.user_id,
      CASE
        WHEN bp.plan_override = 'pro' THEN 'pro'
        WHEN bp.plan = 'pro' THEN 'pro'
        ELSE 'free'
      END,
      CASE
        WHEN bp.plan_override = 'pro' OR bp.plan = 'pro' THEN
          '{"labs":true,"exports":true,"priority_support":true,"network":true}'::jsonb
        ELSE
          '{"labs":true,"exports":false,"priority_support":false,"network":false}'::jsonb
      END,
      CASE
        WHEN bp.plan_override = 'pro' OR bp.plan = 'pro' THEN 500000
        ELSE 0
      END,
      CASE
        WHEN bp.plan_override = 'pro' OR bp.plan = 'pro' THEN 500000
        ELSE 25000
      END
    FROM billing_profiles bp
    WHERE bp.user_id IN (SELECT id FROM profiles)
    ON CONFLICT (user_id) DO NOTHING;

    -- Log migration grants for pro users
    INSERT INTO token_ledger (user_id, type, amount, source, metadata)
    SELECT
      user_id,
      'grant',
      500000,
      'migration',
      '{"description":"Initial token grant during migration to new system"}'::jsonb
    FROM billing_profiles
    WHERE (plan = 'pro' OR plan_override = 'pro')
      AND user_id IN (SELECT id FROM profiles);
  END IF;

  -- Create entitlements for users who don't have them yet
  INSERT INTO entitlements (user_id, plan, token_balance)
  SELECT
    p.id,
    'free',
    25000
  FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM entitlements e WHERE e.user_id = p.id
  );

  -- Log starter grants for users who don't have any ledger entries
  INSERT INTO token_ledger (user_id, type, amount, source, metadata)
  SELECT
    p.id,
    'grant',
    25000,
    'migration',
    '{"description":"Starter tokens during migration"}'::jsonb
  FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM token_ledger tl WHERE tl.user_id = p.id
  );
END $$;

-- Create helper function to get user entitlements
CREATE OR REPLACE FUNCTION public.get_user_entitlements(p_user_id uuid)
RETURNS TABLE(
  plan text,
  features jsonb,
  monthly_token_allowance bigint,
  token_balance bigint,
  token_reset_at timestamptz,
  subscription_status text,
  current_period_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.plan,
    e.features,
    e.monthly_token_allowance,
    e.token_balance,
    e.token_reset_at,
    s.status as subscription_status,
    s.current_period_end
  FROM entitlements e
  LEFT JOIN subscriptions s ON s.user_id = e.user_id
  WHERE e.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON entitlements TO authenticated;
GRANT SELECT ON token_ledger TO authenticated;