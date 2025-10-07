import { useTranslation } from "react-i18next"
import { Button } from "./ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Surah {
  value: string
  label: string
  arabicName?: string
}

interface SurahQuickBarProps {
  surahs: Surah[]
  selectedSurah: string
  onSurahSelect: (surahId: string) => void
  recentSurahs?: string[]
}

export function SurahQuickBar({ 
  surahs, 
  selectedSurah, 
  onSurahSelect, 
  recentSurahs = [] 
}: SurahQuickBarProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Get the most common/recent surahs for quick access
  // Default to Juz 30 surahs if no recent surahs
  const getQuickAccessSurahs = (): Surah[] => {
    const defaultQuickSurahs = [
      "112", "113", "114", "111", "110", "109", "108", "107", "106", "105"
    ]
    
    let quickSurahIds: string[]
    
    if (recentSurahs.length > 0) {
      // Use recent surahs, but ensure we have at least 5 items
      quickSurahIds = [...new Set([...recentSurahs, ...defaultQuickSurahs])].slice(0, 5)
    } else {
      quickSurahIds = defaultQuickSurahs.slice(0, 5)
    }
    
    return quickSurahIds
      .map(id => surahs.find(surah => surah.value === id))
      .filter((surah): surah is Surah => surah !== undefined)
  }

  const quickSurahs = getQuickAccessSurahs()

  const extractArabicName = (label: string): string => {
    // Extract Arabic name from label format "English Name - Arabic Name"
    const parts = label.split(' - ')
    return parts.length > 1 ? parts[1] : label
  }

  const extractEnglishName = (label: string): string => {
    // Extract English name from label format "English Name - Arabic Name"
    const parts = label.split(' - ')
    return parts[0]
  }

  if (quickSurahs.length === 0) {
    return null
  }

  return (
    <div className="w-full mb-4">
      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 min-w-max justify-center">
          {quickSurahs.map((surah) => {
            const isSelected = selectedSurah === surah.value
            const arabicName = extractArabicName(surah.label)
            const englishName = extractEnglishName(surah.label)
            
            return (
              <Button
                key={surah.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onSurahSelect(surah.value)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-16 px-2 py-2 text-xs transition-all duration-200",
                  "hover:scale-105 hover:shadow-md",
                  isSelected && "ring-2 ring-primary/20 shadow-lg",
                  "flex flex-col items-center justify-center"
                )}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <Check className="absolute -top-1 -right-1 h-4 w-4 text-primary bg-background rounded-full p-0.5" />
                )}
                
                {/* Surah names */}
                <div className={cn(
                  "flex flex-col items-center gap-0.5",
                  isArabic ? "flex-col-reverse" : "flex-col"
                )}>
                  <span className={cn(
                    "font-medium leading-tight text-center",
                    isArabic ? "text-[9px]" : "text-[10px]"
                  )}>
                    {isArabic ? arabicName : englishName}
                  </span>
                  <span className={cn(
                    "text-muted-foreground leading-tight text-center",
                    isArabic ? "text-[10px]" : "text-[9px]"
                  )}>
                    {isArabic ? englishName : arabicName}
                  </span>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
