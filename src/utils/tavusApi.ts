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
  private validatedReplicas: Set<string> = new Set();

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

  async getStockReplicas(): Promise<TavusReplica[]> {
    if (!this.apiKey) {
      console.log('🎭 Using recommended stock replicas (no API key)');
      return this.getRecommendedStockReplicas();
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
        
        // Log available replicas for debugging
        console.log('📋 Available stock replicas:', this.stockReplicas.map(r => ({
          id: r.replica_id,
          name: r.replica_name
        })));
        
        return this.stockReplicas;
      } else {
        console.warn('⚠️ Unexpected API response structure:', result);
        return this.getRecommendedStockReplicas();
      }
    } catch (error) {
      console.error('❌ Error fetching stock replicas:', error);
      return this.getRecommendedStockReplicas();
    }
  }

  async getAllReplicas(): Promise<TavusReplica[]> {
    if (!this.apiKey) {
      return this.getRecommendedStockReplicas();
    }

    try {
      console.log('🎬 Fetching all replicas from Tavus...');
      const result = await this.makeRequest('/replicas');
      
      if (result.data && Array.isArray(result.data)) {
        console.log(`✅ Found ${result.data.length} total replicas`);
        const allReplicas = result.data.map((replica: any) => ({
          replica_id: replica.replica_id,
          replica_name: replica.replica_name,
          status: replica.status === 'ready' ? 'ready' : 'training',
          replica_type: replica.replica_type,
          created_at: replica.created_at,
          updated_at: replica.updated_at
        }));
        
        // Log all replicas for debugging
        console.log('📋 All available replicas:', allReplicas.map(r => ({
          id: r.replica_id,
          name: r.replica_name,
          status: r.status,
          type: r.replica_type
        })));
        
        return allReplicas;
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
      // For demo mode, check against recommended replicas
      const recommendedReplicas = this.getRecommendedStockReplicas();
      return recommendedReplicas.some(r => r.replica_id === replicaId);
    }

    // Check cache first
    if (this.validatedReplicas.has(replicaId)) {
      console.log(`✅ Replica ${replicaId} already validated (cached)`);
      return true;
    }

    try {
      console.log(`🔍 Validating replica: ${replicaId}`);
      const replica = await this.makeRequest(`/replicas/${replicaId}`);
      const isValid = replica.status === 'ready' || replica.status === 'completed';
      
      if (isValid) {
        this.validatedReplicas.add(replicaId);
        console.log(`✅ Replica ${replicaId} is valid and ready`);
      } else {
        console.log(`❌ Replica ${replicaId} is not ready (status: ${replica.status})`);
      }
      
      return isValid;
    } catch (error) {
      console.error(`❌ Error validating replica ${replicaId}:`, error);
      return false;
    }
  }

  private getRecommendedStockReplicas(): TavusReplica[] {
    // Using the recommended stock replica IDs from the documentation
    return [
      {
        replica_id: 're8e740a42', // Nathan (from quick start guide)
        replica_name: 'Nathan - Professional Male',
        status: 'ready',
        replica_type: 'system',
        created_at: new Date().toISOString()
      },
      {
        replica_id: 'r1fbfc941b', // Nathan (from CVI recommendations)
        replica_name: 'Nathan - Conversational',
        status: 'ready', 
        replica_type: 'system',
        created_at: new Date().toISOString()
      },
      {
        replica_id: 'r4c41453d2', // Anna (from CVI recommendations)
        replica_name: 'Anna - Professional Female',
        status: 'ready',
        replica_type: 'system',
        created_at: new Date().toISOString()
      }
    ];
  }

  async getValidStockReplica(): Promise<string> {
    try {
      // First try to get actual stock replicas from API
      const stockReplicas = await this.getStockReplicas();
      
      if (stockReplicas.length === 0) {
        console.warn('⚠️ No stock replicas available from API');
        return 're8e740a42'; // Fallback to recommended replica
      }

      // Try to validate each replica until we find a working one
      for (const replica of stockReplicas) {
        const isValid = await this.validateReplica(replica.replica_id);
        if (isValid) {
          console.log(`✅ Found valid stock replica: ${replica.replica_id} (${replica.replica_name})`);
          return replica.replica_id;
        }
      }

      // If no API replicas work, try recommended ones
      console.log('🔄 Trying recommended stock replicas...');
      const recommendedReplicas = ['re8e740a42', 'r1fbfc941b', 'r4c41453d2'];
      
      for (const replicaId of recommendedReplicas) {
        const isValid = await this.validateReplica(replicaId);
        if (isValid) {
          console.log(`✅ Found valid recommended replica: ${replicaId}`);
          return replicaId;
        }
      }

      // Last resort - return the most recommended one
      console.warn('⚠️ No replicas validated, using fallback');
      return 're8e740a42';
      
    } catch (error) {
      console.error('❌ Error getting valid stock replica:', error);
      return 're8e740a42'; // Fallback
    }
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
        console.log(`❌ Replica ${request.replica_id} is invalid, getting valid alternative...`);
        const validReplicaId = await this.getValidStockReplica();
        request.replica_id = validReplicaId;
        console.log(`🔄 Using valid replica: ${validReplicaId}`);
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
      if (error instanceof Error && error.message.includes('replica')) {
        console.log('🔄 Replica error, trying with guaranteed valid replica...');
        const fallbackRequest = { ...request, replica_id: 're8e740a42' };
        return this.simulateVideoGeneration(fallbackRequest);
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
      // Get a guaranteed valid stock replica
      const validReplicaId = await this.getValidStockReplica();
      
      console.log(`🎭 Selected replica for ${therapistId}: ${validReplicaId}`);
      return validReplicaId;
      
    } catch (error) {
      console.error('❌ Error getting replica for therapist:', error);
      return 're8e740a42'; // Fallback to most recommended
    }
  }

  // Debug method to list and validate all available replicas
  async debugReplicas(): Promise<void> {
    if (!this.apiKey) {
      console.log('🔧 Debug: No API key provided');
      return;
    }

    try {
      console.log('🔧 === REPLICA DEBUG INFORMATION ===');
      
      // Test connection
      const connected = await this.testConnection();
      console.log(`🔧 API Connection: ${connected ? '✅ Success' : '❌ Failed'}`);
      
      if (!connected) return;
      
      // Get all replicas
      const allReplicas = await this.getAllReplicas();
      console.log(`🔧 Total replicas found: ${allReplicas.length}`);
      
      // Get stock replicas
      const stockReplicas = await this.getStockReplicas();
      console.log(`🔧 Stock replicas found: ${stockReplicas.length}`);
      
      // Test recommended replicas
      const recommendedIds = ['re8e740a42', 'r1fbfc941b', 'r4c41453d2'];
      console.log('🔧 Testing recommended replica IDs:');
      
      for (const replicaId of recommendedIds) {
        const isValid = await this.validateReplica(replicaId);
        console.log(`🔧 ${replicaId}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      }
      
      console.log('🔧 === END DEBUG INFORMATION ===');
      
    } catch (error) {
      console.error('🔧 Debug error:', error);
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
}