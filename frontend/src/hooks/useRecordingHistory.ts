import { useState, useEffect } from 'react'

export interface RecordingResult {
  id: string
  timestamp: number
  surahId: string
  ayahNumber: string
  accuracy_percentage: number
  detected_text: string
  reference_text: string
  wer_score: number
  feedback: string
  word_analysis?: any[] // Optional, as it might not always be present or fully implemented
  language: string
}

const RECORDING_HISTORY_KEY = 'iqra-recording-history'
const MAX_RECORDING_ENTRIES = 20

export function useRecordingHistory() {
  const [history, setHistory] = useState<RecordingResult[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    console.log('useRecordingHistory - Loading from localStorage on mount')
    try {
      const storedHistory = localStorage.getItem(RECORDING_HISTORY_KEY)
      console.log('useRecordingHistory - storedHistory from localStorage:', storedHistory)
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory)
        console.log('useRecordingHistory - parsedHistory:', parsedHistory)
        // Ensure we don't load more than MAX_RECORDING_ENTRIES
        const limitedHistory = parsedHistory.slice(0, MAX_RECORDING_ENTRIES)
        console.log('useRecordingHistory - limitedHistory (max 20):', limitedHistory)
        setHistory(limitedHistory)
      } else {
        console.log('useRecordingHistory - No stored history found, starting with empty array')
      }
    } catch (error) {
      console.error("Failed to load recording history from localStorage:", error)
    } finally {
      setIsLoaded(true)
      console.log('useRecordingHistory - isLoaded set to true')
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    console.log('useRecordingHistory - Saving to localStorage, history:', history)
    try {
      const serialized = JSON.stringify(history)
      console.log('useRecordingHistory - Serialized data:', serialized)
      localStorage.setItem(RECORDING_HISTORY_KEY, serialized)
      console.log('useRecordingHistory - Successfully saved to localStorage')
      
      // Verify it was saved
      const verification = localStorage.getItem(RECORDING_HISTORY_KEY)
      console.log('useRecordingHistory - Verification read from localStorage:', verification)
    } catch (error) {
      console.error("Failed to save recording history to localStorage:", error)
    }
  }, [history])

  const addRecording = (newRecording: Omit<RecordingResult, 'id' | 'timestamp'>) => {
    console.log('useRecordingHistory - addRecording called with:', newRecording)
    setHistory(prevHistory => {
      const newEntry: RecordingResult = {
        id: Date.now().toString(), // Simple unique ID
        timestamp: Date.now(),
        ...newRecording,
      }
      console.log('useRecordingHistory - newEntry created:', newEntry)
      // Add to front and limit size
      const fullHistory = [newEntry, ...prevHistory]
      const updatedHistory = fullHistory.slice(0, MAX_RECORDING_ENTRIES)
      console.log('useRecordingHistory - fullHistory length:', fullHistory.length)
      console.log('useRecordingHistory - updatedHistory length (max 20):', updatedHistory.length)
      console.log('useRecordingHistory - updatedHistory:', updatedHistory)
      console.log('useRecordingHistory - prevHistory was:', prevHistory)
      
      if (fullHistory.length > MAX_RECORDING_ENTRIES) {
        console.log(`useRecordingHistory - Trimmed ${fullHistory.length - MAX_RECORDING_ENTRIES} old recordings to maintain 20-recording limit`)
      }
      return updatedHistory
    })
  }

  const getRecording = (id: string): RecordingResult | undefined => {
    return history.find(rec => rec.id === id)
  }

  const clearHistory = () => {
    setHistory([])
  }

  return { history, addRecording, getRecording, clearHistory, isLoaded }
}
