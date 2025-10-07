// API Configuration for Iqra Al-Quran Frontend
// Centralized configuration for all API endpoints

interface ApiConfig {
  baseUrl: string
  endpoints: {
    health: string
    surahs: string
    allSurahs: string
    surahInfo: (surahId: string) => string
    ayahText: string
    checkRecitation: string
  }
}

// Get base URL - uses proxy in production, direct connection in dev
const getBaseUrl = (): string => {
  // In production (served by Express), use relative URL to proxy through /api
  // In development (Vite dev server), can use env var or direct connection
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Default: Use empty string for relative URLs (proxied by Express server)
  // This works in production where Express proxies /api to backend
  return ''
}

export const apiConfig: ApiConfig = {
  baseUrl: getBaseUrl(),
  endpoints: {
    health: '/api/health',
    surahs: '/api/surahs',
    allSurahs: '/api/all_surahs',
    surahInfo: (surahId: string) => `/api/get_surah_info/${surahId}`,
    ayahText: '/api/get_ayah',
    checkRecitation: '/api/check'
  }
}

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${apiConfig.baseUrl}${endpoint}`
}

// Convenience functions for common API calls
export const apiUrls = {
  health: () => buildApiUrl(apiConfig.endpoints.health),
  surahs: () => buildApiUrl(apiConfig.endpoints.surahs),
  allSurahs: () => buildApiUrl(apiConfig.endpoints.allSurahs),
  surahInfo: (surahId: string) => buildApiUrl(apiConfig.endpoints.surahInfo(surahId)),
  getAyahText: () => buildApiUrl(apiConfig.endpoints.ayahText),
  checkRecitation: () => buildApiUrl(apiConfig.endpoints.checkRecitation)
}

export default apiConfig
