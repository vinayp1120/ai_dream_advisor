import React, { useState, useEffect } from 'react';
import { Calendar, Download, Eye, CreditCard, CheckCircle, XCircle, Clock, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  description: string;
  paymentMethod: string;
  invoiceUrl?: string;
}

interface BillingHistoryProps {
  onBack: () => void;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({ onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');
  const { user, profile } = useAuth();

  const handleLogoClick = () => {
    onBack();
  };

  useEffect(() => {
    // Simulate loading billing history
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        {
          id: 'txn_001',
          date: '2024-12-29',
          amount: 9.99,
          status: 'completed',
          description: 'Premium Monthly Subscription',
          paymentMethod: 'Visa •••• 4242',
          invoiceUrl: '#'
        },
        {
          id: 'txn_002',
          date: '2024-11-29',
          amount: 9.99,
          status: 'completed',
          description: 'Premium Monthly Subscription',
          paymentMethod: 'Visa •••• 4242',
          invoiceUrl: '#'
        },
        {
          id: 'txn_003',
          date: '2024-11-15',
          amount: 9.99,
          status: 'failed',
          description: 'Premium Monthly Subscription',
          paymentMethod: 'Visa •••• 4242'
        },
        {
          id: 'txn_004',
          date: '2024-10-29',
          amount: 9.99,
          status: 'completed',
          description: 'Premium Monthly Subscription',
          paymentMethod: 'Visa •••• 4242',
          invoiceUrl: '#'
        }
      ];
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'refunded':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => 
    filter === 'all' || transaction.status === filter
  );

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
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
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading billing history...</p>
          </div>
        </div>
      </section>
    );
  }

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
        <div className="max-w-6xl mx-auto py-16">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Profile</span>
          </button>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Billing
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> History</span>
            </h2>
            <p className="text-lg text-gray-600">
              View and manage your payment history and invoices
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
              <p className="text-sm text-gray-600">All time</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Successful</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {transactions.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Transactions</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Next Billing</h3>
              </div>
              <p className="text-xl font-bold text-gray-900">Jan 29, 2025</p>
              <p className="text-sm text-gray-600">Premium Monthly</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200">
              {[
                { key: 'all', label: 'All Transactions' },
                { key: 'completed', label: 'Completed' },
                { key: 'failed', label: 'Failed' },
                { key: 'pending', label: 'Pending' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-6 py-2 rounded-xl transition-all ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? 'You haven\'t made any payments yet.' 
                    : `No ${filter} transactions found.`
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{transaction.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ${transaction.amount.toFixed(2)}
                        </span>
                        <div className="flex space-x-2">
                          {transaction.invoiceUrl && (
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Download All Invoices */}
          <div className="mt-8 text-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 mx-auto">
              <Download className="w-5 h-5" />
              <span>Download All Invoices</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};