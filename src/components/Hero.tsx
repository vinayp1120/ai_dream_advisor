import React, { useState } from 'react';
import { MessageSquare, Mic, Play, Star, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

interface HeroProps {
  onStartJourney: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourney }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleStartJourney = () => {
    if (isAuthenticated) {
      onStartJourney();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleVoiceIdea = () => {
    if (isAuthenticated) {
      onStartJourney();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-orange-200 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-12 h-12 bg-green-200 rounded-full opacity-60 animate-bounce"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-blue-600 border border-blue-200 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Startup Therapy
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Your
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent block">
                Wild Ideas
              </span>
              Into Gold
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Get brutally honest, hilariously insightful feedback on your startup ideas from our AI therapists. 
              Because every entrepreneur needs therapy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={handleStartJourney}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6" />
                <span>{isAuthenticated ? 'Start Your Therapy' : 'Sign Up & Start'}</span>
                <div className={`w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform ${isHovered ? 'scale-110' : ''}`}>
                  <Play className="w-3 h-3 fill-current" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={handleVoiceIdea}
              className="group flex items-center space-x-3 bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-2xl text-lg font-semibold border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Mic className="w-6 h-6 group-hover:text-orange-500 transition-colors" />
              <span>Voice Your Idea</span>
            </button>
          </div>

          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Your Idea</h3>
              <p className="text-gray-600">Text or voice - we accept all forms of entrepreneurial madness</p>
            </div>
            
            <div id="therapists" className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Therapist</h3>
              <p className="text-gray-600">Pick from our roster of brutally honest AI personalities</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Play className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Video Feedback</h3>
              <p className="text-gray-600">Receive personalized video therapy sessions for your startup</p>
            </div>
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