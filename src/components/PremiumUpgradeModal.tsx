import React, { useState } from 'react';
import { X, Crown, Check, Loader, CreditCard, Shield, Zap, Star, Users, Award } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: 'monthly' | 'yearly';
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedPlan = 'monthly' 
}) => {
  const [currentPlan, setCurrentPlan] = useState<'monthly' | 'yearly'>(selectedPlan);
  const [isProcessing, setIsProcessing] = useState(false);
  const { upgradeToPremium, loading } = useSubscription();

  if (!isOpen) return null;

  const plans = {
    monthly: {
      id: 'premium_monthly',
      name: 'Monthly',
      price: 9.99,
      period: 'month',
      savings: null,
      popular: false
    },
    yearly: {
      id: 'premium_yearly',
      name: 'Yearly',
      price: 99.99,
      period: 'year',
      savings: '17% off',
      popular: true
    }
  };

  const features = [
    {
      icon: <Users className="w-5 h-5" />,
      title: 'All Premium Therapists',
      description: 'Access to Dr. Sarcasm, Startup Sage, and Rebel Innovator'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Unlimited Sessions',
      description: 'No limits on therapy sessions or idea submissions'
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: 'Priority Processing',
      description: 'Faster video generation and priority queue access'
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Advanced Analytics',
      description: 'Detailed insights and progress tracking'
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: 'NFT Minting',
      description: 'Mint your best ideas as blockchain certificates'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Early Access',
      description: 'First access to new features and therapists'
    }
  ];

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      const success = await upgradeToPremium(plans[currentPlan].id);
      
      if (success) {
        // Show success message and close modal
        alert('🎉 Welcome to Premium! You now have access to all premium features.');
        onClose();
      } else {
        alert('❌ Upgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('❌ Upgrade failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlanData = plans[currentPlan];
  const monthlyPrice = currentPlan === 'yearly' ? (currentPlanData.price / 12).toFixed(2) : currentPlanData.price.toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <Crown className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Upgrade to Premium</h2>
            <p className="text-yellow-100 text-lg">
              Unlock the full power of AI startup therapy
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Plan Selection */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-2xl p-2 flex">
              {Object.entries(plans).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setCurrentPlan(key as 'monthly' | 'yearly')}
                  className={`relative px-6 py-3 rounded-xl transition-all ${
                    currentPlan === key
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-sm">
                    ${plan.price}/{plan.period}
                  </div>
                  {plan.savings && (
                    <div className="text-xs text-green-600 font-medium">
                      {plan.savings}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Display */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              ${monthlyPrice}
              <span className="text-lg text-gray-500 font-normal">/month</span>
            </div>
            {currentPlan === 'yearly' && (
              <div className="text-green-600 font-medium">
                Save ${((9.99 * 12) - currentPlanData.price).toFixed(2)} per year
              </div>
            )}
            <div className="text-gray-500 mt-2">
              7-day free trial • Cancel anytime
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              Free vs Premium Comparison
            </h3>
            <div className="space-y-3">
              {[
                { feature: 'AI Therapists', free: '2 Basic', premium: '5 Premium' },
                { feature: 'Monthly Sessions', free: '5 sessions', premium: 'Unlimited' },
                { feature: 'Video Quality', free: 'Standard', premium: 'HD Priority' },
                { feature: 'NFT Minting', free: '❌', premium: '✅' },
                { feature: 'Advanced Analytics', free: '❌', premium: '✅' },
                { feature: 'Early Access', free: '❌', premium: '✅' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-700">{item.feature}</span>
                  <div className="flex space-x-8">
                    <span className="text-gray-500 w-20 text-center">{item.free}</span>
                    <span className="text-green-600 font-medium w-20 text-center">{item.premium}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={handleUpgrade}
              disabled={isProcessing || loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isProcessing || loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Start 7-Day Free Trial</span>
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-3">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              Your subscription will auto-renew unless cancelled.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-4 h-4" />
              <span className="text-sm">30-Day Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};