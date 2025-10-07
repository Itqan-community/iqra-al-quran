import { useState, useEffect } from 'react'

const RECENT_SURAHS_KEY = 'iqra-recent-surahs'
const MAX_RECENT_SURAHS = 5

export function useRecentSurahs() {
  const [recentSurahs, setRecentSurahs] = useState<string[]>([])

  // Load recent surahs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SURAHS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentSurahs(parsed)
        }
      }
    } catch (error) {
      console.warn('Failed to load recent surahs from localStorage:', error)
    }
  }, [])

  // Add a surah to recent list
  const addRecentSurah = (surahId: string) => {
    if (!surahId) return

    setRecentSurahs(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(id => id !== surahId)
      
      // Add to beginning of array
      const updated = [surahId, ...filtered].slice(0, MAX_RECENT_SURAHS)
      
      // Save to localStorage
      try {
        localStorage.setItem(RECENT_SURAHS_KEY, JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to save recent surahs to localStorage:', error)
      }
      
      return updated
    })
  }

  // Clear all recent surahs
  const clearRecentSurahs = () => {
    setRecentSurahs([])
    try {
      localStorage.removeItem(RECENT_SURAHS_KEY)
    } catch (error) {
      console.warn('Failed to clear recent surahs from localStorage:', error)
    }
  }

  return {
    recentSurahs,
    addRecentSurah,
    clearRecentSurahs
  }
}
