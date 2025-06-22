import React from 'react';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const leaderboardData = [
    {
      rank: 1,
      idea: "AI-powered plant whisperer that translates plant needs into human language",
      score: 9.2,
      creator: "GreenThumb_99",
      therapist: "Prof. Eternal Optimist",
      nftMinted: true
    },
    {
      rank: 2,
      idea: "Dating app for people based on their Netflix viewing history",
      score: 8.8,
      creator: "StreamMatcher",
      therapist: "Dr. Sarcasm",
      nftMinted: true
    },
    {
      rank: 3,
      idea: "Subscription service for receiving random packages from your future self",
      score: 8.5,
      creator: "TimeTraveler_2024",
      therapist: "The Startup Sage",
      nftMinted: false
    },
    {
      rank: 4,
      idea: "Social media platform where every post must be a haiku",
      score: 8.1,
      creator: "PoetryInMotion",
      therapist: "Rebel Innovator",
      nftMinted: true
    },
    {
      rank: 5,
      idea: "Uber for houseplants - get your plants walked and watered",
      score: 7.9,
      creator: "PlantParent_Pro",
      therapist: "Dr. Reality Check",
      nftMinted: false
    }
  ];

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
          <div className="space-y-4">
            {leaderboardData.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center space-x-6 p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  entry.rank <= 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">#{entry.rank}</h3>
                    {entry.nftMinted && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                        NFT MINTED
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2 leading-relaxed">{entry.idea}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>by {entry.creator}</span>
                    <span>•</span>
                    <span>Analyzed by {entry.therapist}</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center space-x-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900">{entry.score}</span>
                  </div>
                  <span className="text-sm text-gray-500">Genius Score</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">Want to see your idea here?</p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all">
              Submit Your Idea
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};