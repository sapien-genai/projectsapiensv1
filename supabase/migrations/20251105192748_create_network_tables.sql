/*
  # Create Network Tables for Peer Collaboration and Mentorship

  ## New Tables
  
  1. `network_connections`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users) - Person sending/initiating connection
    - `connected_user_id` (uuid, references auth.users) - Person being connected to
    - `connection_type` (text) - 'peer', 'mentor', 'mentee'
    - `status` (text) - 'pending', 'accepted', 'declined'
    - `message` (text, nullable) - Optional connection message
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  2. `project_shares`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `title` (text)
    - `description` (text)
    - `project_type` (text) - 'lab_experiment', 'capstone', 'showcase'
    - `content` (text) - JSON string or markdown
    - `path_id` (text, nullable) - Which learning path this relates to
    - `tags` (text[]) - Searchable tags
    - `is_featured` (boolean) - Moderator featured projects
    - `likes_count` (integer)
    - `comments_count` (integer)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  3. `project_likes`
    - `id` (uuid, primary key)
    - `project_id` (uuid, references project_shares)
    - `user_id` (uuid, references auth.users)
    - `created_at` (timestamptz)
  
  4. `project_comments`
    - `id` (uuid, primary key)
    - `project_id` (uuid, references project_shares)
    - `user_id` (uuid, references auth.users)
    - `parent_comment_id` (uuid, nullable, references project_comments) - For threaded replies
    - `content` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  5. `mentorship_requests`
    - `id` (uuid, primary key)
    - `mentee_id` (uuid, references auth.users)
    - `mentor_id` (uuid, references auth.users)
    - `topic` (text) - What they need help with
    - `message` (text)
    - `status` (text) - 'pending', 'accepted', 'declined', 'completed'
    - `session_notes` (text, nullable) - Notes after mentorship session
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `completed_at` (timestamptz, nullable)

  ## Security
  - Enable RLS on all tables
  - Users can read public data
  - Users can manage their own connections/projects
  - Proper policies for privacy and collaboration
*/

-- Network Connections Table
CREATE TABLE IF NOT EXISTS network_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_type text NOT NULL CHECK (connection_type IN ('peer', 'mentor', 'mentee')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_connection CHECK (user_id != connected_user_id),
  CONSTRAINT unique_connection UNIQUE (user_id, connected_user_id)
);

ALTER TABLE network_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections"
  ON network_connections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid());

CREATE POLICY "Users can create connection requests"
  ON network_connections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update connections they're part of"
  ON network_connections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR connected_user_id = auth.uid());

CREATE POLICY "Users can delete their own connection requests"
  ON network_connections FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Project Shares Table
CREATE TABLE IF NOT EXISTS project_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  project_type text NOT NULL CHECK (project_type IN ('lab_experiment', 'capstone', 'showcase')),
  content text NOT NULL,
  path_id text,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public projects"
  ON project_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own projects"
  ON project_shares FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON project_shares FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON project_shares FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Project Likes Table
CREATE TABLE IF NOT EXISTS project_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES project_shares(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_like UNIQUE (project_id, user_id)
);

ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON project_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like projects"
  ON project_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike projects"
  ON project_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Project Comments Table
CREATE TABLE IF NOT EXISTS project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES project_shares(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES project_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON project_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON project_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON project_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON project_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Mentorship Requests Table
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  session_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT no_self_mentor CHECK (mentee_id != mentor_id)
);

ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their mentorship requests"
  ON mentorship_requests FOR SELECT
  TO authenticated
  USING (mentee_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Users can create mentorship requests"
  ON mentorship_requests FOR INSERT
  TO authenticated
  WITH CHECK (mentee_id = auth.uid());

CREATE POLICY "Users can update their mentorship requests"
  ON mentorship_requests FOR UPDATE
  TO authenticated
  USING (mentee_id = auth.uid() OR mentor_id = auth.uid())
  WITH CHECK (mentee_id = auth.uid() OR mentor_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_network_connections_user_id ON network_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_network_connections_connected_user_id ON network_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_network_connections_status ON network_connections(status);
CREATE INDEX IF NOT EXISTS idx_project_shares_user_id ON project_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_path_id ON project_shares(path_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_created_at ON project_shares(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee_id ON mentorship_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_id ON mentorship_requests(mentor_id);
