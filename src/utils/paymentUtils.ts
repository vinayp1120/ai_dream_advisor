export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  displayName: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string;
  bankName?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled';
  description: string;
  paymentMethod: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  refundReason?: string;
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  planId: string;
  paymentMethodId: string;
  billingAddress?: BillingAddress;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  requiresAction?: boolean;
  actionUrl?: string;
}

export class PaymentProcessor {
  private static instance: PaymentProcessor;

  private constructor() {}

  public static getInstance(): PaymentProcessor {
    if (!PaymentProcessor.instance) {
      PaymentProcessor.instance = new PaymentProcessor();
    }
    return PaymentProcessor.instance;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simulate payment processing
      await this.simulateNetworkDelay();

      // Validate payment request
      const validation = this.validatePaymentRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Simulate random failures for testing
      if (Math.random() < 0.1) {
        const errors = [
          'Card declined by issuer',
          'Insufficient funds',
          'Card expired',
          'Invalid CVV',
          'Network timeout',
          'Fraud detection triggered'
        ];
        return {
          success: false,
          error: errors[Math.floor(Math.random() * errors.length)]
        };
      }

      // Generate transaction ID
      const transactionId = this.generateTransactionId();

      return {
        success: true,
        transactionId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  async refundPayment(transactionId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    try {
      await this.simulateNetworkDelay();

      // Simulate refund processing
      const refundId = this.generateTransactionId('ref');

      return {
        success: true,
        transactionId: refundId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      };
    }
  }

  async getTransactionHistory(userId: string, limit = 50): Promise<Transaction[]> {
    // Simulate API call
    await this.simulateNetworkDelay();

    // Return mock transaction history
    return this.generateMockTransactions(limit);
  }

  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Basic length check
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  getCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'American Express';
    if (cleaned.startsWith('6011') || cleaned.startsWith('65')) return 'Discover';
    if (cleaned.startsWith('35')) return 'JCB';
    
    return 'Unknown';
  }

  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19); // Max 4 groups of 4 digits
  }

  formatExpiryDate(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  }

  validateExpiryDate(expiryDate: string): boolean {
    if (expiryDate.length !== 5) return false;

    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;
    
    return true;
  }

  private validatePaymentRequest(request: PaymentRequest): { isValid: boolean; error?: string } {
    if (request.amount <= 0) {
      return { isValid: false, error: 'Invalid amount' };
    }

    if (!request.currency || request.currency.length !== 3) {
      return { isValid: false, error: 'Invalid currency' };
    }

    if (!request.planId) {
      return { isValid: false, error: 'Plan ID is required' };
    }

    if (!request.paymentMethodId) {
      return { isValid: false, error: 'Payment method is required' };
    }

    return { isValid: true };
  }

  private generateTransactionId(prefix = 'txn'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateMockTransactions(count: number): Transaction[] {
    const transactions: Transaction[] = [];
    const statuses: Transaction['status'][] = ['completed', 'failed', 'pending', 'refunded'];
    const descriptions = [
      'Premium Monthly Subscription',
      'Premium Yearly Subscription',
      'Premium Upgrade',
      'Additional Credits'
    ];

    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 30);

      transactions.push({
        id: this.generateTransactionId(),
        date: date.toISOString().split('T')[0],
        amount: Math.random() > 0.8 ? 99.99 : 9.99,
        currency: 'USD',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        paymentMethod: 'Visa •••• 4242',
        invoiceUrl: Math.random() > 0.3 ? '#' : undefined,
        receiptUrl: '#'
      });
    }

    return transactions;
  }
}

export const paymentProcessor = PaymentProcessor.getInstance();