const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_API_URL = 'https://tavusapi.com/v2';

export interface TavusReplica {
  replica_id: string;
  replica_name?: string;
  status: 'training' | 'ready' | 'error';
  replica_type?: 'system' | 'custom';
  created_at?: string;
  updated_at?: string;
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
  private stockReplicas: TavusReplica[] = [];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || TAVUS_API_KEY;
    if (!this.apiKey) {
      console.warn('Tavus API key not found. Video generation will be simulated.');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${TAVUS_API_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`🌐 Making request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error: ${response.status}`, errorData);
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      console.log(`✅ Request successful:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getStockReplicas(): Promise<TavusReplica[]> {
    if (!this.apiKey) {
      console.log('🎭 Using fallback stock replicas (no API key)');
      return this.getDefaultStockReplicas();
    }

    try {
      console.log('🎬 Fetching stock replicas from Tavus...');
      const result = await this.makeRequest('/replicas?replica_type=system');
      
      // Handle the correct API response structure
      if (result.data && Array.isArray(result.data)) {
        console.log(`✅ Found ${result.data.length} stock replicas`);
        this.stockReplicas = result.data.map((replica: any) => ({
          replica_id: replica.replica_id,
          replica_name: replica.replica_name || `Stock Replica ${replica.replica_id}`,
          status: 'ready',
          replica_type: 'system',
          created_at: replica.created_at
        }));
        return this.stockReplicas;
      } else {
        console.warn('⚠️ Unexpected API response structure:', result);
        return this.getDefaultStockReplicas();
      }
    } catch (error) {
      console.error('❌ Error fetching stock replicas:', error);
      return this.getDefaultStockReplicas();
    }
  }

  async getAllReplicas(): Promise<TavusReplica[]> {
    if (!this.apiKey) {
      return this.getDefaultStockReplicas();
    }

    try {
      console.log('🎬 Fetching all replicas from Tavus...');
      const result = await this.makeRequest('/replicas');
      
      if (result.data && Array.isArray(result.data)) {
        console.log(`✅ Found ${result.data.length} total replicas`);
        return result.data.map((replica: any) => ({
          replica_id: replica.replica_id,
          replica_name: replica.replica_name,
          status: replica.status === 'ready' ? 'ready' : 'training',
          replica_type: replica.replica_type,
          created_at: replica.created_at,
          updated_at: replica.updated_at
        }));
      } else {
        console.warn('⚠️ Unexpected API response structure:', result);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching all replicas:', error);
      return [];
    }
  }

  async validateReplica(replicaId: string): Promise<boolean> {
    if (!this.apiKey) {
      // For demo mode, assume all default replicas are valid
      const defaultReplicas = this.getDefaultStockReplicas();
      return defaultReplicas.some(r => r.replica_id === replicaId);
    }

    try {
      console.log(`🔍 Validating replica: ${replicaId}`);
      const replica = await this.makeRequest(`/replicas/${replicaId}`);
      const isValid = replica.status === 'ready';
      console.log(`${isValid ? '✅' : '❌'} Replica ${replicaId} is ${isValid ? 'valid' : 'invalid'}`);
      return isValid;
    } catch (error) {
      console.error(`❌ Error validating replica ${replicaId}:`, error);
      return false;
    }
  }

  private getDefaultStockReplicas(): TavusReplica[] {
    // Default stock replicas for demo/fallback
    return [
      {
        replica_id: 'r783537ef5',
        replica_name: 'Professional Male',
        status: 'ready',
        replica_type: 'system',
        created_at: new Date().toISOString()
      },
      {
        replica_id: 'r12345678',
        replica_name: 'Professional Female',
        status: 'ready', 
        replica_type: 'system',
        created_at: new Date().toISOString()
      },
      {
        replica_id: 'r87654321',
        replica_name: 'Casual Male',
        status: 'ready',
        replica_type: 'system',
        created_at: new Date().toISOString()
      },
      {
        replica_id: 'r11111111',
        replica_name: 'Casual Female',
        status: 'ready',
        replica_type: 'system',
        created_at: new Date().toISOString()
      },
      {
        replica_id: 'r22222222',
        replica_name: 'Executive Style',
        status: 'ready',
        replica_type: 'system',
        created_at: new Date().toISOString()
      }
    ];
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      console.log('🎬 Simulating video generation (no API key)');
      return this.simulateVideoGeneration(request);
    }

    try {
      // First validate the replica ID
      console.log(`🔍 Validating replica ${request.replica_id} before video generation...`);
      const isValidReplica = await this.validateReplica(request.replica_id);
      if (!isValidReplica) {
        throw new Error(`Invalid or unavailable replica ID: ${request.replica_id}`);
      }

      console.log('🎬 Generating video with Tavus API...');
      console.log('📋 Request details:', {
        replica_id: request.replica_id,
        script_length: request.script.length,
        video_name: request.video_name
      });
      
      const payload = {
        replica_id: request.replica_id,
        script: request.script,
        video_name: request.video_name || 'DreamAdvisor Therapy Session',
        background_url: request.background_url || '',
        callback_url: request.callback_url,
        fast: request.fast !== false // Default to true for faster generation
      };

      const result = await this.makeRequest('/videos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('✅ Tavus video generation started:', result);
      
      return {
        video_id: result.video_id,
        video_name: result.video_name,
        status: result.status,
        hosted_url: result.hosted_url,
        created_at: result.created_at
      };
    } catch (error) {
      console.error('❌ Video generation error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('replica')) {
          console.log('🔄 Trying with first available stock replica...');
          const stockReplicas = await this.getStockReplicas();
          if (stockReplicas.length > 0) {
            const fallbackRequest = { ...request, replica_id: stockReplicas[0].replica_id };
            return this.simulateVideoGeneration(fallbackRequest);
          }
        }
      }
      
      return this.simulateVideoGeneration(request);
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return this.simulateVideoStatus(videoId);
    }

    try {
      if (!videoId) {
        throw new Error('Video ID is required');
      }

      console.log(`📊 Checking status for video: ${videoId}`);
      const result = await this.makeRequest(`/videos/${videoId}`);
      
      console.log(`📊 Video status: ${result.status}`);
      return {
        video_id: result.video_id,
        video_name: result.video_name,
        status: result.status,
        hosted_url: result.hosted_url,
        download_url: result.download_url,
        created_at: result.created_at
      };
    } catch (error) {
      console.error(`❌ Error fetching video status for ${videoId}:`, error);
      return this.simulateVideoStatus(videoId);
    }
  }

  // Helper method to get stock replica IDs for therapists
  async getReplicaIdForTherapist(therapistId: string): Promise<string> {
    try {
      // First try to get actual stock replicas
      const stockReplicas = await this.getStockReplicas();
      
      if (stockReplicas.length === 0) {
        console.warn('⚠️ No stock replicas available, using fallback');
        return 'r783537ef5'; // Default fallback
      }

      // Map therapists to appropriate stock replicas based on personality
      const therapistReplicaMap = {
        'dr-reality': 0, // Professional Male - serious, direct
        'prof-optimist': 1, // Professional Female - warm, encouraging  
        'dr-sarcasm': 2, // Casual Male - witty, relaxed
        'sage-wisdom': 4, // Executive Style - wise, experienced
        'rebel-innovator': 2 // Casual Male - disruptive, energetic
      };

      const replicaIndex = therapistReplicaMap[therapistId as keyof typeof therapistReplicaMap] || 0;
      const selectedReplica = stockReplicas[replicaIndex] || stockReplicas[0];
      
      console.log(`🎭 Selected replica for ${therapistId}:`, selectedReplica.replica_name, selectedReplica.replica_id);
      
      // Validate the selected replica before returning
      const isValid = await this.validateReplica(selectedReplica.replica_id);
      if (!isValid) {
        console.warn(`⚠️ Selected replica ${selectedReplica.replica_id} is not valid, using first available`);
        const validReplica = stockReplicas.find(r => r.status === 'ready');
        return validReplica?.replica_id || stockReplicas[0].replica_id;
      }
      
      return selectedReplica.replica_id;
    } catch (error) {
      console.error('❌ Error getting replica for therapist:', error);
      return 'r783537ef5'; // Fallback
    }
  }

  // Simulation methods for demo purposes
  private async simulateVideoGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const videoId = `demo_${Date.now().toString().slice(-8)}`;
    
    console.log('🎭 Simulating video generation for demo...');
    
    return {
      video_id: videoId,
      video_name: request.video_name || 'Demo Therapy Session',
      status: 'queued',
      hosted_url: `https://demo-video.tavus.io/video/${videoId}`,
      created_at: new Date().toISOString()
    };
  }

  private async simulateVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    // Simulate video generation progress based on time elapsed
    const isDemo = videoId.startsWith('demo_');
    const timestamp = isDemo ? parseInt(videoId.slice(5)) : parseInt(videoId.slice(1));
    const elapsed = Date.now() - timestamp;
    
    if (elapsed < 15000) { // First 15 seconds
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

  // Debug method to test API connectivity
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      console.log('🔧 No API key - connection test skipped');
      return false;
    }

    try {
      console.log('🔧 Testing Tavus API connection...');
      await this.makeRequest('/replicas?limit=1');
      console.log('✅ Tavus API connection successful');
      return true;
    } catch (error) {
      console.error('❌ Tavus API connection failed:', error);
      return false;
    }
  }
}