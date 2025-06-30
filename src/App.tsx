import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IdeaSubmission } from './components/IdeaSubmission';
import { TherapistSelection } from './components/TherapistSelection';
import { TherapySession } from './components/TherapySession';
import { Leaderboard } from './components/Leaderboard';
import { NFTMinting } from './components/NFTMinting';
import { ProfileSettings } from './components/ProfileSettings';
import { IdeasHistory } from './components/IdeasHistory';
import { TherapistsInfo } from './components/TherapistsInfo';
import { SecurityStatus } from './components/SecurityStatus';
import { useAuth } from './hooks/useAuth';

interface Therapist {
  id: string;
  name: string;
  personality: string;
  description: string;
  avatar: string;
  premium: boolean;
  specialty: string;
}

type AppState = 'home' | 'submission' | 'therapist' | 'session' | 'nft' | 'profile' | 'ideas' | 'therapists-info';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [submittedIdea, setSubmittedIdea] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const { isAuthenticated, loading } = useAuth();

  const handleStartJourney = () => {
    if (isAuthenticated) {
      setCurrentState('submission');
    } else {
      // Auth modal will be handled by Hero component
      console.log('User needs to authenticate first');
    }
  };

  const handleIdeaSubmit = (idea: string, method: 'text' | 'voice') => {
    console.log('App: Idea submitted:', { idea: idea.substring(0, 50) + '...', method });
    
    if (!idea || idea.trim().length < 10) {
      console.error('Invalid idea submitted');
      return;
    }
    
    setSubmittedIdea(idea.trim());
    setCurrentState('therapist');
  };

  const handleTherapistSelect = (therapist: Therapist) => {
    console.log('App: Therapist selected:', therapist.name);
    
    if (!therapist || !submittedIdea) {
      console.error('Invalid therapist or missing idea');
      return;
    }
    
    setSelectedTherapist(therapist);
    setCurrentState('session');
  };

  const handleMintNFT = () => {
    setCurrentState('nft');
  };

  const handleBack = () => {
    if (currentState === 'submission') {
      setCurrentState('home');
    } else if (currentState === 'therapist') {
      setCurrentState('submission');
    } else if (currentState === 'session') {
      setCurrentState('therapist');
    } else if (currentState === 'nft') {
      setCurrentState('session');
    } else if (currentState === 'profile' || currentState === 'ideas' || currentState === 'therapists-info') {
      setCurrentState('home');
    }
  };

  const handleNavigate = (section: string) => {
    switch (section) {
      case 'submission':
        if (isAuthenticated) {
          setCurrentState('submission');
        }
        break;
      case 'profile':
        if (isAuthenticated) {
          setCurrentState('profile');
        }
        break;
      case 'ideas':
        if (isAuthenticated) {
          setCurrentState('ideas');
        }
        break;
      case 'therapists-info':
        setCurrentState('therapists-info');
        break;
      case 'home':
        setCurrentState('home');
        // Reset state when going home
        setSubmittedIdea('');
        setSelectedTherapist(null);
        break;
      default:
        // For other sections, scroll to them on home page
        if (currentState !== 'home') {
          setCurrentState('home');
          // Reset state when going home
          setSubmittedIdea('');
          setSelectedTherapist(null);
          // Wait for state change then scroll
          setTimeout(() => {
            const element = document.getElementById(section);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } else {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
        break;
    }
  };

  const renderCurrentState = () => {
    switch (currentState) {
      case 'home':
        return (
          <>
            <Hero onStartJourney={handleStartJourney} />
            <Leaderboard />
          </>
        );
      case 'submission':
        return (
          <IdeaSubmission 
            onSubmit={handleIdeaSubmit} 
            onBack={handleBack}
          />
        );
      case 'therapist':
        return (
          <TherapistSelection 
            onSelect={handleTherapistSelect} 
            onBack={handleBack}
          />
        );
      case 'session':
        return selectedTherapist && submittedIdea ? (
          <TherapySession 
            idea={submittedIdea}
            therapist={selectedTherapist}
            onBack={handleBack}
            onMintNFT={handleMintNFT}
          />
        ) : (
          // Fallback if data is missing
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Error</h2>
              <p className="text-gray-600 mb-6">Missing required data for therapy session.</p>
              <button
                onClick={() => setCurrentState('home')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        );
      case 'nft':
        return (
          <NFTMinting 
            idea={submittedIdea}
            score={7.8}
            onBack={handleBack}
          />
        );
      case 'profile':
        return (
          <ProfileSettings onBack={handleBack} />
        );
      case 'ideas':
        return (
          <IdeasHistory onBack={handleBack} />
        );
      case 'therapists-info':
        return (
          <TherapistsInfo onBack={handleBack} />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DreamAdvisor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {currentState === 'home' && <Header onNavigate={handleNavigate} />}
      {renderCurrentState()}
      <SecurityStatus />
    </div>
  );
}

export default App;