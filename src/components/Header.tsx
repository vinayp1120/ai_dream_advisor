import React, { useState } from 'react';
import { Brain, Sparkles, User, LogOut, Settings, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { AuthModal } from './AuthModal';
import { PremiumUpgradeModal } from './PremiumUpgradeModal';

interface HeaderProps {
  onNavigate?: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const { isSubscribed, subscriptionTier } = useSubscription();

  // Listen for upgrade modal events
  React.useEffect(() => {
    const handleOpenUpgradeModal = () => setShowUpgradeModal(true);
    window.addEventListener('openUpgradeModal', handleOpenUpgradeModal);
    return () => window.removeEventListener('openUpgradeModal', handleOpenUpgradeModal);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      onNavigate?.('submission');
    } else {
      setAuthMode('signup');
      setShowAuthModal(true);
    }
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLogoClick = () => {
    onNavigate?.('home');
  };

  const handleUpgrade = () => {
    setShowUserMenu(false);
    setShowUpgradeModal(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getSubscriptionBadge = () => {
    if (!isAuthenticated) return null;
    
    if (isSubscribed || subscriptionTier === 'premium') {
      return (
        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        Free
      </span>
    );
  };

  return (
    <>
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
            
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => onNavigate?.('therapists-info')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Therapists
              </button>
              <button 
                onClick={() => scrollToSection('leaderboard')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Leaderboard
              </button>
              
              {isAuthenticated && (
                <button 
                  onClick={() => onNavigate?.('ideas')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Ideas
                </button>
              )}
              
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all"
                  >
                    <User className="w-4 h-4" />
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium">
                        {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                      </div>
                      {getSubscriptionBadge()}
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          {getSubscriptionBadge()}
                          {!isSubscribed && subscriptionTier === 'free' && (
                            <button
                              onClick={handleUpgrade}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Upgrade
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {!isSubscribed && subscriptionTier === 'free' && (
                        <button
                          onClick={handleUpgrade}
                          className="w-full text-left px-4 py-3 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center space-x-2 border-b border-gray-100"
                        >
                          <Crown className="w-4 h-4" />
                          <span>Upgrade to Premium</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate?.('profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSignIn}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full relative"
                >
                  <User className="w-5 h-5" />
                  {!isSubscribed && subscriptionTier === 'free' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};