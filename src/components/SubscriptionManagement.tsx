import React, { useState } from 'react';
import { Crown, Calendar, CreditCard, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export const SubscriptionManagement: React.FC = () => {
  const { 
    isSubscribed, 
    subscriptionTier, 
    expiresDate, 
    managementUrl, 
    loading, 
    error,
    cancelSubscription,
    refreshSubscription 
  } = useSubscription();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshSubscription();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleManageSubscription = () => {
    if (managementUrl) {
      window.open(managementUrl, '_blank');
    } else {
      cancelSubscription();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (!isSubscribed) return 'text-gray-600';
    if (expiresDate && new Date(expiresDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return 'text-yellow-600'; // Expires within 7 days
    }
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!isSubscribed) return <AlertCircle className="w-5 h-5 text-gray-500" />;
    if (expiresDate && new Date(expiresDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Crown className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Crown className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
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
              <p className="text-blue-800">{formatDate(expiresDate)}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Plan Type</span>
              </div>
              <p className="text-green-800">Premium Monthly</p>
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
        <div className="flex space-x-3">
          {isSubscribed ? (
            <button
              onClick={handleManageSubscription}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Subscription</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                // This would trigger the upgrade modal
                const event = new CustomEvent('openUpgradeModal');
                window.dispatchEvent(event);
              }}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* Billing Info */}
        {isSubscribed && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Your subscription will automatically renew on {formatDate(expiresDate)}.
              You can cancel or modify your subscription at any time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};