import { Preferences } from '@capacitor/preferences';

interface CachedVerse {
  surah_id: number;
  ayah_number: number;
  text: string;
  cached_at: number;
  ttl: number; // Time to live in milliseconds
}

interface CachedSurah {
  id: number;
  name_arabic: string;
  name_simple: string;
  name_english: string;
  verses_count: number;
  cached_at: number;
}

interface CacheStats {
  totalVerses: number;
  totalSurahs: number;
  cacheSize: number;
  lastUpdate: number;
}

class QuranCacheService {
  private static instance: QuranCacheService;
  private readonly VERSE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly SURAH_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly CACHE_VERSION = '1.0.0';

  private constructor() {}

  public static getInstance(): QuranCacheService {
    if (!QuranCacheService.instance) {
      QuranCacheService.instance = new QuranCacheService();
    }
    return QuranCacheService.instance;
  }

  // ============= VERSE CACHING =============

  /**
   * Cache a Quran verse with TTL
   */
  async cacheVerse(surah_id: number, ayah_number: number, text: string): Promise<void> {
    try {
      const cacheKey = `verse_${surah_id}_${ayah_number}`;
      const cachedVerse: CachedVerse = {
        surah_id,
        ayah_number,
        text,
        cached_at: Date.now(),
        ttl: this.VERSE_TTL
      };

      await Preferences.set({
        key: cacheKey,
        value: JSON.stringify(cachedVerse)
      });

      console.log(`✅ Cached verse ${surah_id}:${ayah_number}`);
      await this.updateCacheStats();
    } catch (error) {
      console.error(`❌ Failed to cache verse ${surah_id}:${ayah_number}:`, error);
    }
  }

  /**
   * Get cached verse if available and not expired
   */
  async getCachedVerse(surah_id: number, ayah_number: number): Promise<string | null> {
    try {
      const cacheKey = `verse_${surah_id}_${ayah_number}`;
      const result = await Preferences.get({ key: cacheKey });
      
      if (!result.value) {
        return null;
      }

      const cachedVerse: CachedVerse = JSON.parse(result.value);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cachedVerse.cached_at > cachedVerse.ttl) {
        console.log(`⏰ Cache expired for verse ${surah_id}:${ayah_number}`);
        await this.removeCachedVerse(surah_id, ayah_number);
        return null;
      }

      console.log(`📖 Using cached verse ${surah_id}:${ayah_number}`);
      return cachedVerse.text;
    } catch (error) {
      console.error(`❌ Failed to get cached verse ${surah_id}:${ayah_number}:`, error);
      return null;
    }
  }

  /**
   * Remove a cached verse
   */
  async removeCachedVerse(surah_id: number, ayah_number: number): Promise<void> {
    try {
      const cacheKey = `verse_${surah_id}_${ayah_number}`;
      await Preferences.remove({ key: cacheKey });
      await this.updateCacheStats();
    } catch (error) {
      console.error(`❌ Failed to remove cached verse ${surah_id}:${ayah_number}:`, error);
    }
  }

  // ============= SURAH CACHING =============

  /**
   * Cache all surahs list
   */
  async cacheSurahs(surahs: CachedSurah[]): Promise<void> {
    try {
      const cacheData = {
        surahs,
        cached_at: Date.now(),
        version: this.CACHE_VERSION
      };

      await Preferences.set({
        key: 'all_surahs',
        value: JSON.stringify(cacheData)
      });

      console.log(`✅ Cached ${surahs.length} surahs`);
      await this.updateCacheStats();
    } catch (error) {
      console.error('❌ Failed to cache surahs:', error);
    }
  }

  /**
   * Get cached surahs list
   */
  async getCachedSurahs(): Promise<CachedSurah[] | null> {
    try {
      const result = await Preferences.get({ key: 'all_surahs' });
      
      if (!result.value) {
        return null;
      }

      const cacheData = JSON.parse(result.value);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cacheData.cached_at > this.SURAH_TTL) {
        console.log('⏰ Surahs cache expired');
        await Preferences.remove({ key: 'all_surahs' });
        return null;
      }

      console.log(`📚 Using cached surahs (${cacheData.surahs.length} items)`);
      return cacheData.surahs;
    } catch (error) {
      console.error('❌ Failed to get cached surahs:', error);
      return null;
    }
  }

  // ============= SURAH INFO CACHING =============

  /**
   * Cache surah info (verses count, etc.)
   */
  async cacheSurahInfo(surah_id: number, info: { name_arabic: string; verses_count: number }): Promise<void> {
    try {
      const cacheKey = `surah_info_${surah_id}`;
      const cacheData = {
        ...info,
        cached_at: Date.now(),
        ttl: this.SURAH_TTL
      };

      await Preferences.set({
        key: cacheKey,
        value: JSON.stringify(cacheData)
      });

      console.log(`✅ Cached surah info for ${surah_id}`);
    } catch (error) {
      console.error(`❌ Failed to cache surah info for ${surah_id}:`, error);
    }
  }

  /**
   * Get cached surah info
   */
  async getCachedSurahInfo(surah_id: number): Promise<{ name_arabic: string; verses_count: number } | null> {
    try {
      const cacheKey = `surah_info_${surah_id}`;
      const result = await Preferences.get({ key: cacheKey });
      
      if (!result.value) {
        return null;
      }

      const cacheData = JSON.parse(result.value);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cacheData.cached_at > cacheData.ttl) {
        await Preferences.remove({ key: cacheKey });
        return null;
      }

      console.log(`📋 Using cached surah info for ${surah_id}`);
      return {
        name_arabic: cacheData.name_arabic,
        verses_count: cacheData.verses_count
      };
    } catch (error) {
      console.error(`❌ Failed to get cached surah info for ${surah_id}:`, error);
      return null;
    }
  }

  // ============= CACHE MANAGEMENT =============

  /**
   * Update cache statistics
   */
  private async updateCacheStats(): Promise<void> {
    try {
      const keys = await Preferences.keys();
      const verseCount = keys.keys.filter(key => key.startsWith('verse_')).length;
      const surahCount = keys.keys.filter(key => key.startsWith('surah_')).length;
      
      const stats: CacheStats = {
        totalVerses: verseCount,
        totalSurahs: surahCount,
        cacheSize: keys.keys.length,
        lastUpdate: Date.now()
      };

      await Preferences.set({
        key: 'cache_stats',
        value: JSON.stringify(stats)
      });
    } catch (error) {
      console.error('❌ Failed to update cache stats:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats | null> {
    try {
      const result = await Preferences.get({ key: 'cache_stats' });
      return result.value ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await Preferences.keys();
      const cacheKeys = keys.keys.filter(key => 
        key.startsWith('verse_') || 
        key.startsWith('surah_') || 
        key === 'all_surahs' ||
        key === 'cache_stats'
      );

      for (const key of cacheKeys) {
        await Preferences.remove({ key });
      }

      console.log(`🗑️ Cleared ${cacheKeys.length} cache entries`);
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  /**
   * Preload popular surahs (Juz 30)
   */
  async preloadPopularSurahs(): Promise<void> {
    const popularSurahs = [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
    
    console.log('🚀 Preloading popular surahs...');
    
    for (const surahId of popularSurahs) {
      try {
        // This would typically fetch from your API
        // For now, we'll just cache placeholder data
        console.log(`📥 Preloading surah ${surahId}...`);
        // Implementation would call your actual API here
      } catch (error) {
        console.error(`❌ Failed to preload surah ${surahId}:`, error);
      }
    }
  }

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }
}

export const quranCache = QuranCacheService.getInstance();
export type { CachedVerse, CachedSurah, CacheStats };
