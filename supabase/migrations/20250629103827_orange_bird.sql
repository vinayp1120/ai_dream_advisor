/*
  # Fix RLS Policies for All Tables

  1. Policy Updates
    - Replace incorrect user ID references with auth.uid()
    - Ensure all policies use proper syntax for authenticated users
    - Fix policies for profiles, ideas, therapy_sessions, nft_certificates, and leaderboard_entries tables

  2. Security
    - Maintain proper row-level security for all user data
    - Ensure users can only access their own data
    - Allow public read access for leaderboard entries when is_public = true
*/

-- Drop existing policies to recreate them with correct syntax
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can read own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can insert own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can update own ideas" ON public.ideas;

DROP POLICY IF EXISTS "Users can read own therapy sessions" ON public.therapy_sessions;
DROP POLICY IF EXISTS "Users can insert own therapy sessions" ON public.therapy_sessions;
DROP POLICY IF EXISTS "Users can update own therapy sessions" ON public.therapy_sessions;

DROP POLICY IF EXISTS "Users can read own NFT certificates" ON public.nft_certificates;
DROP POLICY IF EXISTS "Users can insert own NFT certificates" ON public.nft_certificates;
DROP POLICY IF EXISTS "Users can update own NFT certificates" ON public.nft_certificates;

DROP POLICY IF EXISTS "Anyone can read public leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Users can insert own leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Users can update own leaderboard entries" ON public.leaderboard_entries;

-- Create correct RLS policies for profiles table
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create correct RLS policies for ideas table
CREATE POLICY "Users can read own ideas"
  ON public.ideas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas"
  ON public.ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas"
  ON public.ideas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create correct RLS policies for therapy_sessions table
CREATE POLICY "Users can read own therapy sessions"
  ON public.therapy_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own therapy sessions"
  ON public.therapy_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapy sessions"
  ON public.therapy_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create correct RLS policies for nft_certificates table
CREATE POLICY "Users can read own NFT certificates"
  ON public.nft_certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NFT certificates"
  ON public.nft_certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create correct RLS policies for leaderboard_entries table
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