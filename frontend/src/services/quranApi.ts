import { quranCache, type CachedSurah } from './quranCache';
import { apiUrls } from '../config/api';

interface ApiResponse<T> {
  data: T | null;
  fromCache: boolean;
  error?: string;
}

interface VerseResponse {
  text: string;
}

interface SurahInfoResponse {
  name_arabic: string;
  verses_count: number;
}

interface SurahsResponse {
  surahs: CachedSurah[];
}

class QuranApiService {
  private static instance: QuranApiService;

  private constructor() {}

  public static getInstance(): QuranApiService {
    if (!QuranApiService.instance) {
      QuranApiService.instance = new QuranApiService();
    }
    return QuranApiService.instance;
  }

  /**
   * Get verse text with caching
   */
  async getVerseText(surah_id: number, ayah_number: number): Promise<ApiResponse<VerseResponse>> {
    try {
      // Try cache first
      const cachedText = await quranCache.getCachedVerse(surah_id, ayah_number);
      if (cachedText) {
        return {
          data: { text: cachedText },
          fromCache: true
        };
      }

      // Check if online
      const isOnline = await quranCache.isOnline();
      if (!isOnline) {
        return {
          data: null,
          fromCache: false,
          error: 'No cached data available and device is offline'
        };
      }

      // Fetch from API
      console.log(`🌐 Fetching verse ${surah_id}:${ayah_number} from API...`);
      const url = `${apiUrls.getAyahText()}?surah_id=${surah_id}&ayah_number=${ayah_number}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.text || '';

      // Cache the result
      if (text) {
        await quranCache.cacheVerse(surah_id, ayah_number, text);
      }

      return {
        data: { text },
        fromCache: false
      };

    } catch (error) {
      console.error(`❌ Failed to get verse ${surah_id}:${ayah_number}:`, error);
      
      // Try cache as fallback even if API fails
      const cachedText = await quranCache.getCachedVerse(surah_id, ayah_number);
      if (cachedText) {
        console.log(`🔄 Using stale cache for verse ${surah_id}:${ayah_number}`);
        return {
          data: { text: cachedText },
          fromCache: true
        };
      }

      return {
        data: null,
        fromCache: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get surah info with caching
   */
  async getSurahInfo(surah_id: number): Promise<ApiResponse<SurahInfoResponse>> {
    try {
      // Try cache first
      const cachedInfo = await quranCache.getCachedSurahInfo(surah_id);
      if (cachedInfo) {
        return {
          data: cachedInfo,
          fromCache: true
        };
      }

      // Check if online
      const isOnline = await quranCache.isOnline();
      if (!isOnline) {
        return {
          data: null,
          fromCache: false,
          error: 'No cached data available and device is offline'
        };
      }

      // Fetch from API
      console.log(`🌐 Fetching surah info ${surah_id} from API...`);
      const response = await fetch(apiUrls.surahInfo(surah_id.toString()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      await quranCache.cacheSurahInfo(surah_id, data);

      return {
        data,
        fromCache: false
      };

    } catch (error) {
      console.error(`❌ Failed to get surah info ${surah_id}:`, error);
      
      // Try cache as fallback
      const cachedInfo = await quranCache.getCachedSurahInfo(surah_id);
      if (cachedInfo) {
        console.log(`🔄 Using stale cache for surah info ${surah_id}`);
        return {
          data: cachedInfo,
          fromCache: true
        };
      }

      return {
        data: null,
        fromCache: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all surahs with caching
   */
  async getAllSurahs(): Promise<ApiResponse<SurahsResponse>> {
    try {
      // Try cache first
      const cachedSurahs = await quranCache.getCachedSurahs();
      if (cachedSurahs) {
        return {
          data: { surahs: cachedSurahs },
          fromCache: true
        };
      }

      // Check if online
      const isOnline = await quranCache.isOnline();
      if (!isOnline) {
        return {
          data: null,
          fromCache: false,
          error: 'No cached data available and device is offline'
        };
      }

      // Fetch from API
      console.log('🌐 Fetching all surahs from API...');
      const response = await fetch(apiUrls.allSurahs());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const surahs: CachedSurah[] = data.surahs || [];

      // Cache the result
      if (surahs.length > 0) {
        await quranCache.cacheSurahs(surahs);
      }

      return {
        data: { surahs },
        fromCache: false
      };

    } catch (error) {
      console.error('❌ Failed to get all surahs:', error);
      
      // Try cache as fallback
      const cachedSurahs = await quranCache.getCachedSurahs();
      if (cachedSurahs) {
        console.log('🔄 Using stale cache for all surahs');
        return {
          data: { surahs: cachedSurahs },
          fromCache: true
        };
      }

      return {
        data: null,
        fromCache: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Submit audio for checking (no caching for this)
   */
  async checkRecitation(formData: FormData): Promise<any> {
    try {
      console.log('🎤 Submitting audio for checking...');
      const response = await fetch(apiUrls.checkRecitation(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to check recitation:', error);
      throw error;
    }
  }

  /**
   * Preload popular content in background
   */
  async preloadPopularContent(): Promise<void> {
    try {
      console.log('🚀 Starting background preload...');
      
      // Preload all surahs list
      await this.getAllSurahs();
      
      // Preload popular surahs (Juz 30)
      const popularSurahs = [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
      
      for (const surahId of popularSurahs) {
        try {
          await this.getSurahInfo(surahId);
          // Don't preload all verses to avoid overwhelming the API
          // Users will cache verses as they practice them
        } catch (error) {
          console.error(`Failed to preload surah ${surahId}:`, error);
        }
      }
      
      console.log('✅ Background preload completed');
    } catch (error) {
      console.error('❌ Background preload failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await quranCache.getCacheStats();
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    return await quranCache.clearCache();
  }
}

export const quranApi = QuranApiService.getInstance();
export type { ApiResponse, VerseResponse, SurahInfoResponse, SurahsResponse };
