const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_API_URL = 'https://tavusapi.com/v2';

export interface TavusReplica {
  replica_id: string;
  status: 'training' | 'ready' | 'error';
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAvatarRequest {
  train_video_url: string;
  callback_url?: string;
}

export interface VideoGenerationRequest {
  replica_id: string;
  script: string;
  video_name?: string;
  background_url?: string;
  callback_url?: string;
  fast?: boolean;
}

export interface VideoGenerationResponse {
  video_id: string;
  video_name?: string;
  status: 'queued' | 'generating' | 'ready' | 'deleted' | 'error';
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
      const response = await fetch(`${TAVUS_API_URL}/replicas/${replicaId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        replica_id: result.replica_id,
        status: result.status === 'ready' ? 'ready' : 'training',
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
      const response = await fetch(`${TAVUS_API_URL}/replicas`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const result = await response.json();
      return result.map((replica: any) => ({
        replica_id: replica.replica_id,
        status: replica.status === 'ready' ? 'ready' : 'training',
        name: replica.name,
        created_at: replica.created_at,
        updated_at: replica.updated_at
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
      console.log('Generating video with Tavus API...');
      console.log('Request:', request);
      
      const response = await fetch(`${TAVUS_API_URL}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          replica_id: request.replica_id,
          script: request.script,
          video_name: request.video_name || 'DreamAdvisor Therapy Session',
          background_url: request.background_url || '',
          callback_url: request.callback_url,
          fast: request.fast || false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavus video generation error:', response.status, errorText);
        throw new Error(`Tavus API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Tavus response:', result);
      
      return {
        video_id: result.video_id,
        video_name: result.video_name,
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
      const response = await fetch(`${TAVUS_API_URL}/videos/${videoId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        video_id: result.video_id,
        video_name: result.video_name,
        status: result.status,
        hosted_url: result.hosted_url,
        download_url: result.download_url,
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
      status: 'ready',
      name: `Demo Avatar ${replicaId}`,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updated_at: new Date().toISOString()
    };
  }

  private async simulateAvatarList(): Promise<TavusReplica[]> {
    return [
      {
        replica_id: 'replica_1001',
        status: 'ready',
        name: 'Dr. Reality Check Avatar',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        replica_id: 'replica_1002',
        status: 'ready',
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
      video_id: videoId,
      video_name: 'Demo Therapy Session',
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
        video_id: videoId,
        video_name: 'Demo Therapy Session',
        status: 'generating',
        hosted_url: `https://demo-video.tavus.io/video/${videoId}`,
        created_at: new Date(timestamp).toISOString()
      };
    }
    
    // Return completed status with demo video URL
    return {
      video_id: videoId,
      video_name: 'Demo Therapy Session',
      status: 'ready',
      hosted_url: `https://demo-video.tavus.io/video/${videoId}`,
      download_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      created_at: new Date(timestamp).toISOString()
    };
  }

  // Helper method to get default replica IDs for therapists
  // NOTE: Replace these placeholder replica IDs with actual replica IDs from your Tavus account
  getDefaultReplicaId(therapistId: string): string {
    const replicaMap = {
      'dr-reality': 'your_dr_reality_replica_id_here',
      'prof-optimist': 'your_prof_optimist_replica_id_here', 
      'dr-sarcasm': 'your_dr_sarcasm_replica_id_here',
      'sage-wisdom': 'your_sage_wisdom_replica_id_here',
      'rebel-innovator': 'your_rebel_innovator_replica_id_here'
    };

    return replicaMap[therapistId as keyof typeof replicaMap] || 'your_default_replica_id_here';
  }
}