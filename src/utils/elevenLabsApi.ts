const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
}

export class ElevenLabsAPI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ELEVENLABS_API_KEY;
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found. Voice features will be disabled.');
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      // Convert webm to mp3 for better compatibility
      const audioBuffer = await this.convertAudioFormat(audioBlob);
      
      // For transcription, we'll use a mock implementation since ElevenLabs doesn't provide transcription
      // In production, you'd use OpenAI Whisper API or similar service
      console.log('Audio transcription requested - using mock implementation for demo');
      return this.mockTranscription();

    } catch (error) {
      console.error('Transcription error:', error);
      // Return mock transcription for demo purposes
      return this.mockTranscription();
    }
  }

  private async convertAudioFormat(audioBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to WAV format for better compatibility
          const wavBlob = this.audioBufferToWav(audioBuffer);
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read audio file'));
      fileReader.readAsArrayBuffer(audioBlob);
    });
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private mockTranscription(): string {
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

  async generateSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Speech generation error:', error);
      throw new Error('Failed to generate speech');
    }
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }
}