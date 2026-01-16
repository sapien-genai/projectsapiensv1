/*
  # Create Admin Portal System

  ## Overview
  This migration creates a comprehensive admin portal system for Project Sapiens administrators
  to track users, performance metrics, support tickets, and customer service.

  ## New Tables
  
  ### 1. admin_roles
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - Admin user reference
  - `role` (text) - Admin role: 'super_admin', 'admin', 'support', 'analyst'
  - `permissions` (jsonb) - Granular permissions object
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. support_tickets
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - User who created ticket
  - `assigned_to` (uuid, references auth.users) - Admin assigned to ticket
  - `title` (text) - Ticket title
  - `description` (text) - Detailed description
  - `status` (text) - 'open', 'in_progress', 'resolved', 'closed'
  - `priority` (text) - 'low', 'medium', 'high', 'urgent'
  - `category` (text) - 'technical', 'billing', 'feature_request', 'bug', 'other'
  - `metadata` (jsonb) - Additional ticket data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `resolved_at` (timestamptz)

  ### 3. ticket_messages
  - `id` (uuid, primary key)
  - `ticket_id` (uuid, references support_tickets)
  - `user_id` (uuid, references auth.users)
  - `message` (text)
  - `is_internal` (boolean) - Internal admin notes
  - `attachments` (jsonb) - File attachments metadata
  - `created_at` (timestamptz)

  ### 4. user_analytics
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `event_type` (text) - 'login', 'logout', 'lesson_complete', 'lab_start', etc.
  - `event_data` (jsonb) - Event details
  - `session_id` (text) - Session identifier
  - `ip_address` (text) - User IP
  - `user_agent` (text) - Browser/device info
  - `created_at` (timestamptz)

  ### 5. platform_metrics
  - `id` (uuid, primary key)
  - `metric_date` (date) - Date of metric
  - `metric_type` (text) - Type of metric
  - `metric_value` (numeric) - Numeric value
  - `metadata` (jsonb) - Additional metric data
  - `created_at` (timestamptz)

  ### 6. system_audit_log
  - `id` (uuid, primary key)
  - `admin_user_id` (uuid, references auth.users)
  - `action` (text) - Action performed
  - `target_type` (text) - Type of resource affected
  - `target_id` (uuid) - ID of resource affected
  - `changes` (jsonb) - What changed
  - `ip_address` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Admin-only access policies
  - Audit logging for all admin actions
  - User analytics respects privacy settings

  ## Indexes
  - Foreign key indexes for performance
  - Status and priority indexes for tickets
  - Event type and date indexes for analytics
  - Metric date and type indexes
*/

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'support', 'analyst')),
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text NOT NULL CHECK (category IN ('technical', 'billing', 'feature_request', 'bug', 'other')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  session_id text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create platform_metrics table
CREATE TABLE IF NOT EXISTS platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(metric_date, metric_type)
);

-- Create system_audit_log table
CREATE TABLE IF NOT EXISTS system_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_date_type ON platform_metrics(metric_date DESC, metric_type);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_admin_user ON system_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_created_at ON system_audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_log ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = user_uuid
    AND role IN ('super_admin', 'admin', 'support', 'analyst')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION has_admin_role(user_uuid uuid, required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = user_uuid
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for admin_roles
CREATE POLICY "Admins can view all admin roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (is_admin((select auth.uid())));

CREATE POLICY "Super admins can manage admin roles"
  ON admin_roles FOR ALL
  TO authenticated
  USING (has_admin_role((select auth.uid()), 'super_admin'))
  WITH CHECK (has_admin_role((select auth.uid()), 'super_admin'));

-- RLS Policies for support_tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_admin((select auth.uid())));

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (is_admin((select auth.uid())))
  WITH CHECK (is_admin((select auth.uid())));

-- RLS Policies for ticket_messages
CREATE POLICY "Users can view ticket messages"
  ON ticket_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND (support_tickets.user_id = (select auth.uid()) OR is_admin((select auth.uid())))
    )
    AND (NOT is_internal OR is_admin((select auth.uid())))
  );

CREATE POLICY "Users can create messages on own tickets"
  ON ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND (support_tickets.user_id = (select auth.uid()) OR is_admin((select auth.uid())))
    )
    AND user_id = (select auth.uid())
  );

CREATE POLICY "Admins can manage all messages"
  ON ticket_messages FOR ALL
  TO authenticated
  USING (is_admin((select auth.uid())))
  WITH CHECK (is_admin((select auth.uid())));

-- RLS Policies for user_analytics
CREATE POLICY "Admins can view analytics"
  ON user_analytics FOR SELECT
  TO authenticated
  USING (is_admin((select auth.uid())));

CREATE POLICY "System can insert analytics"
  ON user_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for platform_metrics
CREATE POLICY "Admins can view metrics"
  ON platform_metrics FOR SELECT
  TO authenticated
  USING (is_admin((select auth.uid())));

CREATE POLICY "Admins can manage metrics"
  ON platform_metrics FOR ALL
  TO authenticated
  USING (is_admin((select auth.uid())))
  WITH CHECK (is_admin((select auth.uid())));

-- RLS Policies for system_audit_log
CREATE POLICY "Admins can view audit log"
  ON system_audit_log FOR SELECT
  TO authenticated
  USING (is_admin((select auth.uid())));

CREATE POLICY "System can insert audit log"
  ON system_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (is_admin((select auth.uid())));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();
