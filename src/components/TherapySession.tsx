import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Share2, Award, Coins, ArrowLeft } from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  personality: string;
  description: string;
  avatar: string;
  premium: boolean;
  specialty: string;
}

interface TherapySessionProps {
  idea: string;
  therapist: Therapist;
  onBack: () => void;
  onMintNFT: () => void;
}

export const TherapySession: React.FC<TherapySessionProps> = ({ idea, therapist, onBack, onMintNFT }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Simulate video generation and analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getTherapistFeedback = () => {
    const feedbacks = {
      'dr-reality': {
        verdict: 'Needs Serious Work',
        score: 3.2,
        insights: [
          'Market validation is your biggest challenge here',
          'The business model needs significant refinement',
          'Competition analysis reveals major gaps in your approach',
          'However, the core concept has potential if executed properly'
        ],
        advice: 'Focus on validating demand before building anything. Talk to 100 potential customers first.'
      },
      'prof-optimist': {
        verdict: 'Promising Potential!',
        score: 7.8,
        insights: [
          'Your passion for this idea really shines through',
          'There are multiple monetization opportunities here',
          'The target market is definitely underserved',
          'With the right execution, this could be revolutionary'
        ],
        advice: 'Start small, validate with a MVP, then scale based on user feedback. You\'ve got this!'
      },
      'dr-sarcasm': {
        verdict: 'Creatively Chaotic',
        score: 5.5,
        insights: [
          'Well, at least it\'s... original. I\'ll give you that.',
          'The execution complexity is only slightly terrifying',
          'Your target market might exist... in an alternate universe',
          'But hey, stranger things have succeeded in Silicon Valley'
        ],
        advice: 'Simplify it until your grandmother can explain it to her cat. Then simplify it more.'
      }
    };

    return feedbacks[therapist.id as keyof typeof feedbacks] || feedbacks['dr-reality'];
  };

  const feedback = getTherapistFeedback();

  if (isLoading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 mx-auto">
            <div className="text-6xl animate-pulse">{therapist.avatar}</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {therapist.name} is analyzing your idea...
          </h2>
          <p className="text-gray-600 mb-6">This might take a moment. Genius can't be rushed.</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Therapist Selection</span>
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
          {/* Video Player Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
            <div className="relative z-10">
              <div className="text-8xl mb-4">{therapist.avatar}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{therapist.name}</h3>
              <p className="text-blue-200 mb-6">{therapist.personality} Analysis</p>
              
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-gray-900" />
                    ) : (
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    )}
                  </button>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-4">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-white text-sm mt-2">{Math.round(progress)}% complete</p>
              </div>

              <div className="flex justify-center space-x-4">
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {showResults && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Therapy Session Results</h2>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold">
                    {feedback.verdict}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">{feedback.score}/10</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {feedback.insights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-blue-800">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4">Recommended Action</h3>
                  <p className="text-green-800">{feedback.advice}</p>
                </div>
              </div>

              {feedback.score >= 7 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">🎉 Genius Alert!</h3>
                  <p className="mb-4">Your idea scored high enough to mint as an NFT certificate!</p>
                  <button
                    onClick={onMintNFT}
                    className="flex items-center space-x-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all mx-auto"
                  >
                    <Coins className="w-5 h-5" />
                    <span>Mint NFT Certificate</span>
                  </button>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Try Another Idea
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};