import React, { useState, useRef } from 'react';
import { MessageSquare, Mic, Send, Loader, MicOff, Volume2, ArrowLeft, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { AudioRecorder } from '../utils/audioRecorder';
import { ElevenLabsAPI } from '../utils/elevenLabsApi';

interface IdeaSubmissionProps {
  onSubmit: (idea: string, method: 'text' | 'voice') => void;
  onBack: () => void;
}

export const IdeaSubmission: React.FC<IdeaSubmissionProps> = ({ onSubmit, onBack }) => {
  const [idea, setIdea] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [method, setMethod] = useState<'text' | 'voice'>('text');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elevenLabsRef = useRef<ElevenLabsAPI>(new ElevenLabsAPI());

  const handleLogoClick = () => {
    onBack();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea.trim()) {
      alert('Please enter your idea before submitting.');
      return;
    }

    if (idea.trim().length < 10) {
      alert('Please provide more details about your idea (at least 10 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting idea:', { idea: idea.substring(0, 50) + '...', method });
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the onSubmit callback
      onSubmit(idea.trim(), method);
    } catch (error) {
      console.error('Error submitting idea:', error);
      alert('Failed to submit idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRecording = async () => {
    try {
      setTranscriptionError(null);
      
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder();
      }
      
      await audioRecorderRef.current.startRecording();
      setIsRecording(true);
      setMethod('voice');
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setTranscriptionError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!audioRecorderRef.current) return;
      
      const blob = await audioRecorderRef.current.stopRecording();
      setAudioBlob(blob);
      setIsRecording(false);
      setIsTranscribing(true);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Transcribe audio
      try {
        console.log('Starting transcription...');
        const transcription = await elevenLabsRef.current.transcribeAudio(blob);
        console.log('Transcription result:', transcription);
        setIdea(transcription);
        setTranscriptionError(null);
      } catch (error) {
        console.error('Transcription failed:', error);
        setTranscriptionError('Transcription failed. Using mock transcription for demo.');
        // Use a mock transcription for demo
        const mockIdeas = [
          "A social media platform for pets where they can post their own photos and make friends with other animals in the neighborhood.",
          "An app that translates your baby's cries into specific needs like hungry, tired, or needs diaper change.",
          "A subscription service that sends you mystery ingredients and you have to create a meal without knowing what's coming.",
          "A dating app that matches people based on their Netflix viewing history and binge-watching patterns.",
          "An AI-powered plant care assistant that monitors your houseplants and sends you notifications when they need water or sunlight."
        ];
        setIdea(mockIdeas[Math.floor(Math.random() * mockIdeas.length)]);
      } finally {
        setIsTranscribing(false);
      }
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setIsTranscribing(false);
      setTranscriptionError('Recording failed. Please try again.');
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playRecording = () => {
    if (!audioBlob) return;
    
    const audio = new Audio(URL.createObjectURL(audioBlob));
    setIsPlaying(true);
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What's Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Brilliant </span>
              Idea?
            </h2>
            <p className="text-lg text-gray-600">
              Don't hold back. Our AI therapists have heard it all before.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setMethod('text')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      method === 'text' 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Type It</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleVoiceRecord}
                    disabled={isTranscribing || isSubmitting}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      method === 'voice' 
                        ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' 
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    } ${(isTranscribing || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isRecording ? (
                      <MicOff className="w-5 h-5 text-red-500 animate-pulse" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                    <span>
                      {isRecording ? `Recording... ${formatTime(recordingTime)}` : 
                       isTranscribing ? 'Processing...' : 'Speak It'}
                    </span>
                  </button>
                </div>

                {transcriptionError && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-800 text-sm">{transcriptionError}</p>
                  </div>
                )}

                {method === 'text' ? (
                  <div>
                    <textarea
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Describe your startup idea in detail... The weirder, the better! (minimum 10 characters)"
                      className="w-full h-32 p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
                      required
                      minLength={10}
                      disabled={isSubmitting}
                    />
                    <div className="mt-2 text-right">
                      <span className={`text-sm ${idea.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                        {idea.length}/10 minimum characters
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                    {isRecording ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center relative">
                          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 border-4 border-red-300 rounded-full animate-ping"></div>
                        </div>
                        <p className="text-gray-600">Recording your brilliant idea...</p>
                        <p className="text-sm text-gray-500">{formatTime(recordingTime)}</p>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Stop Recording
                        </button>
                      </div>
                    ) : isTranscribing ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                        <p className="text-gray-600">Converting speech to text...</p>
                        <p className="text-sm text-gray-500">This may take a moment...</p>
                      </div>
                    ) : idea ? (
                      <div className="space-y-4">
                        <div className="text-left bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-700 italic">"{idea}"</p>
                        </div>
                        {audioBlob && (
                          <div className="flex justify-center space-x-4">
                            <button
                              type="button"
                              onClick={playRecording}
                              disabled={isPlaying || isSubmitting}
                              className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>{isPlaying ? 'Playing...' : 'Play Recording'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={startRecording}
                              disabled={isSubmitting}
                              className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                            >
                              Record Again
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                          <Mic className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-gray-600">Click "Speak It" to record your idea</p>
                        <p className="text-sm text-gray-500">Make sure your microphone is enabled</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!idea.trim() || idea.trim().length < 10 || isRecording || isTranscribing || isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Therapy</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Your idea will remain confidential until you choose to mint it as an NFT
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};