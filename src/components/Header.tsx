import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-600" />
              <Sparkles className="w-4 h-4 text-orange-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DreamAdvisor
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
            <a href="#therapists" className="text-gray-700 hover:text-blue-600 transition-colors">Therapists</a>
            <a href="#leaderboard" className="text-gray-700 hover:text-blue-600 transition-colors">Leaderboard</a>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all">
              Get Started
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};