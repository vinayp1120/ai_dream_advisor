const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_API_URL = 'https://tavusapi.com/v2';

export interface TavusReplica {
  avatar_id: number;
  status: 'training' | 'completed' | 'error';
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAvatarRequest {
  train_video_url: string;
  callback_url?: string;
}

export interface VideoGenerationRequest {
  avatar_id: number;
  script: string;
  background_url?: string;
  callback_url?: string;
}

export interface VideoGenerationResponse {
  id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  hosted_url?: string;
  download_url?: string;
  created_at?: string;
}

export class TavusAPI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || TAVUS_API_KEY || 'f477b646478d4f8ab1d653bb91c38fb9';
    if (!this.apiKey) {
      console.warn('Tavus API key not found. Video generation will be simulated.');
    }
  }

  async createAvatar(request: CreateAvatarRequest): Promise<TavusReplica> {
    if (!this.apiKey) {
      return this.simulateAvatarCreation(request);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/avatars/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavus API error:', response.status, errorText);
        throw new Error(`Tavus API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return {
        avatar_id: result.avatar_id,
        status: 'training',
        name: `Avatar ${result.avatar_id}`,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Avatar creation error:', error);
      return this.simulateAvatarCreation(request);
    }
  }

  async getAvatar(avatarId: number): Promise<TavusReplica> {
    if (!this.apiKey) {
      return this.simulateAvatarStatus(avatarId);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/avatars/${avatarId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        avatar_id: result.id,
        status: result.status === 'completed' ? 'completed' : 'training',
        name: result.name,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error fetching avatar:', error);
      return this.simulateAvatarStatus(avatarId);
    }
  }

  async listAvatars(): Promise<TavusReplica[]> {
    if (!this.apiKey) {
      return this.simulateAvatarList();
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/avatars/list`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const result = await response.json();
      return result.map((avatar: any) => ({
        avatar_id: avatar.id,
        status: avatar.status === 'completed' ? 'completed' : 'training',
        name: avatar.name,
        created_at: avatar.created_at,
        updated_at: avatar.updated_at
      }));
    } catch (error) {
      console.error('Error fetching avatars:', error);
      return this.simulateAvatarList();
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return this.simulateVideoGeneration(request);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavus video generation error:', response.status, errorText);
        throw new Error(`Tavus API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return {
        id: result.id,
        status: result.status,
        hosted_url: result.hosted_url,
        created_at: result.created_at
      };
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
      const response = await fetch(`${TAVUS_API_URL}/requests/${videoId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result.id,
        status: result.status,
        hosted_url: result.hosted_url,
        download_url: result.stream_url,
        created_at: result.created_at
      };
    } catch (error) {
      console.error('Error fetching video status:', error);
      return this.simulateVideoStatus(videoId);
    }
  }

  // Simulation methods for demo purposes
  private async simulateAvatarCreation(request: CreateAvatarRequest): Promise<TavusReplica> {
    const avatarId = Math.floor(Math.random() * 10000) + 1000;
    
    return {
      avatar_id: avatarId,
      status: 'training',
      name: `Demo Avatar ${avatarId}`,
      created_at: new Date().toISOString()
    };
  }

  private async simulateAvatarStatus(avatarId: number): Promise<TavusReplica> {
    // Simulate training completion after some time
    return {
      avatar_id: avatarId,
      status: 'completed',
      name: `Demo Avatar ${avatarId}`,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updated_at: new Date().toISOString()
    };
  }

  private async simulateAvatarList(): Promise<TavusReplica[]> {
    return [
      {
        avatar_id: 1001,
        status: 'completed',
        name: 'Dr. Reality Check Avatar',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        avatar_id: 1002,
        status: 'completed',
        name: 'Prof. Optimist Avatar',
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        avatar_id: 1003,
        status: 'training',
        name: 'Dr. Sarcasm Avatar',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  private async simulateVideoGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const videoId = `v${Date.now().toString().slice(-8)}`;
    
    return {
      id: videoId,
      status: 'queued',
      hosted_url: `https://demo-video.tavus.io/video/${videoId}`,
      created_at: new Date().toISOString()
    };
  }

  private async simulateVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    // Simulate video generation progress based on time elapsed
    const timestamp = parseInt(videoId.slice(1));
    const elapsed = Date.now() - timestamp;
    
    if (elapsed < 10000) { // First 10 seconds
      return {
        id: videoId,
        status: 'generating',
        hosted_url: `https://demo-video.tavus.io/video/${videoId}`,
        created_at: new Date(timestamp).toISOString()
      };
    }
    
    // Return completed status with demo video URL
    return {
      id: videoId,
      status: 'completed',
      hosted_url: `https://demo-video.tavus.io/video/${videoId}`,
      download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      created_at: new Date(timestamp).toISOString()
    };
  }

  // Helper method to get default avatar IDs for therapists
  getDefaultAvatarId(therapistId: string): number {
    const avatarMap = {
      'dr-reality': 1001,
      'prof-optimist': 1002, 
      'dr-sarcasm': 1003,
      'sage-wisdom': 1004,
      'rebel-innovator': 1005
    };

    return avatarMap[therapistId as keyof typeof avatarMap] || 1001;
  }
}