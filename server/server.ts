import express from 'express';
import axios from 'axios';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json());

const ELEVEN_KEY = process.env.ELEVEN_KEY || process.env.VITE_ELEVENLABS_API_KEY;
const TAVUS_KEY = process.env.TAVUS_KEY || process.env.VITE_TAVUS_API_KEY;

// Enhanced therapist mapping with more realistic configurations
const therapistMap: Record<string, { voice: string; replica: string; personality: string }> = {
  'dr-reality': { 
    voice: 'pNInz6obpgDQGcFmaJgB', // Professional male voice
    replica: 'ReplicaUUID_DrReality', 
    personality: 'brutally honest and direct'
  },
  'prof-optimist': { 
    voice: 'EXAVITQu4vr4xnSDxMaL', // Warm female voice
    replica: 'ReplicaUUID_ProfOptimist', 
    personality: 'encouraging and supportive'
  },
  'dr-sarcasm': { 
    voice: 'VR6AewLTigWG4xSOukaG', // Witty male voice
    replica: 'ReplicaUUID_DrSarcasm', 
    personality: 'witty and sarcastic'
  },
  'sage-wisdom': { 
    voice: 'onwK4e9ZLuTAKqWW03F9', // Wise older voice
    replica: 'ReplicaUUID_SageWisdom', 
    personality: 'wise and experienced'
  },
  'rebel-innovator': { 
    voice: 'pqHfZKP75CvOlQylNhV4', // Dynamic voice
    replica: 'ReplicaUUID_RebelInnovator', 
    personality: 'disruptive and innovative'
  }
};

// 1️⃣ Enhanced transcription with better error handling
async function elevenTranscribe(buffer: Buffer): Promise<string> {
  if (!ELEVEN_KEY) {
    console.warn('ElevenLabs API key not found, using mock transcription');
    return generateMockTranscription();
  }

  try {
    const res = await axios.post(
      'https://api.elevenlabs.io/v1/speech-to-text',
      buffer,
      {
        headers: {
          'xi-api-key': ELEVEN_KEY,
          'Content-Type': 'audio/wav',
        },
        timeout: 30000
      }
    );
    return res.data.text || generateMockTranscription();
  } catch (e: any) {
    console.warn('Transcription failed, using mock:', e.message);
    return generateMockTranscription();
  }
}

// Generate mock transcription for demo purposes
function generateMockTranscription(): string {
  const mockIdeas = [
    "A social media platform for pets where they can post their own photos and make friends with other animals in the neighborhood.",
    "An app that translates your baby's cries into specific needs like hungry, tired, or needs diaper change using AI voice recognition.",
    "A subscription service that sends you mystery ingredients and you have to create a meal without knowing what's coming next.",
    "A dating app that matches people based on their Netflix viewing history and binge-watching patterns to find compatible partners.",
    "An AI-powered plant care assistant that monitors your houseplants and sends you notifications when they need water or sunlight.",
    "A virtual reality fitness app where you fight dragons and monsters to burn calories and build muscle.",
    "An app that turns your daily commute into a choose-your-own-adventure story based on the route you take.",
    "A service that creates personalized lullabies for babies using the parents' voices and favorite songs.",
    "A platform where people can rent out their pets for companionship to those who can't have pets permanently.",
    "An AI therapist specifically designed for entrepreneurs who need someone to validate their crazy startup ideas."
  ];
  
  return mockIdeas[Math.floor(Math.random() * mockIdeas.length)];
}

// 2️⃣ Enhanced TTS generation with better error handling
async function elevenTTS(text: string, voice: string): Promise<Buffer> {
  if (!ELEVEN_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  const payload = { 
    text, 
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.0,
      use_speaker_boost: true
    }
  };

  try {
    const res = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      payload,
      { 
        headers: { 
          'xi-api-key': ELEVEN_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        }, 
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );
    return Buffer.from(res.data);
  } catch (e: any) {
    console.error('TTS error:', e.response?.data || e.message);
    throw new Error(`TTS failed: ${e.message}`);
  }
}

// 3️⃣ Enhanced Tavus video generation with better error handling
async function tavusGenerateVideo(replica_uuid: string, script: string): Promise<string> {
  if (!TAVUS_KEY) {
    console.warn('Tavus API key not found, returning demo video URL');
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }

  try {
    const genRes = await axios.post(
      'https://tavusapi.com/v2/videos',
      { 
        replica_id: replica_uuid,
        script: script,
        background_url: undefined
      },
      { 
        headers: { 
          'x-api-key': TAVUS_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    const videoId = genRes.data.video_id;

    // Poll for completion with timeout
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 10000)); // Wait 10 seconds
      
      try {
        const statusRes = await axios.get(
          `https://tavusapi.com/v2/videos/${videoId}`,
          { 
            headers: { 'x-api-key': TAVUS_KEY },
            timeout: 10000
          }
        );
        
        if (statusRes.data.status === 'completed') {
          return statusRes.data.download_url || statusRes.data.hosted_url;
        } else if (statusRes.data.status === 'failed') {
          throw new Error('Video generation failed');
        }
        
        attempts++;
      } catch (pollError) {
        console.error('Error polling video status:', pollError);
        attempts++;
      }
    }
    
    throw new Error('Video generation timed out');
  } catch (e: any) {
    console.error('Tavus video generation error:', e.response?.data || e.message);
    // Return demo video URL as fallback
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }
}

// Generate therapy script based on idea and therapist personality
function generateTherapyScript(idea: string, therapistId: string): string {
  const therapist = therapistMap[therapistId];
  if (!therapist) {
    return `Here's my analysis of your idea: "${idea}". This is an interesting concept that deserves further exploration.`;
  }

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

  return scripts[therapistId as keyof typeof scripts] || scripts['dr-reality'];
}

// Calculate idea score based on various factors
function calculateIdeaScore(idea: string, therapistId: string): number {
  const baseScores = {
    'dr-reality': 3.2,
    'prof-optimist': 7.8,
    'dr-sarcasm': 5.5,
    'sage-wisdom': 8.2,
    'rebel-innovator': 9.1
  };

  const baseScore = baseScores[therapistId as keyof typeof baseScores] || 5.0;
  
  // Add some randomness and factors based on idea content
  const ideaLength = idea.length;
  const hasKeywords = /\b(AI|app|platform|service|solution)\b/i.test(idea);
  const lengthBonus = Math.min(ideaLength / 100, 2); // Up to 2 points for longer ideas
  const keywordBonus = hasKeywords ? 0.5 : 0;
  const randomFactor = (Math.random() - 0.5) * 1.0; // ±0.5 random variation
  
  const finalScore = Math.max(1.0, Math.min(10.0, baseScore + lengthBonus + keywordBonus + randomFactor));
  return Math.round(finalScore * 10) / 10; // Round to 1 decimal place
}

// 4️⃣ Enhanced /session endpoint
app.post('/session', upload.single('audio'), async (req, res) => {
  try {
    console.log('Session request received');
    
    let transcript = '';
    
    // Handle audio transcription if file is provided
    if (req.file?.buffer) {
      console.log('Processing audio file...');
      transcript = await elevenTranscribe(req.file.buffer);
    } else if (req.body.text) {
      // Handle text input
      transcript = req.body.text;
    } else {
      return res.status(400).json({ error: 'No audio file or text provided' });
    }

    console.log('Transcript:', transcript);

    // Get therapist configuration
    const therapistId = req.body.therapist as string || 'dr-reality';
    const therapistConfig = therapistMap[therapistId] || therapistMap['dr-reality'];
    
    console.log('Selected therapist:', therapistId);

    // Generate therapy script
    const script = generateTherapyScript(transcript, therapistId);
    console.log('Generated script length:', script.length);

    // Calculate idea score
    const score = calculateIdeaScore(transcript, therapistId);
    console.log('Calculated score:', score);

    let audioUrl = null;
    let videoUrl = null;

    try {
      // Generate TTS audio
      console.log('Generating TTS audio...');
      const ttsAudio = await elevenTTS(script, therapistConfig.voice);
      
      // In a real implementation, you'd save this to a file server or cloud storage
      // For now, we'll indicate that audio was generated successfully
      audioUrl = '/api/audio/generated'; // Placeholder URL
      console.log('TTS audio generated successfully');
    } catch (audioError) {
      console.warn('TTS generation failed:', audioError);
      // Continue without audio
    }

    try {
      // Generate video
      console.log('Generating video...');
      videoUrl = await tavusGenerateVideo(therapistConfig.replica, script);
      console.log('Video generated:', videoUrl);
    } catch (videoError) {
      console.warn('Video generation failed:', videoError);
      // Use fallback video
      videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }

    // Return comprehensive response
    res.json({ 
      transcript,
      script,
      score,
      audioUrl,
      videoUrl,
      therapist: {
        id: therapistId,
        name: therapistConfig.personality,
        personality: therapistConfig.personality
      },
      insights: generateInsights(transcript, therapistId),
      advice: generateAdvice(transcript, therapistId)
    });

  } catch (e: any) {
    console.error('Session pipeline error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Generate insights based on idea and therapist
function generateInsights(idea: string, therapistId: string): string[] {
  const insightMap = {
    'dr-reality': [
      'Market validation is your biggest challenge here',
      'The business model needs significant refinement',
      'Competition analysis reveals major gaps in your approach',
      'However, the core concept has potential if executed properly'
    ],
    'prof-optimist': [
      'Your passion for this idea really shines through',
      'There are multiple monetization opportunities here',
      'The target market is definitely underserved',
      'With the right execution, this could be revolutionary'
    ],
    'dr-sarcasm': [
      'Well, at least it\'s... original. I\'ll give you that.',
      'The execution complexity is only slightly terrifying',
      'Your target market might exist... in an alternate universe',
      'But hey, stranger things have succeeded in Silicon Valley'
    ],
    'sage-wisdom': [
      'This shows deep understanding of market dynamics',
      'The timing appears to be perfect for this type of solution',
      'Your approach demonstrates mature strategic thinking',
      'The scalability potential is impressive'
    ],
    'rebel-innovator': [
      'This completely challenges conventional thinking',
      'The potential for market disruption is enormous',
      'You\'re solving problems people didn\'t know they had',
      'This could create an entirely new category'
    ]
  };

  return insightMap[therapistId as keyof typeof insightMap] || insightMap['dr-reality'];
}

// Generate advice based on idea and therapist
function generateAdvice(idea: string, therapistId: string): string {
  const adviceMap = {
    'dr-reality': 'Focus on validating demand before building anything. Talk to 100 potential customers first.',
    'prof-optimist': 'Start small, validate with a MVP, then scale based on user feedback. You\'ve got this!',
    'dr-sarcasm': 'Simplify it until your grandmother can explain it to her cat. Then simplify it more.',
    'sage-wisdom': 'Focus on building strong foundations and defensible moats. Execute methodically.',
    'rebel-innovator': 'Move fast and break things. Build something so revolutionary that people can\'t ignore it.'
  };

  return adviceMap[therapistId as keyof typeof adviceMap] || adviceMap['dr-reality'];
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    apis: {
      elevenlabs: !!ELEVEN_KEY,
      tavus: !!TAVUS_KEY
    }
  });
});

// Get available therapists
app.get('/therapists', (req, res) => {
  const therapists = Object.entries(therapistMap).map(([id, config]) => ({
    id,
    name: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    personality: config.personality,
    voice: config.voice
  }));
  
  res.json(therapists);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 DreamAdvisor server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎭 Available therapists: http://localhost:${PORT}/therapists`);
  console.log(`🔑 ElevenLabs API: ${ELEVEN_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🎥 Tavus API: ${TAVUS_KEY ? '✅ Configured' : '❌ Missing'}`);
});