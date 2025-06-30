import React from 'react';
import { Check, Download, Share2, Crown, Star, Zap, ArrowRight, Brain, Sparkles } from 'lucide-react';

interface PaymentSuccessProps {
  onContinue: () => void;
  planType: 'monthly' | 'yearly';
  amount: number;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onContinue, planType, amount }) => {
  const handleLogoClick = () => {
    onContinue();
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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

      <div className="pt-16 flex items-center justify-center p-4 min-h-screen">
        <div className="max-w-2xl w-full">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Check className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 w-32 h-32 border-4 border-green-300 rounded-full animate-ping mx-auto"></div>
            </div>
            
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to
              <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent"> Premium!</span>
            </h1>
            <p className="text-xl text-gray-600">
              Your payment was successful. You now have access to all premium features!
            </p>
          </div>

          {/* Payment Details Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Premium Subscription</h3>
                  <p className="text-gray-600 capitalize">{planType} Plan</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${amount}</div>
                <div className="text-sm text-gray-500">Paid Successfully</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Star className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-blue-900">Transaction ID</div>
                <div className="text-sm text-blue-700">#TXN-{Date.now().toString().slice(-8)}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-900">Status</div>
                <div className="text-sm text-green-700">Confirmed</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Crown className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-purple-900">Next Billing</div>
                <div className="text-sm text-purple-700">
                  {new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">What's Included in Your Premium Plan:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Access to all 5 premium AI therapists',
                  'Unlimited therapy sessions',
                  'Priority video generation',
                  'Advanced analytics and insights',
                  'NFT certificate minting',
                  'Early access to new features',
                  'Premium customer support',
                  'Export and share capabilities'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors">
              <Download className="w-5 h-5" />
              <span>Download Receipt</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share Success</span>
            </button>
            <button
              onClick={onContinue}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all"
            >
              <span>Start Using Premium</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Ideas?</h3>
            <p className="text-blue-100 mb-6">
              Your premium subscription is now active. Start submitting your startup ideas and get expert AI therapy sessions!
            </p>
            <button
              onClick={onContinue}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Submit Your First Premium Idea
            </button>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Need help? Contact our premium support team
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a href="mailto:premium@dreamadvisor.app" className="text-blue-600 hover:text-blue-700">
                premium@dreamadvisor.app
              </a>
              <span className="text-gray-300">|</span>
              <a href="tel:+1-555-DREAM" className="text-blue-600 hover:text-blue-700">
                +1 (555) DREAM-AI
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};