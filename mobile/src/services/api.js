import axios from 'axios';

// Configure API base URL from environment variable (REQUIRED)
// For React Native/Expo: Set API_BASE_URL in your .env file
// Development example: API_BASE_URL=http://192.168.1.100:5001
// Production example: API_BASE_URL=https://your-backend-url.com
const getApiBaseUrl = () => {
  // Add support for environment variables when configured
  // For now, throw error to require manual configuration
  if (!process.env.API_BASE_URL) {
    throw new Error(
      'API_BASE_URL environment variable is required. ' +
      'Please create a .env file in the mobile directory and set API_BASE_URL. ' +
      'Example for development: API_BASE_URL=http://YOUR_LOCAL_IP:5001'
    );
  }
  return process.env.API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for audio processing
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend connection failed');
    }
  },

  // Get all surahs
  getSurahs: async () => {
    try {
      const response = await api.get('/api/all_surahs');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch surahs');
    }
  },

  // Get Juz 30 surahs
  getJuz30Surahs: async () => {
    try {
      const response = await api.get('/api/surahs');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Juz 30 surahs');
    }
  },

  // Check recitation with language support
  checkRecitation: async (audioFile, surahId, ayahNumber, language = 'en') => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioFile.uri,
        type: audioFile.mimeType || 'audio/wav',
        name: audioFile.name || 'recording.wav',
      });
      formData.append('surah_id', surahId.toString());
      formData.append('ayah_number', ayahNumber.toString());
      formData.append('language', language);

      const response = await api.post('/api/check', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to check recitation');
    }
  },

  // Get supported languages
  getSupportedLanguages: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data.supported_languages || ['en'];
    } catch (error) {
      return ['en'];
    }
  },
};

export default api;
