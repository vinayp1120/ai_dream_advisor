import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Share2, Award, Coins, ArrowLeft, Loader, Volume2, VolumeX } from 'lucide-react';
import { TavusAPI, VideoGenerationResponse } from '../utils/tavusApi';
import { ElevenLabsAPI } from '../utils/elevenLabsApi';

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
  onBack: () => void;
  onMintNFT: () => void;
}

export const TherapySession: React.FC<TherapySessionProps> = ({ idea, therapist, onBack, onMintNFT }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [videoData, setVideoData] = useState<VideoGenerationResponse | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState('script');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tavusApiRef = useRef<TavusAPI>(new TavusAPI());
  const elevenLabsRef = useRef<ElevenLabsAPI>(new ElevenLabsAPI());

  // Generate therapy script and video
  useEffect(() => {
    generateTherapySession();
  }, [idea, therapist]);

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
      setVideoError(null);
      setGenerationStage('script');
      
      // Generate therapy script based on therapist personality
      const script = generateTherapyScript(idea, therapist);
      
      // Get replica UUID for the therapist
      const replicaUuid = tavusApiRef.current.getDefaultReplicaUuid(therapist.id);
      
      setGenerationStage('video');
      
      // Generate video with Tavus
      const videoRequest = {
        replica_uuid: replicaUuid,
        script: script,
        callback_url: undefined
      };
      
      try {
        const videoResponse = await tavusApiRef.current.generateVideo(videoRequest);
        setVideoData(videoResponse);
        
        // Poll for video completion
        if (videoResponse.status !== 'completed') {
          pollVideoStatus(videoResponse.id);
        } else {
          setIsGenerating(false);
          setShowResults(true);
        }
      } catch (videoError) {
        console.error('Video generation failed:', videoError);
        setVideoError('Video generation unavailable - using demo mode');
        // Continue with demo mode
        setTimeout(() => {
          setIsGenerating(false);
          setShowResults(true);
        }, 2000);
      }
      
      setGenerationStage('audio');
      
      // Generate audio narration with error handling
      generateAudioNarration(script);
      
    } catch (error) {
      console.error('Error generating therapy session:', error);
      // Fallback to simulation
      setTimeout(() => {
        setIsGenerating(false);
        setShowResults(true);
      }, 3000);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await tavusApiRef.current.getVideoStatus(videoId);
        setVideoData(status);
        
        if (status.status === 'completed') {
          setIsGenerating(false);
          setShowResults(true);
          return;
        }
        
        if (status.status === 'failed' || attempts >= maxAttempts) {
          setVideoError('Video generation timed out - using demo mode');
          setIsGenerating(false);
          setShowResults(true);
          return;
        }
        
        attempts++;
        setTimeout(poll, 10000); // Poll every 10 seconds
      } catch (error) {
        console.error('Error polling video status:', error);
        setVideoError('Video generation failed - using demo mode');
        setIsGenerating(false);
        setShowResults(true);
      }
    };
    
    setTimeout(poll, 5000); // Start polling after 5 seconds
  };

  const generateAudioNarration = async (script: string) => {
    try {
      setIsLoadingAudio(true);
      setAudioError(null);
      
      const voiceId = getTherapistVoiceId(therapist.id);
      const audioBlob = await elevenLabsRef.current.generateSpeech(script, voiceId);
      setAudioBlob(audioBlob);
    } catch (error) {
      console.error('Error generating audio:', error);
      setAudioError('Audio generation unavailable - API key not configured');
      // Continue without audio - the app should still work
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const generateTherapyScript = (idea: string, therapist: Therapist): string => {
    const scripts = {
      'dr-reality': `
        Alright, let's talk about this idea of yours: "${idea}". 
        
        Look, I'm not here to crush your dreams, but someone needs to give you the reality check you deserve. 
        
        First off, the market validation is questionable at best. Have you actually talked to potential customers, or are you just assuming they want this? 
        
        The business model needs serious work. How exactly are you planning to make money? And please don't say "we'll figure it out later."
        
        That said, there's a kernel of something here. The core concept isn't terrible, but the execution needs to be completely rethought.
        
        My advice? Start small, validate demand, and for the love of all that's holy, talk to your customers before you build anything.
      `,
      'prof-optimist': `
        Oh my goodness, "${idea}" - what a fascinating concept! 
        
        I can see the passion and creativity behind this idea, and that's exactly what the world needs more of.
        
        You know what I love about this? It's addressing a real gap in the market. People are hungry for solutions like this.
        
        The monetization opportunities are endless! You could start with a freemium model, add premium features, maybe even licensing deals.
        
        Sure, there will be challenges, but every great startup faces obstacles. That's what makes the journey so rewarding!
        
        My advice? Start with an MVP, get user feedback, and iterate quickly. You've got something special here - I can feel it!
      `,
      'dr-sarcasm': `
        Well, well, well... "${idea}". 
        
        I have to admit, it's... creative. And by creative, I mean I've never seen anything quite like it. Whether that's good or bad remains to be seen.
        
        The complexity of execution is only slightly terrifying. But hey, if you enjoy impossible challenges, this is perfect for you.
        
        Your target market might exist somewhere in an alternate dimension, but stranger things have succeeded in Silicon Valley.
        
        Look, I'm not saying it's impossible. I'm just saying you might want to simplify it until your grandmother can explain it to her cat. Then simplify it more.
        
        But who knows? Maybe you'll prove me wrong. Wouldn't be the first time someone succeeded despite my skepticism.
      `,
      'sage-wisdom': `
        Ah, "${idea}". Let me share some wisdom from my years in the startup trenches.
        
        This reminds me of several successful companies I've seen, but with a unique twist that could be your competitive advantage.
        
        The key to success here will be execution and timing. The market is ready for disruption in this space.
        
        Focus on building a strong foundation first. Get your unit economics right, build a defensible moat, and scale methodically.
        
        Remember, every unicorn started as someone's crazy idea. The difference is in the execution and persistence.
        
        My advice? Build, measure, learn. Repeat until you find product-market fit. Then scale like your life depends on it.
      `,
      'rebel-innovator': `
        "${idea}" - now THIS is what I'm talking about! 
        
        You're not just thinking outside the box, you're setting the box on fire and dancing around the flames. I love it!
        
        This has the potential to completely disrupt the status quo. The incumbents won't see this coming.
        
        The beauty of this idea is that it challenges fundamental assumptions about how things should work.
        
        Don't let anyone tell you to play it safe. The biggest wins come from the biggest risks.
        
        My advice? Move fast and break things. Build something so revolutionary that people have no choice but to pay attention.
      `
    };

    return scripts[therapist.id as keyof typeof scripts] || scripts['dr-reality'];
  };

  const getTherapistVoiceId = (therapistId: string): string => {
    const voiceMap = {
      'dr-reality': 'pNInz6obpgDQGcFmaJgB', // Professional male voice
      'prof-optimist': 'EXAVITQu4vr4xnSDxMaL', // Warm female voice
      'dr-sarcasm': 'VR6AewLTigWG4xSOukaG', // Witty male voice
      'sage-wisdom': 'onwK4e9ZLuTAKqWW03F9', // Wise older voice
      'rebel-innovator': 'pqHfZKP75CvOlQylNhV4' // Dynamic voice
    };

    return voiceMap[therapistId as keyof typeof voiceMap] || voiceMap['dr-reality'];
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
    } else if (audioRef.current) {
      // Fallback to audio only
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const getTherapistFeedback = () => {
    const feedbacks = {
      'dr-reality': {
        verdict: 'Needs Serious Work',
        score: 3.2,
        insights: [
          'Market validation is your biggest challenge here',
          'The business model needs significant refinement',
          'Competition analysis reveals major gaps in your approach',
          'However, the core concept has potential if executed properly'
        ],
        advice: 'Focus on validating demand before building anything. Talk to 100 potential customers first.'
      },
      'prof-optimist': {
        verdict: 'Promising Potential!',
        score: 7.8,
        insights: [
          'Your passion for this idea really shines through',
          'There are multiple monetization opportunities here',
          'The target market is definitely underserved',
          'With the right execution, this could be revolutionary'
        ],
        advice: 'Start small, validate with a MVP, then scale based on user feedback. You\'ve got this!'
      },
      'dr-sarcasm': {
        verdict: 'Creatively Chaotic',
        score: 5.5,
        insights: [
          'Well, at least it\'s... original. I\'ll give you that.',
          'The execution complexity is only slightly terrifying',
          'Your target market might exist... in an alternate universe',
          'But hey, stranger things have succeeded in Silicon Valley'
        ],
        advice: 'Simplify it until your grandmother can explain it to her cat. Then simplify it more.'
      },
      'sage-wisdom': {
        verdict: 'Strategically Sound',
        score: 8.2,
        insights: [
          'This shows deep understanding of market dynamics',
          'The timing appears to be perfect for this type of solution',
          'Your approach demonstrates mature strategic thinking',
          'The scalability potential is impressive'
        ],
        advice: 'Focus on building strong foundations and defensible moats. Execute methodically.'
      },
      'rebel-innovator': {
        verdict: 'Disruptively Brilliant',
        score: 9.1,
        insights: [
          'This completely challenges conventional thinking',
          'The potential for market disruption is enormous',
          'You\'re solving problems people didn\'t know they had',
          'This could create an entirely new category'
        ],
        advice: 'Move fast and break things. Build something so revolutionary that people can\'t ignore it.'
      }
    };

    return feedbacks[therapist.id as keyof typeof feedbacks] || feedbacks['dr-reality'];
  };

  const feedback = getTherapistFeedback();

  const getStageMessage = () => {
    switch (generationStage) {
      case 'script':
        return 'Creating personalized therapy script...';
      case 'video':
        return 'Generating AI video with Tavus...';
      case 'audio':
        return 'Processing voice with ElevenLabs...';
      default:
        return 'Finalizing your therapy session...';
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
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <Loader className={`w-4 h-4 ${generationStage === 'script' ? 'animate-spin' : ''}`} />
              <span className={generationStage === 'script' ? 'text-blue-600 font-medium' : ''}>
                Creating therapy script...
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader className={`w-4 h-4 ${generationStage === 'video' ? 'animate-spin' : ''}`} />
              <span className={generationStage === 'video' ? 'text-blue-600 font-medium' : ''}>
                Generating AI video...
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader className={`w-4 h-4 ${generationStage === 'audio' ? 'animate-spin' : ''}`} />
              <span className={generationStage === 'audio' ? 'text-blue-600 font-medium' : ''}>
                Processing voice...
              </span>
            </div>
          </div>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mt-6">
            <div 
              className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000" 
              style={{ 
                width: generationStage === 'script' ? '33%' : 
                       generationStage === 'video' ? '66%' : '100%' 
              }}
            ></div>
          </div>
          
          {videoError && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">{videoError}</p>
            </div>
          )}
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
              {videoData?.download_url && !videoError ? (
                <div className="mb-6">
                  <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded-xl"
                    poster={`https://api.dicebear.com/7.x/avataaars/svg?seed=${therapist.name}`}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  >
                    <source src={videoData.download_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-8xl mb-4">{therapist.avatar}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{therapist.name}</h3>
                  <p className="text-blue-200 mb-6">{therapist.personality} Analysis</p>
                  {videoError && (
                    <div className="bg-yellow-500/20 rounded-lg p-3 mb-4">
                      <p className="text-yellow-200 text-sm">{videoError}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Audio element for narration */}
              {audioBlob && (
                <audio
                  ref={audioRef}
                  src={URL.createObjectURL(audioBlob)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  muted={isMuted}
                />
              )}
              
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={handlePlayPause}
                    disabled={!audioBlob && !videoData?.download_url}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-gray-900" />
                    ) : (
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    )}
                  </button>
                  
                  {audioBlob && (
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
                  )}
                </div>
                
                <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-white text-sm">{Math.round(progress)}% complete</p>
                
                {isLoadingAudio && (
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Loader className="w-4 h-4 animate-spin text-white" />
                    <span className="text-white text-sm">Loading audio...</span>
                  </div>
                )}

                {audioError && (
                  <div className="mt-2 p-2 bg-yellow-500/20 rounded-lg">
                    <p className="text-yellow-200 text-sm">{audioError}</p>
                  </div>
                )}
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
                    {feedback.verdict}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">{feedback.score}/10</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {feedback.insights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-blue-800">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4">Recommended Action</h3>
                  <p className="text-green-800">{feedback.advice}</p>
                </div>
              </div>

              {feedback.score >= 7 && (
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