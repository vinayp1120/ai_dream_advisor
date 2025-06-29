import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { APIKeyValidator } from '../utils/apiKeyValidator';
import { SecurityUtils } from '../utils/securityUtils';

export const SecurityStatus: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const [securityCheck, setSecurityCheck] = useState<any>(null);

  useEffect(() => {
    const validator = APIKeyValidator.getInstance();
    setValidation(validator.validateKeys());
    setSecurityCheck(SecurityUtils.validateEnvironment());
  }, []);

  if (!validation || !securityCheck) return null;

  // Only show in development or if there are issues
  if (import.meta.env.PROD && validation.isValid && securityCheck.isSecure) {
    return null;
  }

  const getStatusColor = () => {
    if (!validation.isValid || !securityCheck.isSecure) return 'bg-red-100 border-red-300 text-red-800';
    if (validation.warnings.length > 0) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const getStatusIcon = () => {
    if (!validation.isValid || !securityCheck.isSecure) return <AlertTriangle className="w-5 h-5" />;
    if (validation.warnings.length > 0) return <Shield className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  return (
    <div className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg border-2 shadow-lg z-50 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-semibold">Security Status</span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 hover:bg-black/10 rounded"
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {!validation.isValid && (
        <p className="text-sm mb-2">⚠️ Missing required API keys</p>
      )}

      {!securityCheck.isSecure && (
        <p className="text-sm mb-2">🔒 Insecure connection detected</p>
      )}

      {showDetails && (
        <div className="mt-3 space-y-2 text-xs">
          {validation.errors.length > 0 && (
            <div>
              <p className="font-medium">Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div>
              <p className="font-medium">Warnings:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {securityCheck.warnings.length > 0 && (
            <div>
              <p className="font-medium">Security Warnings:</p>
              <ul className="list-disc list-inside space-y-1">
                {securityCheck.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-current/20">
            <p className="font-medium">Environment: {import.meta.env.PROD ? 'Production' : 'Development'}</p>
            <p>Protocol: {location.protocol}</p>
            <p>Host: {location.hostname}</p>
          </div>
        </div>
      )}
    </div>
  );
};