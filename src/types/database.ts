export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'premium' | 'enterprise';
          total_sessions: number;
          total_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'premium' | 'enterprise';
          total_sessions?: number;
          total_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'premium' | 'enterprise';
          total_sessions?: number;
          total_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ideas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          submission_method: 'text' | 'voice';
          audio_url: string | null;
          status: 'submitted' | 'analyzing' | 'completed' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          submission_method?: 'text' | 'voice';
          audio_url?: string | null;
          status?: 'submitted' | 'analyzing' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          submission_method?: 'text' | 'voice';
          audio_url?: string | null;
          status?: 'submitted' | 'analyzing' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      therapy_sessions: {
        Row: {
          id: string;
          idea_id: string;
          user_id: string;
          therapist_id: string;
          therapist_name: string;
          script: string | null;
          video_url: string | null;
          audio_url: string | null;
          score: number | null;
          verdict: string | null;
          insights: any;
          advice: string | null;
          status: 'generating' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          user_id: string;
          therapist_id: string;
          therapist_name: string;
          script?: string | null;
          video_url?: string | null;
          audio_url?: string | null;
          score?: number | null;
          verdict?: string | null;
          insights?: any;
          advice?: string | null;
          status?: 'generating' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          user_id?: string;
          therapist_id?: string;
          therapist_name?: string;
          script?: string | null;
          video_url?: string | null;
          audio_url?: string | null;
          score?: number | null;
          verdict?: string | null;
          insights?: any;
          advice?: string | null;
          status?: 'generating' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
      nft_certificates: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          token_id: string;
          blockchain_network: string;
          transaction_hash: string | null;
          certificate_url: string | null;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          token_id: string;
          blockchain_network?: string;
          transaction_hash?: string | null;
          certificate_url?: string | null;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          token_id?: string;
          blockchain_network?: string;
          transaction_hash?: string | null;
          certificate_url?: string | null;
          metadata?: any;
          created_at?: string;
        };
      };
      leaderboard_entries: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          username: string;
          idea_title: string;
          score: number;
          therapist_name: string;
          nft_minted: boolean;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          username: string;
          idea_title: string;
          score: number;
          therapist_name: string;
          nft_minted?: boolean;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          username?: string;
          idea_title?: string;
          score?: number;
          therapist_name?: string;
          nft_minted?: boolean;
          is_public?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Idea = Database['public']['Tables']['ideas']['Row'];
export type TherapySession = Database['public']['Tables']['therapy_sessions']['Row'];
export type NFTCertificate = Database['public']['Tables']['nft_certificates']['Row'];
export type LeaderboardEntry = Database['public']['Tables']['leaderboard_entries']['Row'];