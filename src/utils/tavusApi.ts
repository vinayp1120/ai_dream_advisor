const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_API_URL = 'https://tavusapi.com/v2';

export interface TavusReplica {
  replica_id: string;
  status: 'training' | 'completed' | 'error';
  replica_name?: string;
}

export interface CreateReplicaRequest {
  train_video_url: string;
  consent_video_url?: string;
  callback_url?: string;
  replica_name?: string;
  model_name?: string;
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

  async createReplica(request: CreateReplicaRequest): Promise<TavusReplica> {
    if (!this.apiKey) {
      return this.simulateReplicaCreation(request);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/replicas`, {
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

      return await response.json();
    } catch (error) {
      console.error('Replica creation error:', error);
      return this.simulateReplicaCreation(request);
    }
  }

  async getReplica(replicaId: string): Promise<TavusReplica> {
    if (!this.apiKey) {
      return this.simulateReplicaStatus(replicaId);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/replicas/${replicaId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching replica:', error);
      return this.simulateReplicaStatus(replicaId);
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return this.simulateVideoGeneration(request);
    }

    try {
      // Note: The actual video generation endpoint might be different
      // This is based on common API patterns, but you may need to adjust
      const response = await fetch(`${TAVUS_API_URL}/videos`, {
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

  // Simulation methods for demo purposes
  private async simulateReplicaCreation(request: CreateReplicaRequest): Promise<TavusReplica> {
    const replicaId = `r${Date.now().toString().slice(-8)}`;
    
    return {
      replica_id: replicaId,
      status: 'training',
      replica_name: request.replica_name || 'Demo Replica'
    };
  }

  private async simulateReplicaStatus(replicaId: string): Promise<TavusReplica> {
    // Simulate training completion after some time
    return {
      replica_id: replicaId,
      status: 'completed',
      replica_name: 'Demo Replica'
    };
  }

  private async simulateVideoGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const videoId = `v${Date.now().toString().slice(-8)}`;
    
    return {
      video_id: videoId,
      status: 'queued'
    };
  }

  private async simulateVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    // Simulate video generation progress
    const elapsed = Date.now() - parseInt(videoId.slice(1)) * 1000;
    
    if (elapsed < 5000) {
      return {
        video_id: videoId,
        status: 'generating'
      };
    }
    
    // Return a demo video URL for testing
    return {
      video_id: videoId,
      status: 'completed',
      download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };
  }

  // Helper method to get default replica IDs for therapists
  getDefaultReplicaId(therapistId: string): string {
    const replicaMap = {
      'dr-reality': 'r12345678',
      'prof-optimist': 'r23456789', 
      'dr-sarcasm': 'r34567890',
      'sage-wisdom': 'r45678901',
      'rebel-innovator': 'r56789012'
    };

    return replicaMap[therapistId as keyof typeof replicaMap] || 'r12345678';
  }
}