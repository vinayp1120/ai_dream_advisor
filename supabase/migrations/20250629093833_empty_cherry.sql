/*
  # Create leaderboard_entries table

  1. New Tables
    - `leaderboard_entries`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to therapy_sessions)
      - `user_id` (uuid, foreign key to profiles)
      - `username` (text, not null)
      - `idea_title` (text, not null)
      - `score` (numeric, not null)
      - `therapist_name` (text, not null)
      - `nft_minted` (boolean, default false)
      - `is_public` (boolean, default true)
      - `created_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `leaderboard_entries` table
    - Add policy for anyone to read public leaderboard entries
    - Add policy for authenticated users to insert their own entries
    - Add policy for authenticated users to update their own entries

  3. Indexes
    - Index on score (descending) for leaderboard ordering
    - Index on created_at (descending) for chronological ordering
    - Index on user_id for user-specific queries
*/

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

-- Add foreign key constraints
ALTER TABLE public.leaderboard_entries 
ADD CONSTRAINT leaderboard_entries_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES public.therapy_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.leaderboard_entries 
ADD CONSTRAINT leaderboard_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_score 
ON public.leaderboard_entries USING btree (score DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at 
ON public.leaderboard_entries USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id 
ON public.leaderboard_entries USING btree (user_id);

-- Enable Row Level Security
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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