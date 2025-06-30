import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, TrendingUp, Loader, UserPlus, LogIn, Crown, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import type { LeaderboardEntry } from '../types/database';

export const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, profile } = useAuth();

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch leaderboard data with timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      const fetchPromise = supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('is_public', true)
        .order('score', { ascending: false })
        .limit(10);

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

      setLeaderboardData(data || []);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
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

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Navigate to submission - this would be handled by parent component
      const element = document.getElementById('hero');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setShowAuthModal(true);
    }
  };

  // Determine how many entries to show and what message to display
  const getLeaderboardDisplay = () => {
    const count = leaderboardData.length;
    
    if (count === 0) {
      return {
        title: 'No Ideas Yet',
        subtitle: 'Be the first to create!',
        showEntries: false,
        message: 'The leaderboard is waiting for brilliant minds like yours. Be the first to submit a genius idea and claim the top spot!'
      };
    } else if (count === 1) {
      return {
        title: 'Top Idea',
        subtitle: 'Leading the way',
        showEntries: true,
        message: null
      };
    } else if (count <= 5) {
      return {
        title: `Top ${count} Ideas`,
        subtitle: 'Current leaders',
        showEntries: true,
        message: null
      };
    } else {
      return {
        title: 'Top 5 Ideas',
        subtitle: 'Hall of Fame leaders',
        showEntries: true,
        message: null
      };
    }
  };

  const displayInfo = getLeaderboardDisplay();
  const entriesToShow = displayInfo.showEntries ? leaderboardData.slice(0, 5) : [];

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
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600 mb-2">Loading genius ideas...</p>
              <p className="text-sm text-gray-500">This should only take a moment</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
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
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Leaderboard</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchLeaderboardData}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
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

          {/* Premium Upgrade Banner - only show for authenticated free users */}
          {isAuthenticated && profile?.subscription_tier === 'free' && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 mb-8 text-white text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Crown className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Unlock Premium Features!</h3>
              </div>
              <p className="text-yellow-100 mb-4">
                Get access to premium therapists, unlimited sessions, and exclusive insights
              </p>
              <button
                onClick={() => alert('Premium upgrade coming soon!')}
                className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
            {!displayInfo.showEntries ? (
              // Empty state
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{displayInfo.title}</h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  {displayInfo.message}
                </p>
                
                {isAuthenticated ? (
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-3 mx-auto"
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span>Submit Your Genius Idea</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500 mb-4">Sign in to submit your idea and compete for the top spot!</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2 justify-center"
                      >
                        <UserPlus className="w-5 h-5" />
                        <span>Sign Up & Submit Idea</span>
                      </button>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center space-x-2 justify-center"
                      >
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Show leaderboard entries
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{displayInfo.title}</h3>
                  <p className="text-gray-600">{displayInfo.subtitle}</p>
                </div>

                {entriesToShow.map((entry, index) => {
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

                <div className="mt-8 text-center">
                  <p className="text-gray-500 mb-4">
                    {leaderboardData.length > 5 
                      ? `Showing top 5 of ${leaderboardData.length} genius ideas` 
                      : 'Want to see your idea here?'
                    }
                  </p>
                  <button 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    {isAuthenticated ? 'Submit Your Idea' : 'Sign Up & Submit Idea'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signup"
      />
    </>
  );
};