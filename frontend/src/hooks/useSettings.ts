import { useState, useEffect } from 'react'

export interface UserSettings {
  userName: string
  showCountdown: boolean
  autoStartRecording: boolean
  language: string
  theme: string
}

const DEFAULT_SETTINGS: UserSettings = {
  userName: '',
  showCountdown: true,
  autoStartRecording: true,
  language: 'en',
  theme: 'dark'
}

const SETTINGS_KEY = 'iqra-user-settings'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings))
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error)
    }
  }

  // Update individual setting
  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    updateSettings({ [key]: value })
  }

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    try {
      localStorage.removeItem(SETTINGS_KEY)
    } catch (error) {
      console.warn('Failed to clear settings from localStorage:', error)
    }
  }

  return {
    settings,
    isLoaded,
    updateSettings,
    updateSetting,
    resetSettings
  }
}
