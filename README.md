# DreamAdvisor - AI Startup Therapist 🧠✨

Turn your wild startup ideas into gold with AI-powered therapy sessions! Get brutally honest, hilariously insightful feedback from our AI therapists.

## 🚀 Features

- **Multi-Modal Idea Submission** - Submit via text or voice
- **5 Unique AI Therapists** - Each with distinct personalities
- **AI-Generated Video Sessions** - Realistic avatars with voice narration
- **Blockchain Certificates** - Mint high-scoring ideas as NFTs
- **Community Leaderboard** - Compete with fellow entrepreneurs
- **Idea History Tracking** - Track your entrepreneurial journey

## 🔧 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database + Auth)
- **AI Services**: 
  - OpenRouter (Script generation)
  - Tavus (Video generation)
  - ElevenLabs (Voice synthesis)
- **Blockchain**: Algorand (NFT minting)

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd dreamadvisor
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

3. **Configure your API keys in `.env`**
```env
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional (app works in demo mode without these)
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_TAVUS_API_KEY=your_tavus_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
```

4. **Set up Supabase database**
- Create a new Supabase project
- Run the migrations in `supabase/migrations/`
- Enable Row Level Security (RLS)

5. **Start development server**
```bash
npm run dev
```

## 🔐 Security

This project follows security best practices:

- ✅ API keys are properly secured
- ✅ Environment variables are not committed
- ✅ Row Level Security (RLS) enabled
- ✅ Input validation and sanitization
- ✅ HTTPS enforced in production

**Important**: Never commit your `.env` file! It's already in `.gitignore`.

### API Key Safety
- Only `VITE_` prefixed variables are exposed to the client
- Supabase anon key is safe for client-side use
- Private keys are never exposed to the frontend
- Different keys for development/production

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

## 🚀 Deployment

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Site Settings

### Vercel
1. Import your GitHub repository
2. Framework preset: Vite
3. Add environment variables in Project Settings

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_OPENROUTER_API_KEY=your_production_openrouter_key
VITE_TAVUS_API_KEY=your_production_tavus_key
VITE_ELEVENLABS_API_KEY=your_production_elevenlabs_key
```

## 🎯 Usage

1. **Sign up/Sign in** - Create an account or sign in with Google
2. **Submit an idea** - Type or speak your startup idea
3. **Choose a therapist** - Select from 5 unique AI personalities
4. **Get therapy** - Watch your personalized AI video session
5. **Mint NFT** - High-scoring ideas can be minted as certificates
6. **Compete** - See your idea on the public leaderboard

## 🤖 AI Therapists

- **Dr. Reality Check** - Brutally honest market validation
- **Prof. Eternal Optimist** - Encouraging and motivational
- **Dr. Sarcasm** - Witty feedback with humor (Premium)
- **The Startup Sage** - Wise strategic guidance (Premium)
- **Rebel Innovator** - Disruptive thinking (Premium)

## 📊 Features by Plan

### Free Plan
- 2 free therapists
- Basic idea submission
- Community leaderboard access
- Idea history tracking

### Premium Plan ($9.99/month)
- All 5 therapists
- Unlimited sessions
- Priority video generation
- Advanced analytics
- NFT minting

## 🔧 Development

### Project Structure
```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── lib/           # Supabase client
├── types/         # TypeScript types
├── utils/         # Utility functions
└── main.tsx       # App entry point
```

### Key Components
- `Header.tsx` - Navigation and auth
- `Hero.tsx` - Landing page
- `IdeaSubmission.tsx` - Idea input form
- `TherapistSelection.tsx` - Therapist picker
- `TherapySession.tsx` - Video session player
- `Leaderboard.tsx` - Public rankings

### Database Schema
- `profiles` - User profiles and stats
- `ideas` - Submitted startup ideas
- `therapy_sessions` - AI analysis sessions
- `leaderboard_entries` - Public rankings
- `nft_certificates` - Blockchain certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- 📧 Email: support@dreamadvisor.app
- 🐛 Issues: GitHub Issues
- 💬 Discord: [Join our community]

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- OpenRouter for AI model access
- Tavus for AI video generation
- ElevenLabs for voice synthesis
- The React and TypeScript communities

---

**Ready to turn your wild ideas into gold?** 🚀✨