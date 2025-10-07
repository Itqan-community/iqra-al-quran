import { useTranslation } from "react-i18next"
import { Trophy, ThumbsUp, Target } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Progress } from "./ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { useRecordingHistory } from "@/hooks/useRecordingHistory"
import type { RecordingResult } from "@/hooks/useRecordingHistory"
import { formatNumber } from "@/lib/utils"
import { WordAnalysis } from "./word-analysis"
import { useEffect, useState } from "react"

interface RecordingDetailProps {
  recordingId: string
  onClose: () => void
}

export function RecordingDetail({ recordingId, onClose }: RecordingDetailProps) {
  const { t, i18n } = useTranslation()
  const { getRecording } = useRecordingHistory()
  const [recording, setRecording] = useState<RecordingResult | null>(null)

  useEffect(() => {
    const foundRecording = getRecording(recordingId)
    if (foundRecording) {
      setRecording(foundRecording)
    } else {
      // If recording not found, close the sheet
      onClose()
    }
  }, [recordingId, getRecording, onClose])

  if (!recording) {
    return null
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side={i18n.language === 'ar' ? 'left' : 'right'} className="w-[90vw] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {t('recording_detail_title', 'Recitation Details')}: {recording.surahId ? `Surah ${recording.surahId}, Ayah ${recording.ayahNumber}` : new Date(recording.timestamp).toLocaleString()}
          </SheetTitle>
          <CardDescription>
            {t('recording_detail_desc', 'Detailed analysis of your past recitation.')}
          </CardDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('recitation_results', 'Recitation Results')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('accuracy_score', 'Accuracy Score')}</span>
                <span className={`font-bold text-lg flex items-center gap-2 ${recording.accuracy_percentage >= 80 ? 'text-green-600' : recording.accuracy_percentage >= 50 ? 'text-orange-500' : 'text-yellow-500'}`}>
                  {recording.accuracy_percentage >= 80 ? <Trophy className="h-5 w-5" /> :
                   recording.accuracy_percentage >= 50 ? <ThumbsUp className="h-5 w-5" /> :
                   <Target className="h-5 w-5" />}
                  {formatNumber(recording.accuracy_percentage, i18n.language)}%
                </span>
              </div>
              <Progress
                value={recording.accuracy_percentage}
                className={`${recording.accuracy_percentage >= 80 ? '[&>div]:bg-green-600' : recording.accuracy_percentage >= 50 ? '[&>div]:bg-orange-500' : '[&>div]:bg-yellow-500'}`}
              />
              
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">{t('your_recitation', 'Your Recitation:')}</h4>
                  <p className="text-sm bg-muted p-2 rounded">{recording.detected_text || t('no_text_detected', 'No text detected')}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">{t('reference_text_short', 'Reference Text:')}</h4>
                  <p className="text-sm bg-muted p-2 rounded" dir="rtl">{recording.reference_text}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">{t('wer_score_short', 'WER Score:')}</h4>
                  <p className="text-sm">{formatNumber((recording.wer_score * 100).toFixed(1), i18n.language)}% {t('word_error_rate', 'word error rate')}</p>
                </div>
              </div>
              
              {recording.word_analysis && recording.word_analysis.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <WordAnalysis analysis={recording.word_analysis} />
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={onClose}>{t('close', 'Close')}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
