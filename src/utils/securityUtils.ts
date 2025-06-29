export class SecurityUtils {
  /**
   * Masks an API key for safe logging/display
   */
  static maskApiKey(key: string | undefined): string {
    if (!key) return 'Not configured';
    if (key.length <= 8) return '***';
    
    const start = key.substring(0, 4);
    const end = key.substring(key.length - 4);
    const middle = '*'.repeat(Math.max(4, key.length - 8));
    
    return `${start}${middle}${end}`;
  }

  /**
   * Checks if running in a secure context
   */
  static isSecureContext(): boolean {
    return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
  }

  /**
   * Validates environment setup
   */
  static validateEnvironment(): { isSecure: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const isSecure = this.isSecureContext();

    if (!isSecure) {
      warnings.push('Application is not running in a secure context (HTTPS)');
    }

    if (import.meta.env.PROD && location.hostname === 'localhost') {
      warnings.push('Production build running on localhost');
    }

    // Check for development keys in production
    if (import.meta.env.PROD) {
      const devPatterns = ['test', 'dev', 'demo', 'localhost'];
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (supabaseUrl && devPatterns.some(pattern => supabaseUrl.includes(pattern))) {
        warnings.push('Development Supabase URL detected in production');
      }
    }

    return { isSecure, warnings };
  }

  /**
   * Sanitizes error messages to prevent key leakage
   */
  static sanitizeError(error: any): string {
    if (!error) return 'Unknown error';
    
    let message = error.message || error.toString();
    
    // Remove potential API keys from error messages
    const keyPatterns = [
      /sk_[a-zA-Z0-9]{32,}/g,
      /pk_[a-zA-Z0-9]{32,}/g,
      /[a-zA-Z0-9]{32,}/g
    ];

    keyPatterns.forEach(pattern => {
      message = message.replace(pattern, '[API_KEY_REDACTED]');
    });

    return message;
  }

  /**
   * Logs security information safely
   */
  static logSecurityInfo(): void {
    const env = this.validateEnvironment();
    
    console.group('🛡️ Security Status');
    console.log(`🔒 Secure Context: ${env.isSecure ? '✅' : '❌'}`);
    console.log(`🌍 Environment: ${import.meta.env.PROD ? 'Production' : 'Development'}`);
    console.log(`🔗 Protocol: ${location.protocol}`);
    console.log(`🏠 Hostname: ${location.hostname}`);
    
    if (env.warnings.length > 0) {
      console.group('⚠️ Security Warnings:');
      env.warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}

// Auto-check security in development
if (import.meta.env.DEV) {
  SecurityUtils.logSecurityInfo();
}