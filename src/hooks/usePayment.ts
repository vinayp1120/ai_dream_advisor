import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateProfile } = useAuth();

  const processPayment = useCallback(async (
    amount: number,
    planType: 'monthly' | 'yearly',
    paymentData: PaymentData
  ): Promise<PaymentResult> => {
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate payment validation
      const isValidCard = paymentData.cardNumber.replace(/\s/g, '').length >= 13;
      const isValidExpiry = paymentData.expiryDate.length === 5;
      const isValidCvv = paymentData.cvv.length >= 3;
      const isValidName = paymentData.cardholderName.trim().length > 0;

      if (!isValidCard || !isValidExpiry || !isValidCvv || !isValidName) {
        throw new Error('Invalid payment information');
      }

      // Simulate random payment failures for testing
      const shouldFail = Math.random() < 0.1; // 10% failure rate for testing
      
      if (shouldFail) {
        const errors = [
          'Card declined by issuer',
          'Insufficient funds',
          'Card expired',
          'Invalid CVV',
          'Network timeout'
        ];
        throw new Error(errors[Math.floor(Math.random() * errors.length)]);
      }

      // Generate transaction ID
      const transactionId = `txn_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;

      // Update user profile to premium
      await updateProfile({ subscription_tier: 'premium' });

      return {
        success: true,
        transactionId
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [updateProfile]);

  const validatePaymentData = useCallback((paymentData: PaymentData): string[] => {
    const errors: string[] = [];

    if (!paymentData.cardholderName.trim()) {
      errors.push('Cardholder name is required');
    }

    const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      errors.push('Invalid card number');
    }

    if (paymentData.expiryDate.length !== 5) {
      errors.push('Invalid expiry date');
    } else {
      const [month, year] = paymentData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      const expMonth = parseInt(month);
      const expYear = parseInt(year);
      
      if (expMonth < 1 || expMonth > 12) {
        errors.push('Invalid expiry month');
      }
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        errors.push('Card has expired');
      }
    }

    if (paymentData.cvv.length < 3 || paymentData.cvv.length > 4) {
      errors.push('Invalid CVV');
    }

    return errors;
  }, []);

  const getCardBrand = useCallback((cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    
    return 'Unknown';
  }, []);

  return {
    processPayment,
    validatePaymentData,
    getCardBrand,
    isProcessing
  };
}