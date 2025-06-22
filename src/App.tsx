import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IdeaSubmission } from './components/IdeaSubmission';
import { TherapistSelection } from './components/TherapistSelection';
import { TherapySession } from './components/TherapySession';
import { Leaderboard } from './components/Leaderboard';
import { NFTMinting } from './components/NFTMinting';

interface Therapist {
  id: string;
  name: string;
  personality: string;
  description: string;
  avatar: string;
  premium: boolean;
  specialty: string;
}

type AppState = 'home' | 'submission' | 'therapist' | 'session' | 'nft';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [submittedIdea, setSubmittedIdea] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  const handleStartJourney = () => {
    setCurrentState('submission');
  };

  const handleIdeaSubmit = (idea: string, method: 'text' | 'voice') => {
    setSubmittedIdea(idea);
    setCurrentState('therapist');
  };

  const handleTherapistSelect = (therapist: Therapist) => {
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
        return selectedTherapist ? (
          <TherapySession 
            idea={submittedIdea}
            therapist={selectedTherapist}
            onBack={handleBack}
            onMintNFT={handleMintNFT}
          />
        ) : null;
      case 'nft':
        return (
          <NFTMinting 
            idea={submittedIdea}
            score={7.8}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {currentState === 'home' && <Header />}
      {renderCurrentState()}
    </div>
  );
}

export default App;