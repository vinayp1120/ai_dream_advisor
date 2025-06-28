import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface SessionRequest {
  audio?: File;
  text?: string;
  therapist: string;
}

export interface SessionResponse {
  transcript: string;
  script: string;
  score: number;
  audioUrl?: string;
  videoUrl?: string;
  therapist: {
    id: string;
    name: string;
    personality: string;
  };
  insights: string[];
  advice: string;
}

export interface TherapistInfo {
  id: string;
  name: string;
  personality: string;
  voice: string;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async createSession(request: SessionRequest): Promise<SessionResponse> {
    const formData = new FormData();
    
    if (request.audio) {
      formData.append('audio', request.audio);
    }
    
    if (request.text) {
      formData.append('text', request.text);
    }
    
    formData.append('therapist', request.therapist);

    try {
      const response = await axios.post(`${this.baseURL}/session`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for video generation
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Session creation failed');
      }
      throw error;
    }
  }

  async getTherapists(): Promise<TherapistInfo[]> {
    try {
      const response = await axios.get(`${this.baseURL}/therapists`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
      return [];
    }
  }

  async healthCheck(): Promise<{ status: string; apis: Record<string, boolean> }> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      return { status: 'error', apis: { elevenlabs: false, tavus: false } };
    }
  }
}

export const apiClient = new ApiClient();