import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Share2, Award, Coins, ArrowLeft, Loader, Volume2, VolumeX, AlertCircle, Bug, Brain, Sparkles } from 'lucide-react';
import { TavusAPI, VideoGenerationResponse } from '../utils/tavusApi';
import { ElevenLabsAPI } from '../utils/elevenLabsApi';
import { OpenRouterAPI } from '../utils/openRouterApi';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

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
  const [showDebug, setShowDebug] = useState(false);
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tavusApiRef = useRef<TavusAPI>(new TavusAPI());
  const elevenLabsRef = useRef<ElevenLabsAPI>(new ElevenLabsAPI());
  const openRouterApiRef = useRef<OpenRouterAPI>(new OpenRouterAPI());
  
  const { user } = useAuth();

  const handleLogoClick = () => {
    onBack();
  };

  // Generate therapy script and video
  useEffect(() => {
    if (user && idea && therapist) {
      generateTherapySession();
    }
  }, [idea, therapist, user]);

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
    console.log(`[TherapySession] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const saveIdeaToDatabase = async (): Promise<string> => {
    try {
      addDebugInfo('💾 Saving idea to database...');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Extract title from first 100 characters or use a default
      const title = idea.length > 100 ? idea.substring(0, 97) + '...' : idea;
      
      const { data, error } = await supabase
        .from('ideas')
        .insert({
          user_id: user.id,
          title: title,
          description: idea,
          submission_method: 'text',
          status: 'analyzing'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      addDebugInfo(`✅ Idea saved with ID: ${data.id}`);
      return data.id;
    } catch (error) {
      addDebugInfo(`❌ Failed to save idea: ${error}`);
      console.error('Error saving idea:', error);
      throw error;
    }
  };

  const saveTherapySession = async (ideaId: string, script: string): Promise<string> => {
    try {
      addDebugInfo('💾 Saving therapy session to database...');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert({
          idea_id: ideaId,
          user_id: user.id,
          therapist_id: therapist.id,
          therapist_name: therapist.name,
          script: script,
          status: 'generating'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      addDebugInfo(`✅ Therapy session saved with ID: ${data.id}`);
      return data.id;
    } catch (error) {
      addDebugInfo(`❌ Failed to save therapy session: ${error}`);
      console.error('Error saving therapy session:', error);
      throw error;
    }
  };

  const updateTherapySession = async (sessionId: string, updates: any) => {
    try {
      addDebugInfo('🔄 Updating therapy session...');
      
      const { error } = await supabase
        .from('therapy_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      addDebugInfo('✅ Therapy session updated');
    } catch (error) {
      addDebugInfo(`❌ Failed to update therapy session: ${error}`);
      console.error('Error updating therapy session:', error);
    }
  };

  const updateUserProfile = async (score: number) => {
    try {
      addDebugInfo('👤 Updating user profile stats...');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_sessions, total_score')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        // Continue without updating profile stats
        return;
      }

      const newTotalSessions = (profile.total_sessions || 0) + 1;
      const newTotalScore = (profile.total_score || 0) + score;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          total_sessions: newTotalSessions,
          total_score: newTotalScore
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        // Continue without updating profile stats
        return;
      }

      addDebugInfo('✅ User profile updated');
    } catch (error) {
      addDebugInfo(`❌ Failed to update user profile: ${error}`);
      console.error('Error updating user profile:', error);
    }
  };

  const addToLeaderboard = async (sessionId: string, score: number, verdict: string) => {
    try {
      if (score >= 7.0) { // Only add high-scoring ideas to leaderboard
        addDebugInfo('🏆 Adding to leaderboard...');
        
        if (!user?.id || !user?.email) {
          throw new Error('User information not available');
        }
        
        const { error } = await supabase
          .from('leaderboard_entries')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            username: user.email.split('@')[0] || 'Anonymous',
            idea_title: idea.substring(0, 100),
            score: score,
            therapist_name: therapist.name,
            nft_minted: false,
            is_public: true
          });

        if (error) {
          console.error('Error adding to leaderboard:', error);
          // Continue without adding to leaderboard
          return;
        }

        addDebugInfo('✅ Added to leaderboard');
      }
    } catch (error) {
      addDebugInfo(`❌ Failed to add to leaderboard: ${error}`);
      console.error('Error adding to leaderboard:', error);
    }
  };

  const generateTherapySession = async () => {
    try {
      setIsGenerating(true);
      setVideoError(null);
      setDebugInfo([]);
      setGenerationStage('script');
      
      addDebugInfo('🚀 Starting therapy session generation...');
      addDebugInfo(`💡 Idea: "${idea.substring(0, 50)}..."`);
      addDebugInfo(`🤖 Therapist: ${therapist.name} (${therapist.personality})`);
      
      // Save idea to database first
      let savedIdeaId: string;
      try {
        savedIdeaId = await saveIdeaToDatabase();
        setIdeaId(savedIdeaId);
      } catch (error) {
        addDebugInfo(`❌ Database save failed, continuing with demo mode: ${error}`);
        savedIdeaId = 'demo_' + Date.now();
        setIdeaId(savedIdeaId);
      }
      
      // Generate therapy script using OpenRouter LLM with therapist-specific prompt
      addDebugInfo(`🤖 Generating therapy script with ${therapist.name}...`);
      let script: string;
      try {
        script = await openRouterApiRef.current.generateTherapyScript(
          idea, 
          therapist.personality, 
          therapist.name
        );
        addDebugInfo(`✅ Generated script (${script.length} characters)`);
      } catch (error) {
        addDebugInfo(`⚠️ Script generation failed, using fallback: ${error}`);
        script = generateFallbackScript(idea, therapist);
      }
      
      setGeneratedScript(script);
      
      // Save therapy session to database
      let savedSessionId: string;
      try {
        savedSessionId = await saveTherapySession(savedIdeaId, script);
        setSessionId(savedSessionId);
      } catch (error) {
        addDebugInfo(`❌ Session save failed, continuing with demo mode: ${error}`);
        savedSessionId = 'demo_session_' + Date.now();
        setSessionId(savedSessionId);
      }
      
      setGenerationStage('video');
      
      // Try to generate video with Tavus
      try {
        addDebugInfo('🎬 Attempting video generation with Tavus...');
        const validReplicaId = await tavusApiRef.current.getValidStockReplica();
        addDebugInfo(`✅ Selected valid replica: ${validReplicaId}`);
        
        const videoRequest = {
          replica_id: validReplicaId,
          script: script,
          video_name: `${therapist.name} - Startup Therapy Session`,
          fast: true
        };
        
        const videoResponse = await tavusApiRef.current.generateVideo(videoRequest);
        setVideoData(videoResponse);
        addDebugInfo(`✅ Video generation started: ${videoResponse.video_id}`);
        
        // Update session with video info
        if (savedSessionId.startsWith('demo_')) {
          addDebugInfo('📝 Skipping database update for demo session');
        } else {
          await updateTherapySession(savedSessionId, {
            video_url: videoResponse.hosted_url || videoResponse.download_url
          });
        }
        
        // Poll for video completion if not ready
        if (videoResponse.status !== 'ready') {
          addDebugInfo('🔄 Starting video status polling...');
          pollVideoStatus(videoResponse.video_id, savedSessionId);
        } else {
          addDebugInfo('✅ Video is already ready!');
          await completeSession(savedSessionId, script);
        }
      } catch (videoError) {
        const errorMessage = videoError instanceof Error ? videoError.message : 'Unknown video error';
        addDebugInfo(`❌ Video generation failed: ${errorMessage}`);
        setVideoError(`Video generation failed: ${errorMessage}`);
        // Continue with demo mode
        await completeSession(savedSessionId, script);
      }
      
      setGenerationStage('audio');
      
      // Generate audio narration with error handling
      generateAudioNarration(script, savedSessionId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugInfo(`❌ Session generation failed: ${errorMessage}`);
      console.error('❌ Error generating therapy session:', error);
      
      // Fallback to simulation with generated script
      const fallbackScript = generateFallbackScript(idea, therapist);
      setGeneratedScript(fallbackScript);
      
      setTimeout(() => {
        setIsGenerating(false);
        setShowResults(true);
      }, 2000);
    }
  };

  const generateFallbackScript = (idea: string, therapist: Therapist): string => {
    const scripts = {
      'Brutally Honest': `Listen, I've analyzed "${idea.substring(0, 50)}..." and here's the reality check you need.

First, let's talk market validation. Have you actually spoken to potential customers? Because building something nobody wants is the fastest way to burn through your savings.

The execution complexity here is significant. You're looking at months of development, and that's assuming everything goes perfectly - which it never does.

However, there's potential here if you can nail the fundamentals. Focus on solving one specific problem really well before expanding.

My advice? Start with an MVP, validate demand, then iterate. And please, don't quit your day job until you have paying customers.

Score: 6.5/10 - Promising but needs serious validation work.`,

      'Encouraging': `What an exciting concept! "${idea.substring(0, 50)}..." shows real innovation and creativity.

I love how you're thinking about solving real problems. The market opportunity here is substantial, and your timing couldn't be better.

The monetization potential is strong - you could start with a freemium model, add premium features, and explore partnerships as you scale.

Yes, there will be challenges, but every successful entrepreneur faces obstacles. That's what makes the journey so rewarding!

Your passion for this idea really comes through, and that's half the battle. With the right execution and persistence, this could be something special.

My advice? Start building your MVP immediately. Get user feedback early and often. Trust your instincts - you're onto something here!

Score: 8.2/10 - Brilliant potential with strong market fit!`,

      'Witty & Sharp': `Well, well... "${idea.substring(0, 50)}..." - I have to say, it's certainly... creative.

The complexity of execution is only slightly terrifying, but hey, if you enjoy impossible challenges and sleepless nights, this is perfect for you.

Your target market might exist somewhere between unicorn enthusiasts and people who collect vintage air, but stranger things have succeeded in Silicon Valley.

The monetization strategy is about as clear as mud in a thunderstorm, but I'm sure you'll figure that out... eventually.

Look, I'm not saying it's impossible. I'm just saying you might want to simplify it until your grandmother can explain it to her cat.

But who knows? Maybe you'll prove me wrong and I'll be eating my words with a side of humble pie.

Score: 7.1/10 - Ambitious to the point of mild insanity, but that's not always bad.`,

      'Wise & Experienced': `Ah, "${idea.substring(0, 50)}..." - this reminds me of several breakthrough companies I've observed over the decades.

In my experience, the market timing appears favorable for this type of innovation. We're seeing similar patterns to what preceded major disruptions in adjacent industries.

The key to success here will be execution discipline and strategic patience. I've seen brilliant ideas fail due to premature scaling, and mediocre ideas succeed through methodical execution.

Your competitive moat will be critical. Focus on building defensible advantages - whether through network effects, data advantages, or operational excellence.

The path forward requires three phases: validation, optimization, then scaling. Each phase has distinct challenges and success metrics.

My strategic counsel? Build your foundation methodically. The entrepreneurs who succeed long-term are those who master the fundamentals before pursuing growth.

Score: 7.8/10 - Strong strategic potential with proper execution discipline.`,

      'Disruptive Thinker': `"${idea.substring(0, 50)}..." - NOW THIS is what I'm talking about! You're not just thinking outside the box, you're setting the box on fire!

This has the potential to completely disrupt established players. The incumbents won't see this coming, and that's exactly where you want to be.

Forget conventional wisdom. Forget "best practices." The biggest wins come from challenging everything everyone thinks they know.

The beauty of this approach is that it makes the competition irrelevant. While they're playing checkers, you're inventing a new game entirely.

Don't let anyone tell you to "be realistic." Reality is for people who lack imagination. Build something so revolutionary that people have no choice but to pay attention.

My challenge to you? Move fast and break things. Build something that makes the entire industry scramble to catch up.

Score: 8.7/10 - Revolutionary potential that could reshape everything!`
    };

    return scripts[therapist.personality as keyof typeof scripts] || scripts['Brutally Honest'];
  };

  const completeSession = async (sessionId: string, script: string) => {
    try {
      // Calculate score and verdict
      const feedback = getTherapistFeedback(script);
      
      // Update therapy session with results (only if not demo)
      if (!sessionId.startsWith('demo_')) {
        await updateTherapySession(sessionId, {
          score: feedback.score,
          verdict: feedback.verdict,
          insights: feedback.insights,
          advice: feedback.advice,
          status: 'completed'
        });
        
        // Update user profile stats
        await updateUserProfile(feedback.score);
        
        // Add to leaderboard if score is high enough
        await addToLeaderboard(sessionId, feedback.score, feedback.verdict);
        
        // Update idea status
        if (ideaId && !ideaId.startsWith('demo_')) {
          await supabase
            .from('ideas')
            .update({ status: 'completed' })
            .eq('id', ideaId);
        }
      }
      
      setIsGenerating(false);
      setShowResults(true);
    } catch (error) {
      addDebugInfo(`❌ Failed to complete session: ${error}`);
      setIsGenerating(false);
      setShowResults(true);
    }
  };

  const pollVideoStatus = async (videoId: string, sessionId: string) => {
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
          if (!sessionId.startsWith('demo_')) {
            await updateTherapySession(sessionId, {
              video_url: status.hosted_url || status.download_url
            });
          }
          await completeSession(sessionId, generatedScript);
          return;
        }
        
        if (status.status === 'error' || attempts >= maxAttempts) {
          addDebugInfo('⚠️ Video generation timed out or failed');
          setVideoError('Video generation timed out - using demo mode');
          await completeSession(sessionId, generatedScript);
          return;
        }
        
        setTimeout(poll, 10000); // Poll every 10 seconds
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addDebugInfo(`❌ Polling error: ${errorMessage}`);
        setVideoError('Video generation failed - using demo mode');
        await completeSession(sessionId, generatedScript);
      }
    };
    
    setTimeout(poll, 5000); // Start polling after 5 seconds
  };

  const generateAudioNarration = async (script: string, sessionId: string) => {
    try {
      setIsLoadingAudio(true);
      setAudioError(null);
      
      const voiceId = getTherapistVoiceId(therapist.id);
      addDebugInfo(`🎤 Generating audio with voice: ${voiceId}`);
      const audioBlob = await elevenLabsRef.current.generateSpeech(script, voiceId);
      setAudioBlob(audioBlob);
      addDebugInfo('✅ Audio generated successfully');
      
      // Update session with audio info (only if not demo)
      if (!sessionId.startsWith('demo_')) {
        await updateTherapySession(sessionId, {
          audio_url: 'generated_audio_blob' // Placeholder
        });
      }
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

  const getTherapistFeedback = (script?: string) => {
    // Use the generated script for analysis, or fall back to default scoring
    const analysisScript = script || generatedScript || '';
    
    // Simple scoring based on script content and therapist personality
    let score = 5.0;
    if (analysisScript.includes('potential') || analysisScript.includes('opportunity')) score += 1.5;
    if (analysisScript.includes('challenge') || analysisScript.includes('problem')) score += 0.5;
    if (analysisScript.includes('brilliant') || analysisScript.includes('genius')) score += 2.0;
    if (analysisScript.includes('fail') || analysisScript.includes('terrible')) score -= 1.0;
    
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
        `Analysis based on ${therapist.name}'s expertise in ${therapist.specialty}`,
        'Personalized feedback using advanced AI therapy techniques',
        'Comprehensive evaluation of market potential and execution feasibility',
        'Strategic recommendations tailored to your idea\'s unique challenges'
      ],
      advice: `Based on ${therapist.name}'s analysis, focus on the key recommendations provided in the therapy script. Take immediate action on the specific next steps outlined to move your idea forward.`
    };
  };

  const feedback = getTherapistFeedback();

  const getStageMessage = () => {
    switch (generationStage) {
      case 'script':
        return `Creating personalized therapy script with ${therapist.name}...`;
      case 'video':
        return 'Generating AI video with validated Tavus replica...';
      case 'audio':
        return 'Processing voice with ElevenLabs...';
      default:
        return 'Finalizing your therapy session...';
    }
  };

  if (isGenerating) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        {/* Header with Logo Only */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
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
            </div>
          </div>
        </header>

        <div className="pt-16 flex items-center justify-center p-4 min-h-screen">
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
                  {generationStage === 'video' ? 'Creating AI video with validated replica...' : 
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
            
            {/* Debug Information Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mx-auto"
              >
                <Bug className="w-4 h-4" />
                <span>{showDebug ? 'Hide' : 'Show'} Debug Info</span>
              </button>
            </div>
            
            {/* Debug Information */}
            {showDebug && debugInfo.length > 0 && (
              <details open className="bg-gray-100 rounded-lg p-4 text-left mb-4">
                <summary className="cursor-pointer text-gray-700 font-medium mb-2 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Real-time Debug Information</span>
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
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      {/* Header with Logo Only */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
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
          </div>
        </div>
      </header>

      <div className="pt-16 p-4">
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
                <h3 className="text-lg font-bold text-purple-900 mb-3">🤖 {therapist.name}'s Analysis</h3>
                <div className="bg-white rounded-xl p-4 border border-purple-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{generatedScript}</p>
                </div>
                <div className="mt-3 text-sm text-purple-600">
                  ✨ Generated using therapist-specific prompts • Powered by OpenRouter & Mistral AI
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
      </div>
    </section>
  );
};