import React, { useState } from 'react';
import { CreditCard, Plus, Edit, Trash2, Shield, ArrowLeft, Brain, Sparkles, Check } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string;
  bankName?: string;
}

interface PaymentSettingsProps {
  onBack: () => void;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({ onBack }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true
    },
    {
      id: '2',
      type: 'paypal',
      email: 'user@example.com',
      isDefault: false
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    makeDefault: false
  });

  const handleLogoClick = () => {
    onBack();
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
      setNewCard(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    if (formatted.length <= 5) {
      setNewCard(prev => ({ ...prev, expiryDate: formatted }));
    }
  };

  const handleCvvChange = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 4) {
      setNewCard(prev => ({ ...prev, cvv: v }));
    }
  };

  const handleAddCard = () => {
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      last4: newCard.cardNumber.slice(-4),
      brand: 'Visa', // In real app, detect from card number
      expiryMonth: parseInt(newCard.expiryDate.split('/')[0]),
      expiryYear: 2000 + parseInt(newCard.expiryDate.split('/')[1]),
      isDefault: newCard.makeDefault
    };

    if (newCard.makeDefault) {
      setPaymentMethods(prev => prev.map(pm => ({ ...pm, isDefault: false })));
    }

    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    setShowAddCard(false);
    setNewCard({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      makeDefault: false
    });
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  const handleRemove = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
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

      <div className="pt-16 p-4">
        <div className="max-w-4xl mx-auto py-16">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Profile</span>
          </button>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Payment
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Methods</span>
            </h2>
            <p className="text-lg text-gray-600">
              Manage your payment methods and billing preferences
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Secure & Encrypted</h3>
                <p className="text-blue-700 text-sm">
                  All payment information is encrypted and stored securely. We never store your full card details.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl mb-8">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Saved Payment Methods</h3>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Method</span>
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {method.type === 'card' ? getCardIcon(method.brand || '') : 
                         method.type === 'paypal' ? '🅿️' : '🏦'}
                      </div>
                      <div>
                        {method.type === 'card' ? (
                          <>
                            <h4 className="font-semibold text-gray-900">
                              {method.brand} •••• {method.last4}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                            </p>
                          </>
                        ) : method.type === 'paypal' ? (
                          <>
                            <h4 className="font-semibold text-gray-900">PayPal</h4>
                            <p className="text-sm text-gray-600">{method.email}</p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold text-gray-900">Bank Account</h4>
                            <p className="text-sm text-gray-600">{method.bankName}</p>
                          </>
                        )}
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mt-1">
                            <Check className="w-3 h-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Set as Default
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(method.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {paymentMethods.length === 0 && (
                <div className="p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment methods</h3>
                  <p className="text-gray-600 mb-6">Add a payment method to manage your subscription</p>
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Card Modal */}
          {showAddCard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl max-w-md w-full mx-4 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Payment Method</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={newCard.cardholderName}
                      onChange={(e) => setNewCard(prev => ({ ...prev, cardholderName: e.target.value }))}
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
                      value={newCard.cardNumber}
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
                        value={newCard.expiryDate}
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
                        value={newCard.cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="makeDefault"
                      checked={newCard.makeDefault}
                      onChange={(e) => setNewCard(prev => ({ ...prev, makeDefault: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="makeDefault" className="text-sm text-gray-700">
                      Set as default payment method
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCard}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};