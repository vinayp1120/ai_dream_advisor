import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Share2, Award, Coins, ArrowLeft, Loader, Volume2, VolumeX } from 'lucide-react';
import { apiClient, SessionResponse } from '../utils/apiClient';

interface Therapist {
  id: string;
  name: string;
  personality: string;
  description: string;
  avatar: string;
  premium: boolean;
  specialty: string;
}

interface TherapySessionProps {
  idea: string;
  therapist: Therapist;
  audioFile?: File;
  onBack: () => void;
  onMintNFT: () => void;
}

export const TherapySession: React.FC<TherapySessionProps> = ({ 
  idea, 
  therapist, 
  audioFile, 
  onBack, 
  onMintNFT 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionData, setSessionData] = useState<SessionResponse | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState('processing');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate therapy session
  useEffect(() => {
    generateTherapySession();
  }, [idea, therapist, audioFile]);

  // Handle video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && videoRef.current) {
      interval = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration;
          if (duration > 0) {
            setProgress((currentTime / duration) * 100);
          }
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const generateTherapySession = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGenerationStage('processing');
      
      console.log('Starting therapy session generation...');
      
      // Create session request
      const sessionRequest = {
        text: audioFile ? undefined : idea,
        audio: audioFile,
        therapist: therapist.id
      };

      setGenerationStage('analyzing');
      
      // Call the API
      const response = await apiClient.createSession(sessionRequest);
      
      console.log('Session response received:', response);
      
      setSessionData(response);
      setGenerationStage('complete');
      
      // Show results after a brief delay
      setTimeout(() => {
        setIsGenerating(false);
        setShowResults(true);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating therapy session:', error);
      setGenerationError(error instanceof Error ? error.message : 'Session generation failed');
      
      // Fallback to mock data for demo
      const mockResponse: SessionResponse = {
        transcript: idea,
        script: generateMockScript(idea, therapist.id),
        score: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6.0-10.0
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        therapist: {
          id: therapist.id,
          name: therapist.name,
          personality: therapist.personality
        },
        insights: generateMockInsights(therapist.id),
        advice: generateMockAdvice(therapist.id)
      };
      
      setSessionData(mockResponse);
      
      setTimeout(() => {
        setIsGenerating(false);
        setShowResults(true);
      }, 2000);
    }
  };

  const generateMockScript = (idea: string, therapistId: string): string => {
    const scripts = {
      'dr-reality': `Let's be honest about "${idea}". The market validation is questionable, but there's potential if you focus on execution.`,
      'prof-optimist': `"${idea}" is fascinating! I see tremendous potential and multiple monetization opportunities here.`,
      'dr-sarcasm': `Well, "${idea}" is... creative. The execution complexity is only slightly terrifying, but stranger things have succeeded.`,
      'sage-wisdom': `"${idea}" reminds me of successful companies I've seen. The key will be execution and timing.`,
      'rebel-innovator': `"${idea}" - now THIS is disruptive thinking! You're challenging fundamental assumptions.`
    };
    
    return scripts[therapistId as keyof typeof scripts] || scripts['dr-reality'];
  };

  const generateMockInsights = (therapistId: string): string[] => {
    const insights = {
      'dr-reality': [
        'Market validation is your biggest challenge',
        'Business model needs refinement',
        'Core concept has potential with proper execution'
      ],
      'prof-optimist': [
        'Multiple monetization opportunities available',
        'Target market is underserved',
        'Strong potential for viral growth'
      ],
      'dr-sarcasm': [
        'Execution complexity is... ambitious',
        'Target market might exist in alternate universe',
        'But hey, stranger things have succeeded'
      ],
      'sage-wisdom': [
        'Timing appears favorable for this solution',
        'Scalability potential is impressive',
        'Focus on building defensible moats'
      ],
      'rebel-innovator': [
        'Potential for massive market disruption',
        'Challenges conventional thinking',
        'Could create entirely new category'
      ]
    };
    
    return insights[therapistId as keyof typeof insights] || insights['dr-reality'];
  };

  const generateMockAdvice = (therapistId: string): string => {
    const advice = {
      'dr-reality': 'Focus on validating demand before building. Talk to customers first.',
      'prof-optimist': 'Start with MVP, get user feedback, then scale. You\'ve got this!',
      'dr-sarcasm': 'Simplify until your grandmother can explain it to her cat.',
      'sage-wisdom': 'Build strong foundations and execute methodically.',
      'rebel-innovator': 'Move fast and break things. Be revolutionary.'
    };
    
    return advice[therapistId as keyof typeof advice] || advice['dr-reality'];
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
      } else {
        videoRef.current.play();
        if (audioRef.current && !isMuted) audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const getStageMessage = () => {
    switch (generationStage) {
      case 'processing':
        return 'Processing your idea...';
      case 'analyzing':
        return 'AI therapist analyzing your concept...';
      case 'complete':
        return 'Finalizing your therapy session...';
      default:
        return 'Generating personalized feedback...';
    }
  };

  if (isGenerating) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 mx-auto relative">
            <div className="text-6xl animate-pulse">{therapist.avatar}</div>
            <div className="absolute inset-0 border-4 border-blue-300 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {therapist.name} is analyzing your idea...
          </h2>
          <p className="text-gray-600 mb-6">
            {getStageMessage()}
          </p>
          
          {generationError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">{generationError}</p>
              <p className="text-yellow-600 text-xs mt-1">Using demo mode...</p>
            </div>
          )}
          
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
            <div 
              className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000" 
              style={{ 
                width: generationStage === 'processing' ? '33%' : 
                       generationStage === 'analyzing' ? '66%' : '100%' 
              }}
            ></div>
          </div>
        </div>
      </section>
    );
  }

  if (!sessionData) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to generate session data</p>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-800">
            Go Back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Therapist Selection</span>
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
          {/* Video Player Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
            <div className="relative z-10">
              {sessionData.videoUrl ? (
                <div className="mb-6">
                  <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded-xl"
                    poster={`https://api.dicebear.com/7.x/avataaars/svg?seed=${therapist.name}`}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    muted={isMuted}
                  >
                    <source src={sessionData.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-8xl mb-4">{therapist.avatar}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{therapist.name}</h3>
                  <p className="text-blue-200 mb-6">{therapist.personality} Analysis</p>
                </div>
              )}
              
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-gray-900" />
                    ) : (
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-6 h-6 text-white" />
                    ) : (
                      <Volume2 className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
                
                <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-white text-sm">{Math.round(progress)}% complete</p>
              </div>

              <div className="flex justify-center space-x-4">
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {showResults && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Therapy Session Results</h2>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold">
                    {sessionData.therapist.personality}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">{sessionData.score}/10</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {sessionData.insights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-blue-800">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4">Recommended Action</h3>
                  <p className="text-green-800">{sessionData.advice}</p>
                </div>
              </div>

              {sessionData.score >= 7 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">🎉 Genius Alert!</h3>
                  <p className="mb-4">Your idea scored high enough to mint as an NFT certificate!</p>
                  <button
                    onClick={onMintNFT}
                    className="flex items-center space-x-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all mx-auto"
                  >
                    <Coins className="w-5 h-5" />
                    <span>Mint NFT Certificate</span>
                  </button>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Try Another Idea
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};