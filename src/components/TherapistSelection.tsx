import React, { useState } from 'react';
import { Users, Crown, Lock, ArrowRight, Brain, Sparkles } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { PremiumUpgradeModal } from './PremiumUpgradeModal';

interface Therapist {
  id: string;
  name: string;
  personality: string;
  description: string;
  avatar: string;
  premium: boolean;
  specialty: string;
}

interface TherapistSelectionProps {
  onSelect: (therapist: Therapist) => void;
  onBack: () => void;
}

export const TherapistSelection: React.FC<TherapistSelectionProps> = ({ onSelect, onBack }) => {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { canAccessPremiumFeatures } = useSubscription();

  const handleLogoClick = () => {
    onBack();
  };

  const therapists: Therapist[] = [
    {
      id: 'dr-reality',
      name: 'Dr. Reality Check',
      personality: 'Brutally Honest',
      description: 'No sugar-coating here. Dr. Reality will tell you exactly why your idea might fail - and how to fix it.',
      avatar: '👨‍⚕️',
      premium: false,
      specialty: 'Market Validation'
    },
    {
      id: 'prof-optimist',
      name: 'Prof. Eternal Optimist',
      personality: 'Encouraging',
      description: 'Sees the potential in every idea. Perfect for when you need a confidence boost.',
      avatar: '👩‍🏫',
      premium: false,
      specialty: 'Motivation & Vision'
    },
    {
      id: 'dr-sarcasm',
      name: 'Dr. Sarcasm',
      personality: 'Witty & Sharp',
      description: 'Delivers feedback with a side of humor. Expect some roasting with your insights.',
      avatar: '🧑‍💼',
      premium: true,
      specialty: 'Creative Problem Solving'
    },
    {
      id: 'sage-wisdom',
      name: 'The Startup Sage',
      personality: 'Wise & Experienced',
      description: 'Years of startup wisdom condensed into actionable advice. The mentor you never had.',
      avatar: '🧙‍♂️',
      premium: true,
      specialty: 'Strategy & Scaling'
    },
    {
      id: 'rebel-innovator',
      name: 'Rebel Innovator',
      personality: 'Disruptive Thinker',
      description: 'Challenges conventional thinking. Perfect for ideas that break the mold.',
      avatar: '🚀',
      premium: true,
      specialty: 'Innovation & Disruption'
    }
  ];

  const handleTherapistClick = (therapist: Therapist) => {
    if (therapist.premium && !canAccessPremiumFeatures) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedTherapist(therapist);
  };

  const handleSelect = () => {
    if (selectedTherapist) {
      if (selectedTherapist.premium && !canAccessPremiumFeatures) {
        setShowUpgradeModal(true);
        return;
      }
      onSelect(selectedTherapist);
    }
  };

  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        {/* Header with Logo Only */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button 
                onClick={handleLogoClick}
                className="flex items-center space-x-2 hover:scale-105 transition-transform"
              >
                <div className="relative">
                  <Brain className="w-8 h-8 text-blue-600" />
                  <Sparkles className="w-4 h-4 text-orange-500 absolute -top-1 -right-1" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DreamAdvisor
                </h1>
              </button>
            </div>
          </div>
        </header>

        <div className="pt-16 p-4">
          <div className="max-w-6xl mx-auto py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Therapist </span>
              </h2>
              <p className="text-lg text-gray-600">
                Each AI therapist has their own unique approach to startup feedback
              </p>
            </div>

            {/* Premium Banner */}
            {!canAccessPremiumFeatures && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 mb-8 text-white text-center">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Crown className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Unlock Premium Therapists!</h3>
                </div>
                <p className="text-yellow-100 mb-4">
                  Get access to 3 additional premium therapists with specialized expertise
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Upgrade to Premium
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {therapists.map((therapist) => {
                const isLocked = therapist.premium && !canAccessPremiumFeatures;
                const isSelected = selectedTherapist?.id === therapist.id;
                
                return (
                  <div
                    key={therapist.id}
                    onClick={() => handleTherapistClick(therapist)}
                    className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                      isSelected 
                        ? 'border-blue-500 shadow-lg' 
                        : isLocked
                        ? 'border-gray-200 opacity-75'
                        : 'border-gray-200'
                    }`}
                  >
                    {therapist.premium && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>PREMIUM</span>
                      </div>
                    )}

                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-900/20 rounded-2xl flex items-center justify-center">
                        <div className="bg-white rounded-full p-3">
                          <Lock className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-6xl mb-4">{therapist.avatar}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{therapist.name}</h3>
                      <p className="text-sm font-medium text-blue-600 mb-3">{therapist.personality}</p>
                      <p className="text-gray-600 text-sm mb-4">{therapist.description}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">SPECIALTY</p>
                        <p className="text-sm font-semibold text-gray-700">{therapist.specialty}</p>
                      </div>

                      {isLocked && (
                        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-orange-600">
                          <Lock className="w-3 h-3" />
                          <span>Premium required</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedTherapist}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Start Therapy Session</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {canAccessPremiumFeatures 
                  ? 'You have access to all premium therapists!' 
                  : 'Premium therapists offer advanced insights and personality-matched feedback'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};