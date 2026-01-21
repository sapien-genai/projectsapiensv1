/*
  # Create Billing and AI Usage Tracking System

  1. New Tables
    - `billing_profiles`
      - `user_id` (uuid, primary key, references auth.users)
      - `plan` (text, default 'free', check in ('free','pro'))
      - `plan_override` (text, nullable, admin override for plan)
      - `stripe_customer_id` (text, nullable)
      - `subscription_status` (text, nullable)
      - `current_period_end` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ai_usage_daily`
      - `user_id` (uuid, references auth.users)
      - `day` (date, UTC date)
      - `count` (int, default 0)
      - `last_request_at` (timestamptz)
      - Primary key: (user_id, day)

  2. Security
    - Enable RLS on both tables
    - `billing_profiles`: Users can SELECT their own, server can manage
    - `ai_usage_daily`: Users can SELECT their own, server-only writes
    - Admin override field can only be set by service role

  3. Business Rules
    - Free plan: 15 AI interactions per day
    - Pro plan: 120 AI interactions per day
    - Limits reset daily at UTC midnight
    - Edge function is source of truth for enforcement
*/

-- Create billing_profiles table
CREATE TABLE IF NOT EXISTS billing_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_override text CHECK (plan_override IN ('free', 'pro')),
  stripe_customer_id text,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_usage_daily table
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL,
  count int DEFAULT 0 NOT NULL,
  last_request_at timestamptz,
  PRIMARY KEY (user_id, day)
);

-- Enable RLS
ALTER TABLE billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_profiles

-- Users can view their own billing profile
CREATE POLICY "Users can view own billing profile"
  ON billing_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own billing profile (for auto-provision)
CREATE POLICY "Users can insert own billing profile"
  ON billing_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND plan = 'free' AND plan_override IS NULL);

-- Service role can manage all billing profiles
CREATE POLICY "Service role can manage billing profiles"
  ON billing_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for ai_usage_daily

-- Users can view their own usage
CREATE POLICY "Users can view own AI usage"
  ON ai_usage_daily
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all usage records
CREATE POLICY "Service role can manage AI usage"
  ON ai_usage_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_profiles_plan ON billing_profiles(plan);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_stripe_customer ON billing_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_user_day ON ai_usage_daily(user_id, day);
CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_day ON ai_usage_daily(day);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_billing_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS billing_profiles_updated_at ON billing_profiles;
CREATE TRIGGER billing_profiles_updated_at
  BEFORE UPDATE ON billing_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_profiles_updated_at();
