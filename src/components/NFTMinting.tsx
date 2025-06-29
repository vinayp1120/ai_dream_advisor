import React, { useState } from 'react';
import { Coins, Shield, Download, Share2, ArrowLeft, Brain, Sparkles } from 'lucide-react';

interface NFTMintingProps {
  idea: string;
  score: number;
  onBack: () => void;
}

export const NFTMinting: React.FC<NFTMintingProps> = ({ idea, score, onBack }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  const handleLogoClick = () => {
    // Navigate to home - this would be handled by parent component
    onBack();
  };

  const handleMint = () => {
    setIsMinting(true);
    // Simulate minting process
    setTimeout(() => {
      setIsMinting(false);
      setIsMinted(true);
    }, 3000);
  };

  if (isMinted) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        {/* Header with Logo */}
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
            </div>
          </div>
        </header>

        <div className="pt-16 flex items-center justify-center p-4 min-h-screen">
          <div className="max-w-2xl w-full text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                NFT Minted Successfully!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your genius idea is now immortalized on the Algorand blockchain
              </p>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-purple-900 mb-2">Certificate Details</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Token ID:</span>
                    <span className="font-mono text-purple-900">#GEN-2024-001337</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Network:</span>
                    <span className="text-purple-900">Algorand</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Genius Score:</span>
                    <span className="text-purple-900 font-bold">{score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Rarity:</span>
                    <span className="text-purple-900 font-bold">Legendary</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mb-8">
                <button className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all">
                  <Download className="w-5 h-5" />
                  <span>Download Certificate</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all">
                  <Share2 className="w-5 h-5" />
                  <span>Share Achievement</span>
                </button>
              </div>

              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      {/* Header with Logo */}
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
          </div>
        </div>
      </header>

      <div className="pt-16 p-4">
        <div className="max-w-2xl mx-auto py-16">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Mint Your Genius Certificate
              </h2>
              <p className="text-lg text-gray-600">
                Immortalize your brilliant idea on the blockchain
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <Shield className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-lg font-bold">DreamAdvisor Genesis Certificate</h3>
                  <p className="text-gray-300">Verified Genius Idea • Score: {score}/10</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-sm italic leading-relaxed">"{idea}"</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Network:</span>
                  <span className="ml-2 font-semibold">Algorand</span>
                </div>
                <div>
                  <span className="text-gray-400">Rarity:</span>
                  <span className="ml-2 font-semibold text-yellow-400">Legendary</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Blockchain Certification</h4>
                  <p className="text-green-700 text-sm">Permanently verify your idea's originality</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Shareable Certificate</h4>
                  <p className="text-blue-700 text-sm">Show off your genius with a custom domain</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">Leaderboard Recognition</h4>
                  <p className="text-purple-700 text-sm">Join the hall of fame for genius ideas</p>
                </div>
              </div>
            </div>

            {isMinting ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Minting in Progress</h3>
                <p className="text-gray-600">Securing your genius on the blockchain...</p>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleMint}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all mb-4"
                >
                  Mint NFT Certificate
                </button>
                <p className="text-sm text-gray-500">
                  Minting fee: 1 ALGO (~$0.20) • Gas fees included
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};