import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  expiresDate?: string;
  managementUrl?: string;
  loading: boolean;
  error?: string;
}

export function useSubscription() {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    isSubscribed: false,
    subscriptionTier: 'free',
    loading: true
  });

  const { user, profile, updateProfile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      checkSubscriptionStatus();
    } else {
      setSubscriptionState({
        isSubscribed: false,
        subscriptionTier: 'free',
        loading: false
      });
    }
  }, [user, profile]);

  const checkSubscriptionStatus = async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, loading: true, error: undefined }));

      // Use the subscription tier from the user's profile
      const subscriptionTier = profile?.subscription_tier || 'free';
      const isSubscribed = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';
      
      // Mock next billing date
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      
      setSubscriptionState({
        isSubscribed,
        subscriptionTier,
        expiresDate: isSubscribed ? nextBilling.toISOString() : undefined,
        managementUrl: 'https://dreamadvisor.app/billing',
        loading: false
      });

    } catch (error) {
      console.error('Error checking subscription status:', error);
      
      // Fallback to profile subscription tier on error
      const subscriptionTier = profile?.subscription_tier || 'free';
      const isSubscribed = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';
      
      setSubscriptionState({
        isSubscribed,
        subscriptionTier,
        loading: false,
        error: 'Using offline subscription status'
      });
    }
  };

  const upgradeToPremium = async (productId: string = 'premium_monthly'): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated to upgrade');
    }

    try {
      setSubscriptionState(prev => ({ ...prev, loading: true, error: undefined }));

      console.log('🎭 Simulating premium upgrade...');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update profile to premium
      await updateProfile({ subscription_tier: 'premium' });
      
      setSubscriptionState({
        isSubscribed: true,
        subscriptionTier: 'premium',
        loading: false,
        managementUrl: 'https://dreamadvisor.app/billing'
      });
      
      return true;

    } catch (error) {
      console.error('Error upgrading to premium:', error);
      setSubscriptionState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to upgrade subscription'
      }));
      return false;
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // Update profile to free tier
      await updateProfile({ subscription_tier: 'free' });
      
      setSubscriptionState({
        isSubscribed: false,
        subscriptionTier: 'free',
        loading: false
      });
      
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  };

  const refreshSubscription = () => {
    if (user) {
      checkSubscriptionStatus();
    }
  };

  return {
    ...subscriptionState,
    upgradeToPremium,
    cancelSubscription,
    refreshSubscription,
    canAccessPremiumFeatures: subscriptionState.isSubscribed || subscriptionState.subscriptionTier !== 'free'
  };
}