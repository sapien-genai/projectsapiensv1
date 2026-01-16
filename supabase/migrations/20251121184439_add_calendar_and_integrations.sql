/*
  # Calendar and Integration Features

  This migration adds calendar events and external integration tracking to the Command Center.

  ## 1. New Tables
    
    ### `calendar_events`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `title` (text) - Event title
    - `description` (text) - Event details
    - `event_date` (date) - Date of event
    - `event_time` (time) - Time of event
    - `duration_minutes` (integer) - Event duration
    - `event_type` (text) - meeting, task, personal, etc.
    - `location` (text) - Physical or virtual location
    - `attendees` (text[]) - List of attendees
    - `prep_notes` (jsonb) - AI-generated prep notes
    - `ai_generated_prep` (boolean) - Whether prep was AI-generated
    - `completed` (boolean) - Whether event is complete
    - `external_calendar_id` (text) - ID from external calendar system
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `external_integrations`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `integration_type` (text) - google_calendar, outlook, slack, etc.
    - `is_connected` (boolean) - Connection status
    - `credentials` (jsonb) - Encrypted credentials (if needed)
    - `settings` (jsonb) - Integration settings
    - `last_sync` (timestamptz) - Last sync time
    - `sync_enabled` (boolean) - Whether auto-sync is enabled
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure users can only access their own calendar and integrations

  ## 3. Indexes
    - Add indexes for user_id and date-based queries
    - Add index for external_calendar_id lookups

  ## 4. Notes
    - Calendar events support both internal and external sources
    - Integration credentials should be encrypted at the application level
    - Prep notes use JSONB for flexible AI-generated content
*/

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  event_date date NOT NULL,
  event_time time,
  duration_minutes integer DEFAULT 60,
  event_type text DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'task', 'personal', 'deadline', 'reminder')),
  location text DEFAULT '',
  attendees text[] DEFAULT ARRAY[]::text[],
  prep_notes jsonb DEFAULT '{}'::jsonb,
  ai_generated_prep boolean DEFAULT false,
  completed boolean DEFAULT false,
  external_calendar_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- External Integrations
CREATE TABLE IF NOT EXISTS external_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  integration_type text NOT NULL CHECK (integration_type IN ('google_calendar', 'outlook_calendar', 'apple_calendar', 'gmail', 'slack', 'notion', 'todoist', 'trello')),
  is_connected boolean DEFAULT false,
  credentials jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  last_sync timestamptz,
  sync_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, integration_type)
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_events
CREATE POLICY "Users can view own calendar events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for external_integrations
CREATE POLICY "Users can view own integrations"
  ON external_integrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON external_integrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON external_integrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON external_integrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_external_id ON calendar_events(external_calendar_id) WHERE external_calendar_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_external_integrations_user_type ON external_integrations(user_id, integration_type);