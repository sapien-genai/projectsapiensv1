/*
  # Create Prompt Library Tables

  ## Overview
  A comprehensive prompt library system where users can discover, create, share, rate, and organize prompts.

  ## New Tables

  1. `prompt_categories`
    - `id` (uuid, primary key)
    - `name` (text) - Category name (e.g., "Writing", "Analysis", "Creative")
    - `slug` (text, unique) - URL-friendly identifier
    - `description` (text)
    - `icon` (text, nullable) - Icon name for UI
    - `created_at` (timestamptz)

  2. `prompts`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users) - Creator
    - `title` (text) - Prompt title
    - `description` (text) - What the prompt does
    - `prompt_text` (text) - The actual prompt content
    - `category_id` (uuid, references prompt_categories)
    - `tags` (text[]) - Searchable tags
    - `use_case` (text) - When to use this prompt
    - `example_output` (text, nullable) - Example of what it produces
    - `is_public` (boolean) - Share with community
    - `is_featured` (boolean) - Moderator featured
    - `likes_count` (integer) - Total likes
    - `usage_count` (integer) - How many times copied/used
    - `avg_rating` (numeric) - Average user rating
    - `rating_count` (integer) - Number of ratings
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. `prompt_likes`
    - `id` (uuid, primary key)
    - `prompt_id` (uuid, references prompts)
    - `user_id` (uuid, references auth.users)
    - `created_at` (timestamptz)

  4. `prompt_ratings`
    - `id` (uuid, primary key)
    - `prompt_id` (uuid, references prompts)
    - `user_id` (uuid, references auth.users)
    - `rating` (integer) - 1-5 stars
    - `review` (text, nullable) - Optional review text
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  5. `prompt_collections`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `name` (text) - Collection name (e.g., "My Favorites", "Work Prompts")
    - `description` (text, nullable)
    - `is_public` (boolean) - Share collection
    - `prompt_count` (integer) - Number of prompts in collection
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  6. `prompt_collection_items`
    - `id` (uuid, primary key)
    - `collection_id` (uuid, references prompt_collections)
    - `prompt_id` (uuid, references prompts)
    - `notes` (text, nullable) - Personal notes about this prompt
    - `added_at` (timestamptz)

  7. `prompt_usage_history`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `prompt_id` (uuid, references prompts)
    - `used_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public prompts visible to all authenticated users
  - Private prompts only visible to creator
  - Users can only edit/delete their own content
  - Collections private by default, can be made public

  ## Indexes
  - Search performance on tags, titles
  - Category lookups
  - User-specific queries
*/

-- Prompt Categories Table
CREATE TABLE IF NOT EXISTS prompt_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON prompt_categories FOR SELECT
  TO authenticated
  USING (true);

-- Prompts Table
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  prompt_text text NOT NULL,
  category_id uuid REFERENCES prompt_categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  use_case text NOT NULL,
  example_output text,
  is_public boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  usage_count integer DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public prompts"
  ON prompts FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create prompts"
  ON prompts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own prompts"
  ON prompts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own prompts"
  ON prompts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Prompt Likes Table
CREATE TABLE IF NOT EXISTS prompt_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_prompt_like UNIQUE (prompt_id, user_id)
);

ALTER TABLE prompt_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view prompt likes"
  ON prompt_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like prompts"
  ON prompt_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike prompts"
  ON prompt_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Prompt Ratings Table
CREATE TABLE IF NOT EXISTS prompt_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_prompt_rating UNIQUE (prompt_id, user_id)
);

ALTER TABLE prompt_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view prompt ratings"
  ON prompt_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can rate prompts"
  ON prompt_ratings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own ratings"
  ON prompt_ratings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own ratings"
  ON prompt_ratings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Prompt Collections Table
CREATE TABLE IF NOT EXISTS prompt_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  prompt_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own and public collections"
  ON prompt_collections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create collections"
  ON prompt_collections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collections"
  ON prompt_collections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own collections"
  ON prompt_collections FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Prompt Collection Items Table
CREATE TABLE IF NOT EXISTS prompt_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES prompt_collections(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  notes text,
  added_at timestamptz DEFAULT now(),
  CONSTRAINT unique_collection_prompt UNIQUE (collection_id, prompt_id)
);

ALTER TABLE prompt_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in their collections"
  ON prompt_collection_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompt_collections
      WHERE prompt_collections.id = prompt_collection_items.collection_id
      AND (prompt_collections.user_id = auth.uid() OR prompt_collections.is_public = true)
    )
  );

CREATE POLICY "Users can add items to their collections"
  ON prompt_collection_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompt_collections
      WHERE prompt_collections.id = collection_id
      AND prompt_collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from their collections"
  ON prompt_collection_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompt_collections
      WHERE prompt_collections.id = collection_id
      AND prompt_collections.user_id = auth.uid()
    )
  );

-- Prompt Usage History Table
CREATE TABLE IF NOT EXISTS prompt_usage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  used_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_usage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage history"
  ON prompt_usage_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can record their usage"
  ON prompt_usage_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_likes_count ON prompts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_avg_rating ON prompts(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompt_likes_prompt_id ON prompt_likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_prompt_id ON prompt_ratings(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_collections_user_id ON prompt_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_collection_items_collection_id ON prompt_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_history_user_id ON prompt_usage_history(user_id);

-- Insert default categories
INSERT INTO prompt_categories (name, slug, description, icon) VALUES
  ('Writing', 'writing', 'Content creation, editing, and writing assistance', 'PenTool'),
  ('Analysis', 'analysis', 'Data analysis, research, and insights', 'BarChart3'),
  ('Creative', 'creative', 'Brainstorming, ideation, and creative projects', 'Sparkles'),
  ('Coding', 'coding', 'Programming, debugging, and technical tasks', 'Code'),
  ('Strategy', 'strategy', 'Planning, decision-making, and problem-solving', 'Target'),
  ('Learning', 'learning', 'Education, explanations, and skill development', 'GraduationCap')
ON CONFLICT (slug) DO NOTHING;
