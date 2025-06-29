import React from 'react';
import { ArrowLeft, Star, Crown, Users, Brain, Zap, Target, Lightbulb, Shield } from 'lucide-react';

interface TherapistsInfoProps {
  onBack: () => void;
}

export const TherapistsInfo: React.FC<TherapistsInfoProps> = ({ onBack }) => {
  const therapists = [
    {
      id: 'dr-reality',
      name: 'Dr. Reality Check',
      personality: 'Brutally Honest',
      description: 'No sugar-coating here. Dr. Reality will tell you exactly why your idea might fail - and how to fix it.',
      avatar: '👨‍⚕️',
      premium: false,
      specialty: 'Market Validation',
      experience: '15+ years in startup consulting',
      approach: 'Direct, no-nonsense feedback with practical solutions',
      strengths: ['Market Analysis', 'Risk Assessment', 'Business Model Validation'],
      idealFor: 'Entrepreneurs who want honest, unfiltered feedback',
      sessionStyle: 'Structured analysis with actionable recommendations'
    },
    {
      id: 'prof-optimist',
      name: 'Prof. Eternal Optimist',
      personality: 'Encouraging',
      description: 'Sees the potential in every idea. Perfect for when you need a confidence boost.',
      avatar: '👩‍🏫',
      premium: false,
      specialty: 'Motivation & Vision',
      experience: '20+ years in entrepreneurship education',
      approach: 'Positive reinforcement with strategic guidance',
      strengths: ['Vision Development', 'Team Motivation', 'Growth Mindset'],
      idealFor: 'First-time entrepreneurs or those facing setbacks',
      sessionStyle: 'Inspirational coaching with practical next steps'
    },
    {
      id: 'dr-sarcasm',
      name: 'Dr. Sarcasm',
      personality: 'Witty & Sharp',
      description: 'Delivers feedback with a side of humor. Expect some roasting with your insights.',
      avatar: '🧑‍💼',
      premium: true,
      specialty: 'Creative Problem Solving',
      experience: '12+ years in creative industries',
      approach: 'Humor-driven insights with creative solutions',
      strengths: ['Creative Thinking', 'Problem Reframing', 'Innovation Strategy'],
      idealFor: 'Creative entrepreneurs who appreciate wit and humor',
      sessionStyle: 'Entertaining yet insightful analysis'
    },
    {
      id: 'sage-wisdom',
      name: 'The Startup Sage',
      personality: 'Wise & Experienced',
      description: 'Years of startup wisdom condensed into actionable advice. The mentor you never had.',
      avatar: '🧙‍♂️',
      premium: true,
      specialty: 'Strategy & Scaling',
      experience: '25+ years building and scaling companies',
      approach: 'Deep strategic thinking with historical context',
      strengths: ['Strategic Planning', 'Scaling Operations', 'Leadership Development'],
      idealFor: 'Experienced entrepreneurs ready to scale',
      sessionStyle: 'Comprehensive strategic consultation'
    },
    {
      id: 'rebel-innovator',
      name: 'Rebel Innovator',
      personality: 'Disruptive Thinker',
      description: 'Challenges conventional thinking. Perfect for ideas that break the mold.',
      avatar: '🚀',
      premium: true,
      specialty: 'Innovation & Disruption',
      experience: '10+ years in disruptive technologies',
      approach: 'Challenge assumptions and push boundaries',
      strengths: ['Disruptive Innovation', 'Technology Strategy', 'Market Disruption'],
      idealFor: 'Visionaries building revolutionary products',
      sessionStyle: 'Provocative questioning with bold recommendations'
    }
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto py-16">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Meet Your
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> AI Therapists </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Each AI therapist brings a unique personality and expertise to help you refine your startup ideas. 
            Choose the one that matches your needs and communication style.
          </p>
        </div>

        {/* Therapist Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Free Therapists</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Get started with our foundational AI therapists. Perfect for initial idea validation and basic feedback.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Basic idea analysis and feedback</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Market validation insights</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Motivational guidance</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border-2 border-yellow-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-600" />
              <h3 className="text-2xl font-bold text-gray-900">Premium Therapists</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Advanced AI personalities with specialized expertise for deep strategic insights and creative problem-solving.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Advanced strategic analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Creative problem-solving approaches</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Disruptive innovation insights</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Individual Therapist Cards */}
        <div className="space-y-8">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 shadow-xl hover:shadow-2xl transition-all ${
                therapist.premium 
                  ? 'border-yellow-200 bg-gradient-to-br from-white to-yellow-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Therapist Overview */}
                <div className="text-center lg:text-left">
                  <div className="relative inline-block mb-4">
                    <div className="text-8xl">{therapist.avatar}</div>
                    {therapist.premium && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>PRO</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{therapist.name}</h3>
                  <p className="text-lg font-medium text-blue-600 mb-3">{therapist.personality}</p>
                  <p className="text-gray-600 mb-4">{therapist.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Specialty:</span>
                      <span className="text-gray-700">{therapist.specialty}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Experience:</span>
                      <span className="text-gray-700">{therapist.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Approach & Strengths */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span>Approach & Strengths</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Therapy Approach:</p>
                      <p className="text-sm text-gray-600">{therapist.approach}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Core Strengths:</p>
                      <div className="flex flex-wrap gap-2">
                        {therapist.strengths.map((strength, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ideal For & Session Style */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Best Fit</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Ideal For:</p>
                      <p className="text-sm text-gray-600">{therapist.idealFor}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Session Style:</p>
                      <p className="text-sm text-gray-600">{therapist.sessionStyle}</p>
                    </div>
                    
                    <div className="pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">User Rating:</span>
                        <span className="text-sm font-bold text-gray-900">4.8/5</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Sessions:</span>
                        <span className="text-sm font-bold text-gray-900">1,200+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Therapy Session?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Choose the AI therapist that resonates with your style and get personalized feedback on your startup ideas.
            </p>
            <button
              onClick={onBack}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Submit Your Idea Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};