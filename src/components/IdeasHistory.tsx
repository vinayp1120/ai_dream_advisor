import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MessageSquare, Mic, Star, TrendingUp, Eye, Archive, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Idea, TherapySession } from '../types/database';

interface IdeasHistoryProps {
  onBack: () => void;
}

interface IdeaWithSession extends Idea {
  therapy_sessions?: TherapySession[];
}

export const IdeasHistory: React.FC<IdeasHistoryProps> = ({ onBack }) => {
  const [ideas, setIdeas] = useState<IdeaWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'analyzing'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserIdeas();
    }
  }, [user, filter]);

  const fetchUserIdeas = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('ideas')
        .select(`
          *,
          therapy_sessions (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setIdeas(data || []);
    } catch (err: any) {
      console.error('Error fetching ideas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'analyzing':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    return method === 'voice' ? <Mic className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
  };

  const getBestScore = (sessions: TherapySession[]) => {
    if (!sessions || sessions.length === 0) return null;
    const scores = sessions.filter(s => s.score !== null).map(s => s.score);
    return scores.length > 0 ? Math.max(...scores) : null;
  };

  const filteredIdeas = ideas.filter(idea => {
    if (filter === 'all') return true;
    return idea.status === filter;
  });

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
        <div className="max-w-4xl mx-auto py-16">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your ideas...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto py-16">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Ideas </span>
            Journey
          </h2>
          <p className="text-lg text-gray-600">
            Track your entrepreneurial evolution and therapy sessions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200">
            {[
              { key: 'all', label: 'All Ideas', count: ideas.length },
              { key: 'completed', label: 'Completed', count: ideas.filter(i => i.status === 'completed').length },
              { key: 'analyzing', label: 'Analyzing', count: ideas.filter(i => i.status === 'analyzing').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-6 py-2 rounded-xl transition-all ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {filter === 'all' ? 'No ideas yet' : `No ${filter} ideas`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Start your entrepreneurial journey by submitting your first idea!'
                : `You don't have any ${filter} ideas at the moment.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => onBack()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Submit Your First Idea
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredIdeas.map((idea) => {
              const bestScore = getBestScore(idea.therapy_sessions || []);
              const sessionCount = idea.therapy_sessions?.length || 0;

              return (
                <div
                  key={idea.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{idea.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                          {idea.status}
                        </span>
                        <div className="flex items-center space-x-1 text-gray-500">
                          {getMethodIcon(idea.submission_method)}
                          <span className="text-sm capitalize">{idea.submission_method}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">{idea.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
                        </div>
                        {bestScore && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{bestScore.toFixed(1)}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {bestScore && (
                      <div className="text-center ml-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-2">
                          <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600">Best Score</p>
                        <p className="text-lg font-bold text-gray-900">{bestScore.toFixed(1)}</p>
                      </div>
                    )}
                  </div>

                  {/* Therapy Sessions */}
                  {idea.therapy_sessions && idea.therapy_sessions.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Therapy Sessions</h4>
                      <div className="space-y-2">
                        {idea.therapy_sessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-sm">🤖</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{session.therapist_name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(session.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                {session.status}
                              </span>
                              {session.score && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="text-sm font-medium">{session.score.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {ideas.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{ideas.length}</p>
              <p className="text-gray-600">Total Ideas</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {ideas.filter(i => i.status === 'completed').length}
              </p>
              <p className="text-gray-600">Completed</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const allScores = ideas
                    .flatMap(i => i.therapy_sessions || [])
                    .filter(s => s.score !== null)
                    .map(s => s.score);
                  return allScores.length > 0 
                    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
                    : '0.0';
                })()}
              </p>
              <p className="text-gray-600">Avg Score</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};