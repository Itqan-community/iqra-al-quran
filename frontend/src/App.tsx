import { useTranslation } from "react-i18next"
import { MobileNav } from "./components/mobile-nav"
import { AboutPage } from "./components/pages/about"
import { ContactPage } from "./components/pages/contact"
import { SettingsPage } from "./components/pages/settings"
import { ProfilePage } from "./components/pages/profile"
import { useEffect, useState } from "react"
import { Combobox } from "./components/ui/combobox"
import { AudioRecorder } from "./components/audio-recorder"
import { SurahQuickBar } from "./components/surah-quick-bar"
import { formatNumber } from "./lib/utils"
import { useRecentSurahs } from "./hooks/useRecentSurahs"
import { useSettings } from "./hooks/useSettings"
import { useRecordingHistory } from "./hooks/useRecordingHistory"
import { quranApi } from "./services/quranApi"

function App() {
  const { t, i18n } = useTranslation()
  const { recentSurahs, addRecentSurah } = useRecentSurahs()
  const { settings, isLoaded: settingsLoaded } = useSettings()
  const { history, isLoaded: historyLoaded } = useRecordingHistory()
  const [surahs, setSurahs] = useState<{ value: string; label: string }[]>([])
  const [selectedSurah, setSelectedSurah] = useState("")
  const [ayahs, setAyahs] = useState<{ value: string; label: string }[]>([])
  const [selectedAyah, setSelectedAyah] = useState("")
  const [surahInfo, setSurahInfo] = useState<{ name_arabic: string; verses_count: number } | null>(null)
  const [currentPage, setCurrentPage] = useState("home")

  // Check if user should have access to profile (only after both are loaded)
  const shouldShowProfile = settingsLoaded && historyLoaded && (settings.userName.trim() !== '' || history.length > 0)

  useEffect(() => {
    document.documentElement.dir = i18n.dir()
  }, [i18n, i18n.language])

  useEffect(() => {
    // Fetch ALL surahs (complete Quran) with caching
    const fetchSurahs = async () => {
      try {
        const result = await quranApi.getAllSurahs()
        
        if (result.data?.surahs) {
          const formattedSurahs = result.data.surahs.map((surah: any) => ({
            value: surah.id.toString(),
            label: `${surah.name_english || surah.name_simple} - ${surah.name_arabic}`
          }))
          setSurahs(formattedSurahs)
          
          // Show cache status in console
          if (result.fromCache) {
            console.log("📚 Loaded surahs from cache")
          } else {
            console.log("🌐 Loaded surahs from API and cached")
          }
        } else {
          throw new Error(result.error || "No surahs data received")
        }
      } catch (error) {
        console.error("❌ Error fetching surahs:", error)
        // Fallback to a few hardcoded surahs if both API and cache fail
        const fallbackSurahs = [
          { value: "112", label: "Al-Ikhlas - الإخلاص" },
          { value: "113", label: "Al-Falaq - الفلق" },
          { value: "114", label: "An-Nas - الناس" },
        ]
        setSurahs(fallbackSurahs)
      }
    }

    fetchSurahs()
    
    // Start background preloading of popular content
    quranApi.preloadPopularContent().catch(console.error)
  }, [])

  // Fetch surah info and generate ayahs when surah is selected
  useEffect(() => {
    if (!selectedSurah) {
      setAyahs([])
      setSelectedAyah("")
      setSurahInfo(null)
      return
    }

    const fetchSurahInfo = async () => {
      try {
        const result = await quranApi.getSurahInfo(parseInt(selectedSurah))
        
        if (result.data?.verses_count) {
          setSurahInfo(result.data)
          
          // Generate ayah options
          const ayahOptions = Array.from({ length: result.data.verses_count }, (_, i) => ({
            value: (i + 1).toString(),
            label: `${t("ayah")} ${formatNumber(i + 1, i18n.language)}`
          }))
          setAyahs(ayahOptions)
          
          // Show cache status in console
          if (result.fromCache) {
            console.log(`📋 Loaded surah ${selectedSurah} info from cache`)
          } else {
            console.log(`🌐 Loaded surah ${selectedSurah} info from API and cached`)
          }
        } else {
          throw new Error(result.error || "No surah info received")
        }
      } catch (error) {
        console.error(`❌ Error fetching surah ${selectedSurah} info:`, error)
        // Fallback - assume common short surahs have few verses
        const fallbackVerses = selectedSurah === "112" ? 4 : selectedSurah === "113" ? 5 : selectedSurah === "114" ? 6 : 10
        const ayahOptions = Array.from({ length: fallbackVerses }, (_, i) => ({
          value: (i + 1).toString(),
          label: `${t("ayah")} ${formatNumber(i + 1, i18n.language)}`
        }))
        setAyahs(ayahOptions)
      }
    }

    fetchSurahInfo()
    setSelectedAyah("") // Reset ayah selection when surah changes
  }, [selectedSurah, t])

  // Handle surah selection from both dropdown and quick bar
  const handleSurahSelect = (surahId: string) => {
    setSelectedSurah(surahId)
    if (surahId) {
      addRecentSurah(surahId)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case "about":
        return <AboutPage />
      case "contact":
        return <ContactPage />
      case "settings":
        return <SettingsPage />
      case "profile":
        // Only show profile if user has name or recordings
        if (shouldShowProfile) {
          return <ProfilePage onNavigateToHome={() => setCurrentPage("home")} />
        } else {
          // Redirect to home if profile shouldn't be accessible
          setCurrentPage("home")
          return null
        }
      case "home":
      default:
        return (
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground">{t("subtitle")}</p>
              {settings.userName && (
                <p className="text-sm text-primary font-medium">
                  {t("welcome_back", "Welcome back")}, {settings.userName}!
                </p>
              )}
            </div>
            <div className="flex flex-col items-center gap-4 w-full md:max-w-4xl mx-auto">
              {/* Surah Quick Access Bar */}
              {surahs.length > 0 && (
                <SurahQuickBar
                  surahs={surahs}
                  selectedSurah={selectedSurah}
                  onSurahSelect={handleSurahSelect}
                  recentSurahs={recentSurahs}
                />
              )}
              
              {/* Surah Dropdown and Ayah Selection */}
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:max-w-4xl mx-auto justify-center">
                {/* Surah Dropdown */}
                <div className="w-full flex justify-center">
                  <Combobox
                    items={surahs}
                    value={selectedSurah}
                    onChange={handleSurahSelect}
                    placeholder={t("select_surah")}
                    emptyMessage={t("no_surah_found")}
                  />
                </div>
                
                {/* Ayah Selection */}
                {selectedSurah && ayahs.length > 0 && (
                  <div className="w-full flex justify-center">
                    <Combobox
                      items={ayahs}
                      value={selectedAyah}
                      onChange={setSelectedAyah}
                      placeholder={t("select_ayah")}
                      emptyMessage={t("no_ayah_found")}
                    />
                  </div>
                )}
              </div>
              
              {/* Selected Surah and Ayah Info */}
              {surahInfo && selectedAyah && (
                <div className="text-center text-sm text-muted-foreground mt-4">
                  {surahInfo.name_arabic} - {t("ayah")} {formatNumber(selectedAyah, i18n.language)}
                </div>
              )}
              
              {/* Audio Recorder */}
              {selectedSurah && selectedAyah && (
                <AudioRecorder surahId={selectedSurah} ayahNumber={selectedAyah} />
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  )
}

export default App
