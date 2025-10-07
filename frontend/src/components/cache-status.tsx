import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Database, Download, Trash2, Wifi, WifiOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import { quranApi } from "../services/quranApi"
import { formatNumber } from "../lib/utils"
import type { CacheStats } from "../services/quranCache"

interface CacheStatusProps {
  className?: string
}

export function CacheStatus({ className }: CacheStatusProps) {
  const { t, i18n } = useTranslation()
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isPreloading, setIsPreloading] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    loadCacheStats()
    
    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadCacheStats = async () => {
    try {
      const stats = await quranApi.getCacheStats()
      setCacheStats(stats)
    } catch (error) {
      console.error("Failed to load cache stats:", error)
    }
  }

  const handlePreloadContent = async () => {
    if (!isOnline) return
    
    setIsPreloading(true)
    try {
      await quranApi.preloadPopularContent()
      await loadCacheStats() // Refresh stats
    } catch (error) {
      console.error("Failed to preload content:", error)
    } finally {
      setIsPreloading(false)
    }
  }

  const handleClearCache = async () => {
    setIsClearing(true)
    try {
      await quranApi.clearCache()
      await loadCacheStats() // Refresh stats
    } catch (error) {
      console.error("Failed to clear cache:", error)
    } finally {
      setIsClearing(false)
    }
  }

  const formatCacheSize = (entries: number): string => {
    if (entries === 0) return "0 KB"
    // Rough estimate: each cache entry is about 1-2KB
    const sizeKB = entries * 1.5
    if (sizeKB < 1024) {
      return `${sizeKB.toFixed(0)} KB`
    }
    return `${(sizeKB / 1024).toFixed(1)} MB`
  }

  const formatLastUpdate = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return t("just_now", "Just now")
    if (minutes < 60) return t("minutes_ago", "{{count}} minutes ago", { count: minutes })
    if (hours < 24) return t("hours_ago", "{{count}} hours ago", { count: hours })
    return t("days_ago", "{{count}} days ago", { count: days })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {t("cache_status", "Cache Status")}
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cacheStats ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(cacheStats.totalVerses, i18n.language)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("cached_verses", "Cached Verses")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(cacheStats.totalSurahs, i18n.language)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("cached_surahs", "Cached Surahs")}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("cache_size", "Cache Size")}:</span>
                <span className="font-medium">{formatCacheSize(cacheStats.cacheSize)}</span>
              </div>
              
              {cacheStats.lastUpdate && (
                <div className="flex justify-between text-sm">
                  <span>{t("last_update", "Last Update")}:</span>
                  <span className="font-medium">{formatLastUpdate(cacheStats.lastUpdate)}</span>
                </div>
              )}
              
              {/* Progress indicator for cached content */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t("download_progress", "Download Progress")}:</span>
                  <span>{Math.round((cacheStats.totalSurahs / 114) * 100)}%</span>
                </div>
                <Progress value={(cacheStats.totalSurahs / 114) * 100} className="h-2" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreloadContent}
                disabled={!isOnline || isPreloading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {isPreloading ? t("downloading", "Downloading...") : t("download_more", "Download More")}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                disabled={isClearing}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isClearing ? t("clearing", "Clearing...") : t("clear_cache", "Clear Cache")}
              </Button>
            </div>

            {!isOnline && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded text-center">
                {t("offline_mode", "You're offline. Using cached content only.")}
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            {t("loading_cache_stats", "Loading cache statistics...")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
