/*
  # Complete DreamAdvisor Database Schema

  1. New Tables
    - `profiles` - User profiles with subscription tiers and statistics
    - `ideas` - Startup ideas submitted by users (text/voice)
    - `therapy_sessions` - AI therapy session records with scores and feedback
    - `nft_certificates` - Blockchain NFT certificate tracking
    - `leaderboard_entries` - Public leaderboard with privacy controls

  2. Security
    - Enable RLS on all tables
    - User-specific access policies for private data
    - Public read access for leaderboard entries
    - Automatic profile creation on user signup

  3. Performance
    - Indexes on frequently queried columns
    - Automatic timestamp updates
    - Optimized foreign key relationships

  4. Features
    - UUID primary keys with auto-generation
    - JSONB fields for flexible metadata storage
    - Check constraints for data validation
    - Cascading deletes for data cleanup
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