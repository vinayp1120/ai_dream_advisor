const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_API_URL = 'https://tavusapi.com/v2';

export interface TavusPersona {
  persona_id: string;
  persona_name: string;
  callback_url?: string;
}

export interface VideoGenerationRequest {
  replica_id: string;
  script: string;
  background_url?: string;
  persona_id?: string;
}

export interface VideoGenerationResponse {
  video_id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  download_url?: string;
  callback_url?: string;
}

export class TavusAPI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || TAVUS_API_KEY;
    if (!this.apiKey) {
      console.warn('Tavus API key not found. Video generation will be simulated.');
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      // Simulate video generation for demo
      return this.simulateVideoGeneration(request);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Video generation error:', error);
      return this.simulateVideoGeneration(request);
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return this.simulateVideoStatus(videoId);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/videos/${videoId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video status:', error);
      return this.simulateVideoStatus(videoId);
    }
  }

  private async simulateVideoGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const videoId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      video_id: videoId,
      status: 'queued'
    };
  }

  private async simulateVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    // Simulate video generation progress
    const elapsed = Date.now() - parseInt(videoId.split('_')[1]);
    
    if (elapsed < 3000) {
      return {
        video_id: videoId,
        status: 'generating'
      };
    }
    
    return {
      video_id: videoId,
      status: 'completed',
      download_url: `https://example.com/videos/${videoId}.mp4`
    };
  }

  async getPersonas(): Promise<TavusPersona[]> {
    if (!this.apiKey) {
      return [
        { persona_id: 'dr-reality', persona_name: 'Dr. Reality Check' },
        { persona_id: 'prof-optimist', persona_name: 'Prof. Eternal Optimist' },
        { persona_id: 'dr-sarcasm', persona_name: 'Dr. Sarcasm' }
      ];
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/personas`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      return data.personas || [];
    } catch (error) {
      console.error('Error fetching personas:', error);
      return [];
    }
  }
}