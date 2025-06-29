import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, TrendingUp, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry } from '../types/database';

export const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('is_public', true)
        .order('score', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setLeaderboardData(data || []);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Award className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <section id="leaderboard" className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hall of
              <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent"> Fame </span>
            </h2>
            <p className="text-lg text-gray-600">
              The most genius ideas that survived our AI therapy sessions
            </p>
          </div>
          <div className="flex justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="leaderboard" className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hall of
              <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent"> Fame </span>
            </h2>
            <p className="text-red-600">Error loading leaderboard: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="leaderboard" className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hall of
            <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent"> Fame </span>
          </h2>
          <p className="text-lg text-gray-600">
            The most genius ideas that survived our AI therapy sessions
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No entries yet</h3>
              <p className="text-gray-500">Be the first to submit your genius idea!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboardData.map((entry, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center space-x-6 p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
                      {getRankIcon(rank)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">#{rank}</h3>
                        {entry.nft_minted && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                            NFT MINTED
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2 leading-relaxed">{entry.idea_title}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>by {entry.username}</span>
                        <span>•</span>
                        <span>Analyzed by {entry.therapist_name}</span>
                        <span>•</span>
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-2xl font-bold text-gray-900">{entry.score.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-500">Genius Score</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">Want to see your idea here?</p>
            <button 
              onClick={() => {
                const element = document.getElementById('hero');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              Submit Your Idea
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};