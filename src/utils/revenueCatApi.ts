const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';

export interface RevenueCatCustomer {
  app_user_id: string;
  original_app_user_id: string;
  subscriber_attributes: Record<string, any>;
  first_seen: string;
  last_seen: string;
  management_url?: string;
  original_purchase_date?: string;
  other_purchases: Record<string, any>;
  subscriptions: Record<string, RevenueCatSubscription>;
  non_subscriptions: Record<string, any>;
  entitlements: Record<string, RevenueCatEntitlement>;
}

export interface RevenueCatSubscription {
  expires_date: string;
  purchase_date: string;
  original_purchase_date: string;
  ownership_type: string;
  period_type: string;
  store: string;
  is_sandbox: boolean;
  unsubscribe_detected_at?: string;
  billing_issues_detected_at?: string;
  grace_period_expires_date?: string;
  refunded_at?: string;
  auto_resume_date?: string;
}

export interface RevenueCatEntitlement {
  expires_date: string;
  purchase_date: string;
  product_identifier: string;
}

export interface RevenueCatOffering {
  identifier: string;
  description: string;
  metadata?: Record<string, any>;
  packages: RevenueCatPackage[];
}

export interface RevenueCatPackage {
  identifier: string;
  platform_product_identifier: string;
}

export interface RevenueCatProduct {
  identifier: string;
  display_name: string;
  description: string;
  price: number;
  price_string: string;
  currency_code: string;
  period?: string;
  period_unit?: string;
  period_number_of_units?: number;
  trial_period?: string;
  trial_period_unit?: string;
  trial_period_number_of_units?: number;
}

export class RevenueCatAPI {
  private apiKey: string;
  private appId: string = 'dreamadvisor'; // Your app identifier
  private isSimulationMode: boolean = false;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_REVENUECAT_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ RevenueCat API key not found. Subscription features will be simulated.');
      this.isSimulationMode = true;
    } else if (this.apiKey.startsWith('sk_')) {
      console.error('❌ Secret API key detected! Client-side operations require a public API key (pk_). Falling back to simulation mode.');
      console.info('💡 To fix this: Replace VITE_REVENUECAT_API_KEY in your .env file with a public key from your RevenueCat dashboard.');
      this.isSimulationMode = true;
      this.apiKey = '';
    } else if (this.apiKey.startsWith('pk_')) {
      console.info('✅ RevenueCat public API key detected. Subscription features enabled.');
      this.isSimulationMode = false;
    } else if (this.apiKey.includes('your_public_api_key_here')) {
      console.warn('⚠️ Placeholder RevenueCat API key detected. Please update with your actual public key. Using simulation mode.');
      this.isSimulationMode = true;
      this.apiKey = '';
    } else {
      console.warn('⚠️ Unrecognized RevenueCat API key format. Expected format: pk_... Using simulation mode.');
      this.isSimulationMode = true;
      this.apiKey = '';
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (this.isSimulationMode) {
      console.log('🎭 RevenueCat API call simulated:', endpoint);
      throw new Error('Simulation mode - no actual API call made');
    }

    const url = `${REVENUECAT_API_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Platform': 'web',
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`🔄 RevenueCat API: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ RevenueCat API Error: ${response.status}`, errorData);
        throw new Error(`RevenueCat API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      console.log(`✅ RevenueCat API Success:`, result);
      return result;
    } catch (error) {
      console.error(`❌ RevenueCat Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getCustomer(userId: string): Promise<RevenueCatCustomer | null> {
    if (this.isSimulationMode) {
      return this.simulateCustomer(userId);
    }

    try {
      const response = await this.makeRequest(`/subscribers/${userId}`);
      return response.subscriber;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return this.simulateCustomer(userId);
    }
  }

  async createCustomer(userId: string, email?: string): Promise<RevenueCatCustomer> {
    if (this.isSimulationMode) {
      return this.simulateCustomer(userId);
    }

    try {
      const payload: any = {
        app_user_id: userId
      };

      if (email) {
        payload.attributes = {
          '$email': {
            value: email,
            updated_at_ms: Date.now()
          }
        };
      }

      const response = await this.makeRequest(`/subscribers/${userId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return response.subscriber;
    } catch (error) {
      console.error('Error creating customer:', error);
      return this.simulateCustomer(userId);
    }
  }

  async getOfferings(): Promise<RevenueCatOffering[]> {
    if (this.isSimulationMode) {
      return this.simulateOfferings();
    }

    try {
      const response = await this.makeRequest(`/subscribers/offerings`);
      return Object.values(response.offerings || {});
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return this.simulateOfferings();
    }
  }

  async createPurchase(userId: string, productId: string, receiptData?: string): Promise<RevenueCatCustomer> {
    if (this.isSimulationMode) {
      return this.simulatePurchase(userId, productId);
    }

    try {
      const payload = {
        app_user_id: userId,
        fetch_token: receiptData || 'web_purchase_token',
        product_id: productId,
        price: productId === 'premium_monthly' ? 9.99 : 99.99,
        currency: 'USD',
        is_restore: false
      };

      const response = await this.makeRequest(`/receipts`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return response.subscriber;
    } catch (error) {
      console.error('Error creating purchase:', error);
      return this.simulatePurchase(userId, productId);
    }
  }

  async getCustomerInfo(userId: string): Promise<{
    isSubscribed: boolean;
    subscriptionTier: 'free' | 'premium' | 'enterprise';
    expiresDate?: string;
    managementUrl?: string;
  }> {
    try {
      const customer = await this.getCustomer(userId);
      
      if (!customer) {
        return {
          isSubscribed: false,
          subscriptionTier: 'free'
        };
      }

      // Check for active premium subscription
      const premiumEntitlement = customer.entitlements?.['premium'];
      const isSubscribed = premiumEntitlement && new Date(premiumEntitlement.expires_date) > new Date();

      return {
        isSubscribed: !!isSubscribed,
        subscriptionTier: isSubscribed ? 'premium' : 'free',
        expiresDate: premiumEntitlement?.expires_date,
        managementUrl: customer.management_url
      };
    } catch (error) {
      console.error('Error getting customer info:', error);
      return {
        isSubscribed: false,
        subscriptionTier: 'free'
      };
    }
  }

  generatePaymentUrl(userId: string, productId: string): string {
    // In a real implementation, this would generate a secure payment URL
    // For now, we'll simulate the payment flow
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment?user=${userId}&product=${productId}&token=${Date.now()}`;
  }

  isInSimulationMode(): boolean {
    return this.isSimulationMode;
  }

  // Simulation methods for demo/fallback
  private simulateCustomer(userId: string): RevenueCatCustomer {
    console.log('🎭 Simulating RevenueCat customer for:', userId);
    return {
      app_user_id: userId,
      original_app_user_id: userId,
      subscriber_attributes: {},
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      management_url: `https://apps.apple.com/account/subscriptions`,
      subscriptions: {},
      non_subscriptions: {},
      entitlements: {},
      other_purchases: {}
    };
  }

  private simulateOfferings(): RevenueCatOffering[] {
    console.log('🎭 Simulating RevenueCat offerings');
    return [
      {
        identifier: 'premium',
        description: 'Premium subscription with all features',
        packages: [
          {
            identifier: 'premium_monthly',
            platform_product_identifier: 'com.dreamadvisor.premium.monthly'
          },
          {
            identifier: 'premium_yearly',
            platform_product_identifier: 'com.dreamadvisor.premium.yearly'
          }
        ]
      }
    ];
  }

  private simulatePurchase(userId: string, productId: string): RevenueCatCustomer {
    console.log('🎭 Simulating RevenueCat purchase for:', userId, productId);
    const expiresDate = new Date();
    expiresDate.setMonth(expiresDate.getMonth() + (productId.includes('yearly') ? 12 : 1));

    return {
      app_user_id: userId,
      original_app_user_id: userId,
      subscriber_attributes: {},
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      management_url: `https://apps.apple.com/account/subscriptions`,
      subscriptions: {
        [productId]: {
          expires_date: expiresDate.toISOString(),
          purchase_date: new Date().toISOString(),
          original_purchase_date: new Date().toISOString(),
          ownership_type: 'PURCHASED',
          period_type: productId.includes('yearly') ? 'NORMAL' : 'NORMAL',
          store: 'WEB',
          is_sandbox: true
        }
      },
      non_subscriptions: {},
      entitlements: {
        premium: {
          expires_date: expiresDate.toISOString(),
          purchase_date: new Date().toISOString(),
          product_identifier: productId
        }
      },
      other_purchases: {}
    };
  }
}