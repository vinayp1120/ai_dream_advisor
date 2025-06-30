interface APIKeyConfig {
  name: string;
  key: string | undefined;
  required: boolean;
  description: string;
  testUrl?: string;
}

export class APIKeyValidator {
  private static instance: APIKeyValidator;
  private keyConfigs: APIKeyConfig[] = [];

  private constructor() {
    this.initializeKeyConfigs();
  }

  public static getInstance(): APIKeyValidator {
    if (!APIKeyValidator.instance) {
      APIKeyValidator.instance = new APIKeyValidator();
    }
    return APIKeyValidator.instance;
  }

  private initializeKeyConfigs(): void {
    this.keyConfigs = [
      {
        name: 'Supabase URL',
        key: import.meta.env.VITE_SUPABASE_URL,
        required: true,
        description: 'Required for database operations'
      },
      {
        name: 'Supabase Anon Key',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY,
        required: true,
        description: 'Required for authentication and database access'
      },
      {
        name: 'OpenRouter API',
        key: import.meta.env.VITE_OPENROUTER_API_KEY,
        required: false,
        description: 'For AI script generation (fallback available)'
      },
      {
        name: 'Tavus API',
        key: import.meta.env.VITE_TAVUS_API_KEY,
        required: false,
        description: 'For AI video generation (demo mode available)'
      },
      {
        name: 'ElevenLabs API',
        key: import.meta.env.VITE_ELEVENLABS_API_KEY,
        required: false,
        description: 'For voice synthesis (fallback available)'
      }
    ];
  }

  public validateKeys(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.keyConfigs.forEach(config => {
      if (config.required && !config.key) {
        errors.push(`Missing required API key: ${config.name} - ${config.description}`);
      } else if (!config.required && !config.key) {
        warnings.push(`Optional API key not configured: ${config.name} - ${config.description}`);
      } else if (config.key && this.isPlaceholder(config.key)) {
        if (config.required) {
          errors.push(`${config.name} appears to be a placeholder value`);
        } else {
          warnings.push(`${config.name} appears to be a placeholder value`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private isPlaceholder(key: string): boolean {
    const placeholderPatterns = [
      'your_',
      'placeholder',
      'example',
      'test_key',
      'demo_key'
    ];

    return placeholderPatterns.some(pattern => 
      key.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  public getKeyStatus(): { configured: number; total: number; required: number } {
    const total = this.keyConfigs.length;
    const required = this.keyConfigs.filter(config => config.required).length;
    const configured = this.keyConfigs.filter(config => 
      config.key && !this.isPlaceholder(config.key)
    ).length;

    return { configured, total, required };
  }

  public logSecurityStatus(): void {
    const validation = this.validateKeys();
    const status = this.getKeyStatus();

    console.group('🔐 API Key Security Status');
    console.log(`✅ Configured: ${status.configured}/${status.total} keys`);
    console.log(`🔑 Required: ${status.required} keys`);
    
    if (validation.errors.length > 0) {
      console.group('❌ Errors:');
      validation.errors.forEach(error => console.error(error));
      console.groupEnd();
    }

    if (validation.warnings.length > 0) {
      console.group('⚠️ Warnings:');
      validation.warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }

    if (validation.isValid) {
      console.log('🎉 All required API keys are properly configured!');
    }

    console.groupEnd();
  }
}

// Auto-validate on import in development
if (import.meta.env.DEV) {
  APIKeyValidator.getInstance().logSecurityStatus();
}