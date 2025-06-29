const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_API_URL = 'https://tavusapi.com/v2';

export interface TavusReplica {
  replica_id: string;
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
  replica_uuid: string;
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
    this.apiKey = apiKey || TAVUS_API_KEY;
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
        replica_id: result.replica_id,
        status: 'training',
        name: `Avatar ${result.replica_id}`,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Avatar creation error:', error);
      return this.simulateAvatarCreation(request);
    }
  }

  async getAvatar(replicaId: string): Promise<TavusReplica> {
    if (!this.apiKey) {
      return this.simulateAvatarStatus(replicaId);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/avatars/${replicaId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        replica_id: result.id,
        status: result.status === 'completed' ? 'completed' : 'training',
        name: result.name,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error fetching avatar:', error);
      return this.simulateAvatarStatus(replicaId);
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
        replica_id: avatar.id,
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
    const replicaId = `replica_${Math.floor(Math.random() * 10000) + 1000}`;
    
    return {
      replica_id: replicaId,
      status: 'training',
      name: `Demo Avatar ${replicaId}`,
      created_at: new Date().toISOString()
    };
  }

  private async simulateAvatarStatus(replicaId: string): Promise<TavusReplica> {
    // Simulate training completion after some time
    return {
      replica_id: replicaId,
      status: 'completed',
      name: `Demo Avatar ${replicaId}`,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updated_at: new Date().toISOString()
    };
  }

  private async simulateAvatarList(): Promise<TavusReplica[]> {
    return [
      {
        replica_id: 'replica_1001',
        status: 'completed',
        name: 'Dr. Reality Check Avatar',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        replica_id: 'replica_1002',
        status: 'completed',
        name: 'Prof. Optimist Avatar',
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        replica_id: 'replica_1003',
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

  // Helper method to get default replica UUIDs for therapists
  // NOTE: Replace these placeholder UUIDs with actual replica UUIDs from your Tavus account
  getDefaultReplicaUuid(therapistId: string): string {
    const replicaMap = {
      'dr-reality': 'your_dr_reality_replica_uuid_here',
      'prof-optimist': 'your_prof_optimist_replica_uuid_here', 
      'dr-sarcasm': 'your_dr_sarcasm_replica_uuid_here',
      'sage-wisdom': 'your_sage_wisdom_replica_uuid_here',
      'rebel-innovator': 'your_rebel_innovator_replica_uuid_here'
    };

    return replicaMap[therapistId as keyof typeof replicaMap] || 'your_default_replica_uuid_here';
  }
}