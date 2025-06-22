import React, { useState } from 'react';
import { MessageSquare, Mic, Send, Loader } from 'lucide-react';

interface IdeaSubmissionProps {
  onSubmit: (idea: string, method: 'text' | 'voice') => void;
  onBack: () => void;
}

export const IdeaSubmission: React.FC<IdeaSubmissionProps> = ({ onSubmit, onBack }) => {
  const [idea, setIdea] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [method, setMethod] = useState<'text' | 'voice'>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea, method);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    setMethod('voice');
    // Simulate voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setIdea("A social media platform for pets where they can post their own photos and make friends with other animals in the neighborhood. Pet owners can manage their profiles but the pets are the main users.");
      }, 3000);
    }
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
                  <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
                  <span>{isRecording ? 'Recording...' : 'Speak It'}</span>
                </button>
              </div>

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
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <Loader className="w-8 h-8 text-red-500 animate-spin" />
                      </div>
                      <p className="text-gray-600">Listening to your brilliant idea...</p>
                    </div>
                  ) : idea ? (
                    <div className="text-left bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 italic">"{idea}"</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <Mic className="w-8 h-8 text-orange-500" />
                      </div>
                      <p className="text-gray-600">Click "Speak It" to record your idea</p>
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
                disabled={!idea.trim() || isRecording}
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