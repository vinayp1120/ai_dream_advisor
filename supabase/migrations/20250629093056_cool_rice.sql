/*
  # DreamAdvisor Database Schema

  1. New Tables
    - `profiles` - User profile information
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `subscription_tier` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ideas` - User submitted startup ideas
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text)
      - `submission_method` (text)
      - `audio_url` (text, optional)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `therapy_sessions` - AI therapy session records
      - `id` (uuid, primary key)
      - `idea_id` (uuid, foreign key to ideas)
      - `user_id` (uuid, foreign key to profiles)
      - `therapist_id` (text)
      - `therapist_name` (text)
      - `script` (text)
      - `video_url` (text, optional)
      - `audio_url` (text, optional)
      - `score` (numeric)
      - `verdict` (text)
      - `insights` (jsonb)
      - `advice` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `nft_certificates` - Minted NFT certificates
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to therapy_sessions)
      - `user_id` (uuid, foreign key to profiles)
      - `token_id` (text)
      - `blockchain_network` (text)
      - `transaction_hash` (text)
      - `certificate_url` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
    
    - `leaderboard_entries` - Public leaderboard entries
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to therapy_sessions)
      - `user_id` (uuid, foreign key to profiles)
      - `username` (text)
      - `idea_title` (text)
      - `score` (numeric)
      - `therapist_name` (text)
      - `nft_minted` (boolean)
      - `is_public` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public leaderboard access
    - Add policies for admin access where needed

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for complex queries

  4. Functions
    - Add trigger functions for updated_at timestamps
    - Add function to automatically create profile on user signup
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  total_sessions integer DEFAULT 0,
  total_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  submission_method text DEFAULT 'text' CHECK (submission_method IN ('text', 'voice')),
  audio_url text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'analyzing', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create therapy_sessions table
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  therapist_id text NOT NULL,
  therapist_name text NOT NULL,
  script text,
  video_url text,
  audio_url text,
  score numeric CHECK (score >= 0 AND score <= 10),
  verdict text,
  insights jsonb DEFAULT '[]'::jsonb,
  advice text,
  status text DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create nft_certificates table
CREATE TABLE IF NOT EXISTS nft_certificates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES therapy_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token_id text UNIQUE NOT NULL,
  blockchain_network text DEFAULT 'algorand',
  transaction_hash text,
  certificate_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES therapy_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  idea_title text NOT NULL,
  score numeric NOT NULL,
  therapist_name text NOT NULL,
  nft_minted boolean DEFAULT false,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ideas policies
CREATE POLICY "Users can read own ideas"
  ON ideas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas"
  ON ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas"
  ON ideas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Therapy sessions policies
CREATE POLICY "Users can read own therapy sessions"
  ON therapy_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own therapy sessions"
  ON therapy_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapy sessions"
  ON therapy_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- NFT certificates policies
CREATE POLICY "Users can read own NFT certificates"
  ON nft_certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NFT certificates"
  ON nft_certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Leaderboard policies (public read access)
CREATE POLICY "Anyone can read public leaderboard entries"
  ON leaderboard_entries
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own leaderboard entries"
  ON leaderboard_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entries"
  ON leaderboard_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_user_id ON therapy_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_idea_id ON therapy_sessions(idea_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_score ON therapy_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_nft_certificates_user_id ON nft_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_entries(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard_entries(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_sessions_updated_at
  BEFORE UPDATE ON therapy_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample leaderboard data
INSERT INTO leaderboard_entries (id, session_id, user_id, username, idea_title, score, therapist_name, nft_minted, is_public, created_at)
VALUES 
  (uuid_generate_v4(), uuid_generate_v4(), uuid_generate_v4(), 'GreenThumb_99', 'AI-powered plant whisperer that translates plant needs into human language', 9.2, 'Prof. Eternal Optimist', true, true, now() - interval '2 days'),
  (uuid_generate_v4(), uuid_generate_v4(), uuid_generate_v4(), 'StreamMatcher', 'Dating app for people based on their Netflix viewing history', 8.8, 'Dr. Sarcasm', true, true, now() - interval '1 day'),
  (uuid_generate_v4(), uuid_generate_v4(), uuid_generate_v4(), 'TimeTraveler_2024', 'Subscription service for receiving random packages from your future self', 8.5, 'The Startup Sage', false, true, now() - interval '12 hours'),
  (uuid_generate_v4(), uuid_generate_v4(), uuid_generate_v4(), 'PoetryInMotion', 'Social media platform where every post must be a haiku', 8.1, 'Rebel Innovator', true, true, now() - interval '6 hours'),
  (uuid_generate_v4(), uuid_generate_v4(), uuid_generate_v4(), 'PlantParent_Pro', 'Uber for houseplants - get your plants walked and watered', 7.9, 'Dr. Reality Check', false, true, now() - interval '3 hours')
ON CONFLICT DO NOTHING;