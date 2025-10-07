import { useTranslation } from "react-i18next"

interface WordAnalysisItem {
  text: string
  status: "correct" | "wrong" | "insert" | "missing"
  type: "reference" | "detected"
}

interface WordAnalysisProps {
  analysis: WordAnalysisItem[]
  className?: string
}

export function WordAnalysis({ analysis, className = "" }: WordAnalysisProps) {
  const { t } = useTranslation()

  if (!analysis || analysis.length === 0) {
    return null
  }

  // Group words by type for better display
  const referenceWords = analysis.filter(item => item.type === "reference")
  const detectedWords = analysis.filter(item => item.type === "detected")

  const getWordClassName = (status: string) => {
    switch (status) {
      case "correct":
        return "bg-green-100 text-green-800 border-green-200"
      case "wrong":
        return "bg-red-100 text-red-800 border-red-200"
      case "insert":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "missing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "correct":
        return "✓"
      case "wrong":
        return "✗"
      case "insert":
        return "+"
      case "missing":
        return "-"
      default:
        return ""
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground">
        {t("word_analysis_title", "Word-by-Word Analysis")}
      </div>
      
      {/* Reference Text Analysis */}
      {referenceWords.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
            {t("reference_analysis", "Reference Text")}
          </h4>
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg" dir="rtl">
            {referenceWords.map((word, index) => (
              <span
                key={`ref-${index}`}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border
                  ${getWordClassName(word.status)}
                `}
                title={`${word.status}: ${word.text}`}
              >
                <span className="text-xs">{getStatusIcon(word.status)}</span>
                {word.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detected Text Analysis */}
      {detectedWords.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
            {t("detected_analysis", "Your Recitation")}
          </h4>
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg" dir="rtl">
            {detectedWords.map((word, index) => (
              <span
                key={`det-${index}`}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border
                  ${getWordClassName(word.status)}
                `}
                title={`${word.status}: ${word.text}`}
              >
                <span className="text-xs">{getStatusIcon(word.status)}</span>
                {word.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-200 rounded border border-green-300"></span>
          <span>{t("correct_words", "Correct")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-200 rounded border border-red-300"></span>
          <span>{t("wrong_words", "Wrong")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-200 rounded border border-orange-300"></span>
          <span>{t("extra_words", "Extra")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-200 rounded border border-yellow-300"></span>
          <span>{t("missing_words", "Missing")}</span>
        </div>
      </div>
    </div>
  )
}
