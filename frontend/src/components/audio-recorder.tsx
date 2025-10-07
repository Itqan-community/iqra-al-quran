import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, ThumbsUp, Target, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { formatNumber } from "@/lib/utils"
import { WordAnalysis } from "./word-analysis"
import { quranApi } from "@/services/quranApi"
import { useSettings } from "@/hooks/useSettings"
import { useRecordingHistory } from "@/hooks/useRecordingHistory"

interface AudioRecorderProps {
  surahId: string
  ayahNumber: string
}

export function AudioRecorder({ surahId, ayahNumber }: AudioRecorderProps) {
  const { i18n, t } = useTranslation()
  const { settings } = useSettings()
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const countdownCancelledRef = useRef<boolean>(false)
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const { addRecording } = useRecordingHistory()

  // Reset cancelled state when countdown changes
  useEffect(() => {
    if (countdown === null) {
      countdownCancelledRef.current = false
    }
  }, [countdown])

  // Scroll to results when they become available
  useEffect(() => {
    if (results && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
      }, 300) // Small delay to ensure DOM is updated
    }
  }, [results])

  // Draw static visualization on component mount and theme changes
  useEffect(() => {
    drawStaticVisualization()
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      if (!isRecording && !audioURL) {
        drawStaticVisualization()
      }
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [isRecording, audioURL])

  const startCountdown = async () => {
    try {
      countdownCancelledRef.current = false
      
      // Start countdown from 3
      for (let i = 3; i > 0; i--) {
        if (countdownCancelledRef.current) {
          setCountdown(null)
          return
        }
        setCountdown(i)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      if (countdownCancelledRef.current) {
        setCountdown(null)
        return
      }
      
      setCountdown(null)
      
      // Now start actual recording
      await startActualRecording()
    } catch (error) {
      console.error("Error during countdown:", error)
      setCountdown(null)
    }
  }

  const cancelCountdown = () => {
    countdownCancelledRef.current = true
    setCountdown(null)
  }

  const startActualRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data)
    }
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" })
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudioURL(audioUrl)
      audioChunks.current = []
      
      // Automatically check recitation after recording stops
      setTimeout(async () => {
        await checkRecitationWithBlob(audioBlob)
      }, 100) // Small delay to ensure state is updated
    }
    mediaRecorder.current.start()
    setIsRecording(true)
    visualize(stream)
  }

  const startRecording = () => {
    if (settings.showCountdown) {
      startCountdown()
    } else {
      startActualRecording()
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close();
      }
    }
  }

  const setupCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    // Get device pixel ratio for high-DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1
    
    // Get the display size (CSS pixels)
    const rect = canvas.getBoundingClientRect()
    const displayWidth = rect.width
    const displayHeight = rect.height
    
    // Set the actual size in memory (scaled up for high-DPI)
    canvas.width = displayWidth * devicePixelRatio
    canvas.height = displayHeight * devicePixelRatio
    
    // Scale the canvas back down using CSS
    canvas.style.width = displayWidth + 'px'
    canvas.style.height = displayHeight + 'px'
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(devicePixelRatio, devicePixelRatio)
    
    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    return { ctx, width: displayWidth, height: displayHeight }
  }

  const drawStaticVisualization = () => {
    if (!canvasRef.current) return
    
    const canvasSetup = setupCanvas(canvasRef.current)
    if (!canvasSetup) return
    
    const { ctx, width, height } = canvasSetup
    
    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark')
    
    // Clear canvas with theme-appropriate background color
    ctx.fillStyle = isDarkMode ? "rgb(39 39 42)" : "rgb(241 245 249)" // zinc-800 : slate-100
    ctx.fillRect(0, 0, width, height)
    
    // Create static bars with random heights to simulate audio visualization
    const barCount = Math.min(64, Math.floor(width / 8)) // Responsive bar count
    const barWidth = (width / barCount) * 0.7
    const barSpacing = (width / barCount) * 0.3
    
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barSpacing) + barSpacing / 2
      
      // Create a wave-like pattern with some randomness
      const baseHeight = Math.sin((i / barCount) * Math.PI * 4) * (height * 0.3) + (height * 0.4)
      const randomVariation = Math.random() * (height * 0.2)
      const barHeight = Math.max(height * 0.1, baseHeight + randomVariation)
      
      // Add rounded corners to bars
      ctx.beginPath()
      const radius = Math.min(barWidth / 4, 3)
      const barY = height - barHeight
      
      // Draw rounded rectangle
      ctx.moveTo(x + radius, barY)
      ctx.lineTo(x + barWidth - radius, barY)
      ctx.quadraticCurveTo(x + barWidth, barY, x + barWidth, barY + radius)
      ctx.lineTo(x + barWidth, height - radius)
      ctx.quadraticCurveTo(x + barWidth, height, x + barWidth - radius, height)
      ctx.lineTo(x + radius, height)
      ctx.quadraticCurveTo(x, height, x, height - radius)
      ctx.lineTo(x, barY + radius)
      ctx.quadraticCurveTo(x, barY, x + radius, barY)
      ctx.closePath()
      
      // Use theme-appropriate colors with gradients
      if (isDarkMode) {
        // Dark mode: gradient from blue to lighter blue
        const gradient = ctx.createLinearGradient(x, barY, x, height)
        const intensity = (barHeight / height) * 0.8 + 0.2
        gradient.addColorStop(0, `rgba(147, 197, 253, ${intensity})`) // blue-300
        gradient.addColorStop(1, `rgba(59, 130, 246, ${intensity * 0.6})`) // blue-500
        ctx.fillStyle = gradient
      } else {
        // Light mode: gradient from darker to lighter blue
        const gradient = ctx.createLinearGradient(x, barY, x, height)
        const intensity = (barHeight / height) * 0.7 + 0.3
        gradient.addColorStop(0, `rgba(59, 130, 246, ${intensity})`) // blue-500
        gradient.addColorStop(1, `rgba(147, 197, 253, ${intensity * 0.7})`) // blue-300
        ctx.fillStyle = gradient
      }
      
      ctx.fill()
    }
    
    // Add a subtle text overlay with better typography
    ctx.fillStyle = isDarkMode ? "rgba(156, 163, 175, 0.8)" : "rgba(100, 116, 139, 0.7)" // gray-400 : slate-500
    ctx.font = `${Math.max(12, width / 40)}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("...", width / 2, height / 2)
  }

  const visualize = (stream: MediaStream) => {
    audioContext.current = new AudioContext()
    analyser.current = audioContext.current.createAnalyser()
    const source = audioContext.current.createMediaStreamSource(stream)
    source.connect(analyser.current)
    analyser.current.fftSize = 256
    const bufferLength = analyser.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw)
      if (analyser.current && canvasRef.current) {
        analyser.current.getByteFrequencyData(dataArray)
        
        const canvasSetup = setupCanvas(canvasRef.current)
        if (!canvasSetup) return
        
        const { ctx, width, height } = canvasSetup
        const isDarkMode = document.documentElement.classList.contains('dark')
        
        // Clear canvas with theme-appropriate background
        ctx.fillStyle = isDarkMode ? "rgb(39 39 42)" : "rgb(241 245 249)"
        ctx.fillRect(0, 0, width, height)
        
        // Calculate responsive bar dimensions
        const barCount = Math.min(bufferLength, Math.floor(width / 4))
        const barWidth = (width / barCount) * 0.8
        const barSpacing = (width / barCount) * 0.2
        
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * bufferLength)
          const barHeight = (dataArray[dataIndex] / 255) * height * 0.8
          const x = i * (barWidth + barSpacing) + barSpacing / 2
          const barY = height - barHeight
          
          // Draw rounded bars with gradients
          ctx.beginPath()
          const radius = Math.min(barWidth / 4, 2)
          
          ctx.moveTo(x + radius, barY)
          ctx.lineTo(x + barWidth - radius, barY)
          ctx.quadraticCurveTo(x + barWidth, barY, x + barWidth, barY + radius)
          ctx.lineTo(x + barWidth, height - radius)
          ctx.quadraticCurveTo(x + barWidth, height, x + barWidth - radius, height)
          ctx.lineTo(x + radius, height)
          ctx.quadraticCurveTo(x, height, x, height - radius)
          ctx.lineTo(x, barY + radius)
          ctx.quadraticCurveTo(x, barY, x + radius, barY)
          ctx.closePath()
          
          // Dynamic gradient based on audio intensity
          const gradient = ctx.createLinearGradient(x, barY, x, height)
          const intensity = Math.max(0.3, barHeight / height)
          
          if (isDarkMode) {
            gradient.addColorStop(0, `rgba(34, 197, 94, ${intensity})`) // green-500
            gradient.addColorStop(0.5, `rgba(59, 130, 246, ${intensity * 0.8})`) // blue-500
            gradient.addColorStop(1, `rgba(147, 51, 234, ${intensity * 0.6})`) // purple-600
          } else {
            gradient.addColorStop(0, `rgba(16, 185, 129, ${intensity})`) // emerald-500
            gradient.addColorStop(0.5, `rgba(37, 99, 235, ${intensity * 0.8})`) // blue-600
            gradient.addColorStop(1, `rgba(124, 58, 237, ${intensity * 0.6})`) // violet-600
          }
          
          ctx.fillStyle = gradient
          ctx.fill()
        }
      }
    }
    draw()
  }

  const checkRecitationWithBlob = async (blob: Blob) => {
    setIsLoading(true)
    setProcessingTime(null)
    const formData = new FormData()
    formData.append("audio", blob)
    formData.append("surah_id", surahId)
    formData.append("ayah_number", ayahNumber)
    formData.append("language", i18n.language) // Use current language 
    
    try {
      const data = await quranApi.checkRecitation(formData)
      
      // Use server-side processing time (more accurate than client-side timing)
      const serverProcessingTime = data.processing_time || null
      setProcessingTime(serverProcessingTime)
      
      if (data.error) {
        setResults({ error: data.error })
      } else {
        setResults(data)
        // Save recording to history
        console.log('AudioRecorder - About to save recording:', {
          surahId: surahId,
          ayahNumber: ayahNumber,
          accuracy_percentage: data.accuracy_percentage,
          detected_text: data.detected_text,
          reference_text: data.reference_text,
          wer_score: data.wer_score,
          feedback: data.feedback,
          word_analysis: data.word_analysis,
          language: i18n.language,
        })
        addRecording({
          surahId: surahId,
          ayahNumber: ayahNumber,
          accuracy_percentage: data.accuracy_percentage,
          detected_text: data.detected_text,
          reference_text: data.reference_text,
          wer_score: data.wer_score,
          feedback: data.feedback,
          word_analysis: data.word_analysis,
          language: i18n.language,
        })
        console.log('AudioRecorder - addRecording called')
      }
    } catch (error) {
      console.error("Error checking recitation:", error)
      setResults({ error: "Failed to check recitation. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }


  const reRecord = async () => {
    setAudioURL("")
    setResults(null)
    setProcessingTime(null)
    
    // Redraw static visualization
    setTimeout(() => drawStaticVisualization(), 100)
    
    // Automatically start recording with countdown
    try {
      if (settings.showCountdown) {
        await startCountdown()
      } else {
        await startActualRecording()
      }
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  return (
    <div className="relative flex flex-col items-center gap-4 w-full">
      {/* Countdown Overlay */}
      {countdown && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-2xl border-4 border-blue-200 dark:border-blue-800 max-w-sm w-full mx-4">
            {/* Close Button */}
            <button
              onClick={cancelCountdown}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={t("cancel_countdown")}
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* Countdown Content */}
            <div className="flex flex-col items-center gap-6">
              <div className="text-8xl font-bold text-blue-600 dark:text-blue-300 animate-pulse drop-shadow-lg">
                {formatNumber(countdown, i18n.language)}
              </div>
              <div className="text-center space-y-3">
                <p className="text-lg text-gray-600 dark:text-gray-200 font-medium">
                  {t("get_ready")}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <p dir="rtl" className="text-sm leading-relaxed">فَإِذَا قَرَأْتَ الْقُرْآنَ فَاسْتَعِذْ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ</p>
                  <p>...</p>
                  <p dir="rtl" className="text-xs">أَعُوذُ بِاللهِ مِنَ الشَيْطَانِ الرَجِيمِ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="h-14 md:h-24 w-full bg-muted rounded-lg" />
      
      {!audioURL && !countdown && (
        !isRecording ? (
          <Button onClick={startRecording}>Start Recording</Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive">
            Stop Recording
          </Button>
        )
      )}
      {audioURL && (
        <div className="flex flex-col items-center gap-2 w-full">
          <audio src={audioURL} controls className="w-full" />
          <div className="flex gap-2">
            <Button onClick={reRecord} variant="outline">Re-record</Button>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Checking your recitation...
              </div>
            )}
          </div>
        </div>
      )}
      {results && (
        <Card ref={resultsRef} className="w-full">
          <CardHeader>
            <CardTitle>Recitation Results</CardTitle>
            <CardDescription>
              {results.error ? "Error occurred during analysis" : "Here is the feedback on your recitation."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.error ? (
              <div className="text-center py-4">
                <p className="text-destructive">{results.error}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Accuracy Score</span>
                  <span className={`font-bold text-lg flex items-center gap-2 ${
                    results.accuracy_percentage >= 80 ? 'text-green-600' :
                    results.accuracy_percentage >= 50 ? 'text-orange-500' :
                    'text-yellow-500'
                  }`}>
                    {results.accuracy_percentage >= 80 ? <Trophy className="h-5 w-5" /> :
                     results.accuracy_percentage >= 50 ? <ThumbsUp className="h-5 w-5" /> :
                     <Target className="h-5 w-5" />}
                    {formatNumber(results.accuracy_percentage, i18n.language)}%
                  </span>
                </div>
                <Progress 
                  value={results.accuracy_percentage}
                  className={`${
                    results.accuracy_percentage >= 80 ? '[&>div]:bg-green-600' :
                    results.accuracy_percentage >= 50 ? '[&>div]:bg-orange-500' :
                    '[&>div]:bg-yellow-500'
                  }`}
                />
                
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold">Your Recitation:</h4>
                    <p className="text-sm bg-muted p-2 rounded">{results.detected_text || "No text detected"}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">Reference Text:</h4>
                    <p className="text-sm bg-muted p-2 rounded" dir="rtl">{results.reference_text}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">WER Score:</h4>
                    <p className="text-sm">{formatNumber((results.wer_score * 100).toFixed(1), i18n.language)}% word error rate</p>
                  </div>
                  
                  {processingTime && (
                    <div>
                      <h4 className="font-semibold">Processing Time:</h4>
                      <p className="text-sm">{formatNumber(processingTime.toFixed(1), i18n.language)} seconds</p>
                    </div>
                  )}
                </div>
                
                {/* Word-by-Word Analysis */}
                {results.word_analysis && results.word_analysis.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <WordAnalysis analysis={results.word_analysis} />
                  </div>
                )}
              </>
            )}
          </CardContent>
          {!results.error && (
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                {results.feedback}
              </p>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  )
}
