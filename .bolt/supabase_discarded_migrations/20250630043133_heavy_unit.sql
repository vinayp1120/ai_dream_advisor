/*
  # Create leaderboard entries table

  1. New Tables
    - `leaderboard_entries`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to therapy_sessions)
      - `user_id` (uuid, foreign key to profiles)
      - `username` (text)
      - `idea_title` (text)
      - `score` (numeric)
      - `therapist_name` (text)
      - `nft_minted` (boolean, default false)
      - `is_public` (boolean, default true)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `leaderboard_entries` table
    - Add policy for public read access to public entries
    - Add policy for users to insert their own entries
    - Add policy for users to update their own entries

  3. Performance
    - Add indexes for score, created_at, and user_id columns
*/

-- Create the leaderboard_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  username text NOT NULL,
  idea_title text NOT NULL,
  score numeric NOT NULL,
  therapist_name text NOT NULL,
  nft_minted boolean DEFAULT false,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leaderboard_entries_session_id_fkey' 
    AND table_name = 'leaderboard_entries'
  ) THEN
    ALTER TABLE public.leaderboard_entries 
    ADD CONSTRAINT leaderboard_entries_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES public.therapy_sessions(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leaderboard_entries_user_id_fkey' 
    AND table_name = 'leaderboard_entries'
  ) THEN
    ALTER TABLE public.leaderboard_entries 
    ADD CONSTRAINT leaderboard_entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score 
ON public.leaderboard_entries USING btree (score DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at 
ON public.leaderboard_entries USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id 
ON public.leaderboard_entries USING btree (user_id);

-- Enable Row Level Security
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read public leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Users can insert own leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Users can update own leaderboard entries" ON public.leaderboard_entries;

CREATE POLICY "Anyone can read public leaderboard entries"
  ON public.leaderboard_entries
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own leaderboard entries"
  ON public.leaderboard_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entries"
  ON public.leaderboard_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);