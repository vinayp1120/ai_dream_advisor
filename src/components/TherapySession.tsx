import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Share2, Award, Coins, ArrowLeft, Loader, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { TavusAPI, VideoGenerationResponse } from '../utils/tavusApi';
import { ElevenLabsAPI } from '../utils/elevenLabsApi';
import { OpenRouterAPI } from '../utils/openRouterApi';

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
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tavusApiRef = useRef<TavusAPI>(new TavusAPI());
  const elevenLabsRef = useRef<ElevenLabsAPI>(new ElevenLabsAPI());
  const openRouterApiRef = useRef<OpenRouterAPI>(new OpenRouterAPI());

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

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const generateTherapySession = async () => {
    try {
      setIsGenerating(true);
      setVideoError(null);
      setDebugInfo([]);
      setGenerationStage('script');
      
      addDebugInfo('🚀 Starting therapy session generation...');
      
      // Test API connections first
      addDebugInfo('🔧 Testing API connections...');
      const tavusConnected = await tavusApiRef.current.testConnection();
      addDebugInfo(`Tavus API: ${tavusConnected ? '✅ Connected' : '❌ Failed'}`);
      
      // Generate therapy script using OpenRouter LLM
      addDebugInfo('🤖 Generating therapy script with OpenRouter...');
      const script = await openRouterApiRef.current.generateTherapyScript(
        idea, 
        therapist.personality, 
        therapist.name
      );
      setGeneratedScript(script);
      addDebugInfo(`✅ Generated script (${script.length} characters)`);
      
      setGenerationStage('video');
      
      // Get available stock replicas first
      addDebugInfo('🎭 Fetching available stock replicas...');
      const stockReplicas = await tavusApiRef.current.getStockReplicas();
      addDebugInfo(`Found ${stockReplicas.length} stock replicas`);
      
      if (stockReplicas.length === 0) {
        addDebugInfo('⚠️ No stock replicas available, checking all replicas...');
        const allReplicas = await tavusApiRef.current.getAllReplicas();
        addDebugInfo(`Found ${allReplicas.length} total replicas`);
        
        if (allReplicas.length === 0) {
          throw new Error('No replicas available for video generation');
        }
      }
      
      // Get appropriate replica ID for the therapist
      const replicaId = await tavusApiRef.current.getReplicaIdForTherapist(therapist.id);
      addDebugInfo(`🎭 Selected replica: ${replicaId}`);
      
      // Validate replica before using
      const isValidReplica = await tavusApiRef.current.validateReplica(replicaId);
      if (!isValidReplica) {
        addDebugInfo(`❌ Replica ${replicaId} is invalid, using fallback`);
        throw new Error(`Invalid replica: ${replicaId}`);
      }
      
      // Generate video with Tavus using validated replica
      const videoRequest = {
        replica_id: replicaId,
        script: script,
        video_name: `${therapist.name} - Startup Therapy Session`,
        fast: true // Use fast rendering for quicker generation
      };
      
      try {
        addDebugInfo('🎬 Starting video generation with Tavus...');
        const videoResponse = await tavusApiRef.current.generateVideo(videoRequest);
        setVideoData(videoResponse);
        addDebugInfo(`✅ Video generation started: ${videoResponse.video_id}`);
        
        // Poll for video completion
        if (videoResponse.status !== 'ready') {
          addDebugInfo('🔄 Starting video status polling...');
          pollVideoStatus(videoResponse.video_id);
        } else {
          addDebugInfo('✅ Video is already ready!');
          setIsGenerating(false);
          setShowResults(true);
        }
      } catch (videoError) {
        const errorMessage = videoError instanceof Error ? videoError.message : 'Unknown video error';
        addDebugInfo(`❌ Video generation failed: ${errorMessage}`);
        setVideoError(`Video generation failed: ${errorMessage}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugInfo(`❌ Session generation failed: ${errorMessage}`);
      console.error('❌ Error generating therapy session:', error);
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
        attempts++;
        addDebugInfo(`🔄 Polling video status (${attempts}/${maxAttempts})...`);
        const status = await tavusApiRef.current.getVideoStatus(videoId);
        setVideoData(status);
        
        addDebugInfo(`📊 Video status: ${status.status}`);
        
        if (status.status === 'ready') {
          addDebugInfo('✅ Video generation completed!');
          setIsGenerating(false);
          setShowResults(true);
          return;
        }
        
        if (status.status === 'error' || attempts >= maxAttempts) {
          addDebugInfo('⚠️ Video generation timed out or failed');
          setVideoError('Video generation timed out - using demo mode');
          setIsGenerating(false);
          setShowResults(true);
          return;
        }
        
        setTimeout(poll, 10000); // Poll every 10 seconds
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addDebugInfo(`❌ Polling error: ${errorMessage}`);
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
      addDebugInfo(`🎤 Generating audio with voice: ${voiceId}`);
      const audioBlob = await elevenLabsRef.current.generateSpeech(script, voiceId);
      setAudioBlob(audioBlob);
      addDebugInfo('✅ Audio generated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown audio error';
      addDebugInfo(`❌ Audio generation failed: ${errorMessage}`);
      setAudioError(`Audio generation failed: ${errorMessage}`);
      // Continue without audio - the app should still work
    } finally {
      setIsLoadingAudio(false);
    }
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
    // Use the generated script for analysis, or fall back to default scoring
    const script = generatedScript || '';
    
    // Simple scoring based on script content and therapist personality
    let score = 5.0;
    if (script.includes('potential') || script.includes('opportunity')) score += 1.5;
    if (script.includes('challenge') || script.includes('problem')) score += 0.5;
    if (script.includes('brilliant') || script.includes('genius')) score += 2.0;
    if (script.includes('fail') || script.includes('terrible')) score -= 1.0;
    
    // Adjust based on therapist personality
    switch (therapist.personality) {
      case 'Encouraging':
        score += 1.5;
        break;
      case 'Brutally Honest':
        score -= 0.5;
        break;
      case 'Disruptive Thinker':
        score += 1.0;
        break;
    }
    
    score = Math.max(1.0, Math.min(10.0, score)); // Clamp between 1-10
    
    const verdict = score >= 8 ? 'Genius Level!' : 
                   score >= 6 ? 'Promising Potential' : 
                   score >= 4 ? 'Needs Work' : 'Back to Drawing Board';
    
    return {
      verdict,
      score: parseFloat(score.toFixed(1)),
      insights: [
        'Analysis based on AI-generated therapy session',
        'Personalized feedback from your selected therapist',
        'Comprehensive evaluation of market potential',
        'Strategic recommendations for next steps'
      ],
      advice: 'Review the detailed feedback from your AI therapist and take action on the specific recommendations provided.'
    };
  };

  const feedback = getTherapistFeedback();

  const getStageMessage = () => {
    switch (generationStage) {
      case 'script':
        return 'Creating personalized therapy script with AI...';
      case 'video':
        return 'Generating AI video with Tavus stock replica...';
      case 'audio':
        return 'Processing voice with ElevenLabs...';
      default:
        return 'Finalizing your therapy session...';
    }
  };

  if (isGenerating) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl w-full">
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
          
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader className={`w-4 h-4 ${generationStage === 'script' ? 'animate-spin text-blue-600' : 'text-green-500'}`} />
              <span className={generationStage === 'script' ? 'text-blue-600 font-medium' : 'text-green-600'}>
                {generationStage === 'script' ? 'Generating AI therapy script...' : '✓ Script generated'}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader className={`w-4 h-4 ${generationStage === 'video' ? 'animate-spin text-blue-600' : generationStage === 'audio' ? 'text-green-500' : ''}`} />
              <span className={generationStage === 'video' ? 'text-blue-600 font-medium' : generationStage === 'audio' ? 'text-green-600' : ''}>
                {generationStage === 'video' ? 'Creating AI video with stock replica...' : 
                 generationStage === 'audio' ? '✓ Video processing' : 'Creating AI video...'}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader className={`w-4 h-4 ${generationStage === 'audio' ? 'animate-spin text-blue-600' : ''}`} />
              <span className={generationStage === 'audio' ? 'text-blue-600 font-medium' : ''}>
                {generationStage === 'audio' ? 'Processing voice narration...' : 'Processing voice...'}
              </span>
            </div>
          </div>
          
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mb-6">
            <div 
              className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000" 
              style={{ 
                width: generationStage === 'script' ? '33%' : 
                       generationStage === 'video' ? '66%' : '100%' 
              }}
            ></div>
          </div>
          
          {/* Debug Information */}
          {debugInfo.length > 0 && (
            <details className="bg-gray-100 rounded-lg p-4 text-left">
              <summary className="cursor-pointer text-gray-700 font-medium mb-2 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Debug Information</span>
              </summary>
              <div className="space-y-1 text-xs text-gray-600 max-h-40 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="font-mono">{info}</div>
                ))}
              </div>
            </details>
          )}
          
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
              ) : videoData?.hosted_url && !videoError ? (
                <div className="mb-6">
                  <iframe
                    src={videoData.hosted_url}
                    className="w-full max-w-md mx-auto rounded-xl aspect-video"
                    allow="autoplay; fullscreen"
                    title="AI Therapy Session"
                  />
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
                    disabled={!audioBlob && !videoData?.download_url && !videoData?.hosted_url}
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

          {/* Generated Script Display */}
          {generatedScript && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-purple-900 mb-3">🤖 AI-Generated Therapy Script</h3>
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{generatedScript}</p>
              </div>
              <div className="mt-3 text-sm text-purple-600">
                ✨ Generated using OpenRouter API with Mistral AI • Video created with Tavus stock replica
              </div>
            </div>
          )}

          {/* Debug Information in Results */}
          {debugInfo.length > 0 && (
            <details className="bg-gray-50 rounded-2xl p-6 mb-6">
              <summary className="cursor-pointer text-gray-700 font-medium mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Technical Debug Information</span>
              </summary>
              <div className="space-y-1 text-sm text-gray-600 max-h-60 overflow-y-auto bg-white rounded-lg p-4">
                {debugInfo.map((info, index) => (
                  <div key={index} className="font-mono text-xs">{info}</div>
                ))}
              </div>
            </details>
          )}

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