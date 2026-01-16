/*
  # Create Support Tickets System

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `subject` (text, ticket subject)
      - `category` (text, ticket category: technical, billing, feature_request, general)
      - `priority` (text, priority level: low, medium, high)
      - `description` (text, detailed description)
      - `status` (text, ticket status: open, in_progress, resolved, closed)
      - `user_email` (text, user's email for reference)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `resolved_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `support_tickets` table
    - Add policy for authenticated users to create tickets
    - Add policy for users to read their own tickets
    - Add policy for users to update their own open tickets
*/

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  category text NOT NULL CHECK (category IN ('technical', 'billing', 'feature_request', 'general')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own support tickets
CREATE POLICY "Users can create own support tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own support tickets
CREATE POLICY "Users can view own support tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own open tickets
CREATE POLICY "Users can update own open tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'open')
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
