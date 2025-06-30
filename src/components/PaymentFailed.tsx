import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, CreditCard, HelpCircle, Brain, Sparkles } from 'lucide-react';

interface PaymentFailedProps {
  onRetry: () => void;
  onBack: () => void;
  errorMessage?: string;
}

export const PaymentFailed: React.FC<PaymentFailedProps> = ({ onRetry, onBack, errorMessage }) => {
  const handleLogoClick = () => {
    onBack();
  };

  const commonIssues = [
    {
      issue: 'Insufficient funds',
      solution: 'Check your account balance or try a different payment method'
    },
    {
      issue: 'Card declined',
      solution: 'Contact your bank or try a different card'
    },
    {
      issue: 'Expired card',
      solution: 'Update your card information with current expiry date'
    },
    {
      issue: 'Incorrect details',
      solution: 'Double-check your card number, CVV, and billing address'
    },
    {
      issue: 'Network timeout',
      solution: 'Check your internet connection and try again'
    }
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
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
          {/* Error Animation */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 w-32 h-32 border-4 border-red-300 rounded-full animate-pulse mx-auto"></div>
            </div>
            
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment
              <span className="bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent"> Failed</span>
            </h1>
            <p className="text-xl text-gray-600">
              We couldn't process your payment. Don't worry, let's try again!
            </p>
          </div>

          {/* Error Details Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Payment Error</h3>
                <p className="text-gray-600">Transaction could not be completed</p>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="font-medium text-red-900 mb-1">Error Details:</div>
                <div className="text-red-700 text-sm">{errorMessage}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <CreditCard className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">Transaction ID</div>
                <div className="text-sm text-gray-600">#ERR-{Date.now().toString().slice(-8)}</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="font-semibold text-red-900">Status</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <RefreshCw className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-blue-900">Next Step</div>
                <div className="text-sm text-blue-700">Retry Payment</div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Common Issues & Solutions:</span>
              </h4>
              <div className="space-y-3">
                {commonIssues.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.issue}</div>
                      <div className="text-gray-600 text-sm">{item.solution}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={onRetry}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={onBack}
              className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Alternative Options */}
          <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-3xl p-8 text-white text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Still Having Issues?</h3>
            <p className="text-orange-100 mb-6">
              Try using a different payment method or contact our support team for assistance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                Try Different Card
              </button>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>

          {/* Support Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
            <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you complete your premium upgrade
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="mailto:support@dreamadvisor.app" className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <span>📧</span>
                <span>support@dreamadvisor.app</span>
              </a>
              <a href="tel:+1-555-DREAM" className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <span>📞</span>
                <span>+1 (555) DREAM-AI</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};