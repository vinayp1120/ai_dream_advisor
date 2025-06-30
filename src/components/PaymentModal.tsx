import React, { useState } from 'react';
import { X, CreditCard, Lock, Shield, Check, Loader, Crown, Star, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: 'monthly' | 'yearly';
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedPlan = 'monthly',
  onPaymentSuccess 
}) => {
  const [currentStep, setCurrentStep] = useState<'plan' | 'payment' | 'processing' | 'success'>('plan');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal' | 'apple' | 'google'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [plan, setPlan] = useState<'monthly' | 'yearly'>(selectedPlan);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, updateProfile } = useAuth();

  if (!isOpen) return null;

  const plans = {
    monthly: {
      id: 'premium_monthly',
      name: 'Monthly Premium',
      price: 9.99,
      period: 'month',
      savings: null,
      description: 'Perfect for trying out premium features'
    },
    yearly: {
      id: 'premium_yearly',
      name: 'Yearly Premium',
      price: 99.99,
      period: 'year',
      savings: '17% off',
      description: 'Best value for serious entrepreneurs'
    }
  };

  const currentPlan = plans[plan];
  const monthlyEquivalent = plan === 'yearly' ? (currentPlan.price / 12).toFixed(2) : currentPlan.price.toFixed(2);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('billing.')) {
      const billingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [billingField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      handleInputChange('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    if (formatted.length <= 5) {
      handleInputChange('expiryDate', formatted);
    }
  };

  const handleCvvChange = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 4) {
      handleInputChange('cvv', v);
    }
  };

  const validateForm = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = formData;
    return (
      cardNumber.replace(/\s/g, '').length >= 13 &&
      expiryDate.length === 5 &&
      cvv.length >= 3 &&
      cardholderName.trim().length > 0
    );
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update user profile to premium
      await updateProfile({ subscription_tier: 'premium' });

      setCurrentStep('success');
      
      // Call success callback after a short delay
      setTimeout(() => {
        onPaymentSuccess?.();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      setCurrentStep('payment');
    }
  };

  const renderPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Unlock premium features and accelerate your startup journey</p>
      </div>

      <div className="space-y-4">
        {Object.entries(plans).map(([key, planData]) => (
          <div
            key={key}
            onClick={() => setPlan(key as 'monthly' | 'yearly')}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              plan === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {planData.savings && (
              <div className="absolute -top-3 left-6">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {planData.savings}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{planData.name}</h3>
                <p className="text-gray-600 text-sm">{planData.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${planData.price}
                  <span className="text-lg text-gray-500 font-normal">/{planData.period}</span>
                </div>
                {key === 'yearly' && (
                  <div className="text-sm text-gray-500">
                    ${monthlyEquivalent}/month
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Premium Features Include:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'All 5 Premium Therapists',
            'Unlimited Therapy Sessions',
            'Priority Video Generation',
            'Advanced Analytics',
            'NFT Certificate Minting',
            'Early Access to New Features'
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setCurrentStep('payment')}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all"
      >
        Continue to Payment
      </button>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { id: 'card', name: 'Card', icon: CreditCard },
        { id: 'paypal', name: 'PayPal', icon: Shield },
        { id: 'apple', name: 'Apple Pay', icon: Star },
        { id: 'google', name: 'Google Pay', icon: Zap }
      ].map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setSelectedPaymentMethod(id as any)}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedPaymentMethod === id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <div className="text-sm font-medium text-gray-900">{name}</div>
        </button>
      ))}
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CreditCard className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Details</h2>
        <p className="text-gray-600">Complete your premium upgrade</p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">{currentPlan.name}</span>
          <span className="font-semibold">${currentPlan.price}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Billed {plan === 'yearly' ? 'annually' : 'monthly'}</span>
          {plan === 'yearly' && <span>Save ${((9.99 * 12) - currentPlan.price).toFixed(2)}</span>}
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between font-bold text-lg">
            <span>Total</span>
            <span>${currentPlan.price}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {renderPaymentMethods()}

      {/* Card Form */}
      {selectedPaymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => handleExpiryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      )}

      {/* Alternative Payment Methods */}
      {selectedPaymentMethod !== 'card' && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">
            {selectedPaymentMethod === 'paypal' && '💙'}
            {selectedPaymentMethod === 'apple' && '🍎'}
            {selectedPaymentMethod === 'google' && '🔵'}
          </div>
          <p className="text-gray-600 mb-6">
            You'll be redirected to {selectedPaymentMethod === 'paypal' ? 'PayPal' : selectedPaymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'} to complete your payment
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
        <Lock className="w-5 h-5 text-green-600" />
        <div className="text-sm text-green-800">
          <span className="font-medium">Secure Payment:</span> Your payment information is encrypted and secure
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep('plan')}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handlePayment}
          disabled={selectedPaymentMethod === 'card' && !validateForm()}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pay ${currentPlan.price}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h2>
      <p className="text-gray-600 mb-6">
        Please wait while we process your payment securely...
      </p>
      <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" style={{ width: '75%' }}></div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
      <p className="text-gray-600 mb-6">
        Welcome to DreamAdvisor Premium! You now have access to all premium features.
      </p>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6">
        <Crown className="w-8 h-8 mx-auto mb-2" />
        <div className="font-bold">Premium Activated</div>
        <div className="text-sm opacity-90">Enjoy unlimited access to all features</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {currentStep === 'plan' && renderPlanSelection()}
          {currentStep === 'payment' && renderPaymentForm()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};