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
      setSubscriptionState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription'
      }));
    }
  };

  const upgradeToPremium = async (productId: string = 'premium_monthly'): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated to upgrade');
    }

    try {
      setSubscriptionState(prev => ({ ...prev, loading: true, error: undefined }));

      // Create or get customer
      await revenueCatApi.createCustomer(user.id, user.email);

      // In a real implementation, this would redirect to payment processor
      // For demo, we'll simulate the purchase
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