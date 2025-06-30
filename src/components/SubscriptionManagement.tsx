import React, { useState } from 'react';
import { Crown, Calendar, CreditCard, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Settings, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PaymentModal } from './PaymentModal';
import { BillingHistory } from './BillingHistory';
import { PaymentSettings } from './PaymentSettings';

export const SubscriptionManagement: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { profile, updateProfile } = useAuth();

  const isSubscribed = profile?.subscription_tier === 'premium';
  const subscriptionTier = profile?.subscription_tier || 'free';

  // Mock subscription data
  const subscriptionData = {
    plan: 'Premium Monthly',
    price: 9.99,
    nextBilling: '2025-01-29',
    status: 'active',
    paymentMethod: 'Visa •••• 4242'
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleCancelSubscription = async () => {
    try {
      await updateProfile({ subscription_tier: 'free' });
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setShowUpgradeModal(false);
  };

  const getStatusColor = () => {
    if (!isSubscribed) return 'text-gray-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!isSubscribed) return <AlertCircle className="w-5 h-5 text-gray-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  if (showBillingHistory) {
    return <BillingHistory onBack={() => setShowBillingHistory(false)} />;
  }

  if (showPaymentSettings) {
    return <PaymentSettings onBack={() => setShowPaymentSettings(false)} />;
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {subscriptionTier} Plan
                </p>
                <p className={`text-sm ${getStatusColor()}`}>
                  {isSubscribed ? 'Active Subscription' : 'Free Plan'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-medium ${getStatusColor()}`}>
                {isSubscribed ? 'Premium' : 'Free'}
              </p>
            </div>
          </div>

          {/* Subscription Details */}
          {isSubscribed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Next Billing</span>
                </div>
                <p className="text-blue-800">{subscriptionData.nextBilling}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Payment Method</span>
                </div>
                <p className="text-green-800">{subscriptionData.paymentMethod}</p>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-3">
              {isSubscribed ? 'Premium Features' : 'Available with Premium'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className={isSubscribed ? 'text-green-600' : 'text-gray-400'}>
                  {isSubscribed ? '✓' : '○'}
                </span>
                <span className="text-gray-700">All Premium Therapists</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={isSubscribed ? 'text-green-600' : 'text-gray-400'}>
                  {isSubscribed ? '✓' : '○'}
                </span>
                <span className="text-gray-700">Unlimited Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={isSubscribed ? 'text-green-600' : 'text-gray-400'}>
                  {isSubscribed ? '✓' : '○'}
                </span>
                <span className="text-gray-700">Priority Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={isSubscribed ? 'text-green-600' : 'text-gray-400'}>
                  {isSubscribed ? '✓' : '○'}
                </span>
                <span className="text-gray-700">NFT Minting</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSubscribed ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowPaymentSettings(true)}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Payment Settings</span>
                  </button>
                  <button
                    onClick={() => setShowBillingHistory(true)}
                    className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Billing History</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full text-red-600 hover:text-red-700 py-2 text-sm font-medium transition-colors"
                >
                  Cancel Subscription
                </button>
              </>
            ) : (
              <button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Upgrade to Premium
              </button>
            )}
          </div>

          {/* Billing Info */}
          {isSubscribed && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Your subscription will automatically renew on {subscriptionData.nextBilling}.
                You can cancel or modify your subscription at any time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <PaymentModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full mx-4 p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cancel Subscription?</h3>
              <p className="text-gray-600 mb-6">
                You'll lose access to premium features at the end of your current billing period.
                Your subscription will remain active until {subscriptionData.nextBilling}.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleCancelSubscription}
                  className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel Subscription
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};