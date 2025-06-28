import React, { useState, useRef } from 'react';
import { MessageSquare, Mic, Send, Loader, MicOff, Volume2 } from 'lucide-react';
import { AudioRecorder } from '../utils/audioRecorder';

interface IdeaSubmissionProps {
  onSubmit: (idea: string, method: 'text' | 'voice', audioFile?: File) => void;
  onBack: () => void;
}

export const IdeaSubmission: React.FC<IdeaSubmissionProps> = ({ onSubmit, onBack }) => {
  const [idea, setIdea] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [method, setMethod] = useState<'text' | 'voice'>('text');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'text' && idea.trim()) {
      onSubmit(idea, method);
    } else if (method === 'voice' && audioFile) {
      onSubmit(idea || 'Voice recording submitted', method, audioFile);
    }
  };

  const startRecording = async () => {
    try {
      setRecordingError(null);
      
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
      setRecordingError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!audioRecorderRef.current) return;
      
      const blob = await audioRecorderRef.current.stopRecording();
      
      // Convert blob to file
      const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
      setAudioFile(file);
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Set placeholder text for voice recording
      setIdea('Voice recording ready for analysis');
      setRecordingError(null);
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setRecordingError('Recording failed. Please try again.');
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
    if (!audioFile) return;
    
    const audio = new Audio(URL.createObjectURL(audioFile));
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
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 flex items-center justify-center p-4">
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    method === 'voice' 
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' 
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5 text-red-500 animate-pulse" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                  <span>
                    {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Speak It'}
                  </span>
                </button>
              </div>

              {recordingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{recordingError}</p>
                </div>
              )}

              {method === 'text' ? (
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your startup idea in detail... The weirder, the better!"
                  className="w-full h-32 p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
                  required
                />
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
                  ) : audioFile ? (
                    <div className="space-y-4">
                      <div className="text-left bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700 italic">Recording ready for analysis</p>
                        <p className="text-sm text-gray-500 mt-2">Duration: {formatTime(recordingTime)}</p>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <button
                          type="button"
                          onClick={playRecording}
                          disabled={isPlaying}
                          className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{isPlaying ? 'Playing...' : 'Play Recording'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={startRecording}
                          className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          Record Again
                        </button>
                      </div>
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
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={
                  (method === 'text' && !idea.trim()) || 
                  (method === 'voice' && !audioFile) || 
                  isRecording
                }
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Submit for Therapy</span>
                <Send className="w-5 h-5" />
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
    </section>
  );
};