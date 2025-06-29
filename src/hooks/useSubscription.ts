import { useState, useEffect } from 'react';
import { RevenueCatAPI } from '../utils/revenueCatApi';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

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
  const revenueCatApi = new RevenueCatAPI();

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    } else {
      setSubscriptionState({
        isSubscribed: false,
        subscriptionTier: 'free',
        loading: false
      });
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      setSubscriptionState(prev => ({ ...prev, loading: true, error: undefined }));

      // Check if RevenueCat is in simulation mode
      if (revenueCatApi.isInSimulationMode()) {
        console.log('🎭 RevenueCat in simulation mode - using profile subscription tier');
        
        // Use the subscription tier from the user's profile
        const subscriptionTier = profile?.subscription_tier || 'free';
        const isSubscribed = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';
        
        setSubscriptionState({
          isSubscribed,
          subscriptionTier,
          loading: false,
          managementUrl: 'https://app.revenuecat.com' // Placeholder URL
        });
        return;
      }

      // Get subscription info from RevenueCat
      const customerInfo = await revenueCatApi.getCustomerInfo(user.id);
      
      // Update local profile if subscription status changed
      if (profile && profile.subscription_tier !== customerInfo.subscriptionTier) {
        await updateProfile({ subscription_tier: customerInfo.subscriptionTier });
      }

      setSubscriptionState({
        isSubscribed: customerInfo.isSubscribed,
        subscriptionTier: customerInfo.subscriptionTier,
        expiresDate: customerInfo.expiresDate,
        managementUrl: customerInfo.managementUrl,
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

      // If RevenueCat is in simulation mode, simulate the upgrade
      if (revenueCatApi.isInSimulationMode()) {
        console.log('🎭 Simulating premium upgrade...');
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update profile to premium
        await updateProfile({ subscription_tier: 'premium' });
        
        setSubscriptionState({
          isSubscribed: true,
          subscriptionTier: 'premium',
          loading: false,
          managementUrl: 'https://app.revenuecat.com'
        });
        
        return true;
      }

      // Real RevenueCat integration
      await revenueCatApi.createCustomer(user.id, user.email);
      console.log('🔄 Initiating premium upgrade...');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create the purchase
      const updatedCustomer = await revenueCatApi.createPurchase(user.id, productId);
      
      // Update subscription state
      const customerInfo = await revenueCatApi.getCustomerInfo(user.id);
      
      // Update profile in database
      await updateProfile({ subscription_tier: customerInfo.subscriptionTier });

      setSubscriptionState({
        isSubscribed: customerInfo.isSubscribed,
        subscriptionTier: customerInfo.subscriptionTier,
        expiresDate: customerInfo.expiresDate,
        managementUrl: customerInfo.managementUrl,
        loading: false
      });

      return customerInfo.isSubscribed;

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
    if (!user || !subscriptionState.managementUrl) {
      return false;
    }

    // Redirect to subscription management
    window.open(subscriptionState.managementUrl, '_blank');
    return true;
  };

  const getPaymentUrl = (productId: string = 'premium_monthly'): string => {
    if (!user) return '';
    return revenueCatApi.generatePaymentUrl(user.id, productId);
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
    getPaymentUrl,
    refreshSubscription,
    canAccessPremiumFeatures: subscriptionState.isSubscribed || subscriptionState.subscriptionTier !== 'free'
  };
}