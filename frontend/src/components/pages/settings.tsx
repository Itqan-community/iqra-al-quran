import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Combobox } from "../ui/combobox"
import { useSettings } from "../../hooks/useSettings"
import { User, Timer, Palette, RotateCcw, Save, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRecordingHistory } from "../../hooks/useRecordingHistory"
import { RecordingDetail } from "@/components/RecordingDetail"
import { CacheStatus } from "@/components/cache-status"

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { settings, updateSetting, resetSettings } = useSettings()
  const { setTheme } = useTheme()
  const { history, clearHistory } = useRecordingHistory()
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null)
  const [tempUserName, setTempUserName] = useState(settings.userName)
  const [hasChanges, setHasChanges] = useState(false)

  // Update temp name when settings change
  useEffect(() => {
    setTempUserName(settings.userName)
  }, [settings.userName])

  // Track changes
  useEffect(() => {
    setHasChanges(tempUserName !== settings.userName)
  }, [tempUserName, settings.userName])

  const handleSaveUserName = () => {
    updateSetting('userName', tempUserName.trim())
    setHasChanges(false)
  }

  const handleLanguageChange = (newLanguage: string) => {
    updateSetting('language', newLanguage)
    i18n.changeLanguage(newLanguage)
  }

  const handleThemeChange = (newTheme: string) => {
    updateSetting('theme', newTheme)
    setTheme(newTheme)
  }

  const settingSections = [
    {
      id: 'personal',
      title: t('personal_settings', 'Personal Settings'),
      icon: User,
      items: [
        {
          id: 'userName',
          type: 'input' as const,
          title: t('user_name', 'Your Name'),
          description: t('user_name_desc', 'Enter your name for a personalized experience'),
          value: tempUserName,
          onChange: setTempUserName,
          placeholder: t('enter_name', 'Enter your name...')
        }
      ]
    },
    {
      id: 'recording',
      title: t('recording_settings', 'Recording Settings'),
      icon: Timer,
      items: [
        {
          id: 'showCountdown',
          type: 'switch' as const,
          title: t('show_countdown', 'Show Countdown Timer'),
          description: t('show_countdown_desc', 'Display 3-2-1 countdown before recording starts'),
          checked: settings.showCountdown,
          onChange: (checked: boolean) => updateSetting('showCountdown', checked)
        },
        {
          id: 'autoStartRecording',
          type: 'switch' as const,
          title: t('auto_start_recording', 'Auto-start Recording'),
          description: t('auto_start_desc', 'Automatically start recording after countdown'),
          checked: settings.autoStartRecording,
          onChange: (checked: boolean) => updateSetting('autoStartRecording', checked)
        }
      ]
    },
    {
      id: 'appearance',
      title: t('appearance_settings', 'Appearance'),
      icon: Palette,
      items: [
        {
          id: 'language',
          type: 'select' as const,
          title: t('language', 'Language'),
          description: t('language_desc', 'Choose your preferred language'),
          value: settings.language,
          onChange: handleLanguageChange,
          options: [
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'العربية' }
          ]
        },
        {
          id: 'theme',
          type: 'select' as const,
          title: t('theme', 'Theme'),
          description: t('theme_desc', 'Choose your preferred color theme'),
          value: settings.theme,
          onChange: handleThemeChange,
          options: [
            { value: 'light', label: t('light_theme', 'Light') },
            { value: 'dark', label: t('dark_theme', 'Dark') },
            { value: 'system', label: t('system_theme', 'System') }
          ]
        }
      ]
    },
    {
      id: 'recording_history',
      title: t('recording_history_title', 'Recording History'),
      icon: FileText,
      items: [] // No individual setting items, history is displayed directly
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {t('settings', 'Settings')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('settings_desc', 'Customize your Iqra Al-Quran experience with these preferences')}
        </p>
      </div>

      {/* Greeting */}
      {settings.userName && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {t('welcome_back', 'Welcome back')}, {settings.userName}!
                </h3>
                <p className="text-muted-foreground">
                  {t('settings_saved', 'Your preferences are saved and will be remembered')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section) => (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.items.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor={item.id} className="text-base font-medium">
                        {item.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="ml-4">
                      {item.type === 'input' && (
                        <div className="flex items-center gap-2">
                          <Input
                            id={item.id}
                            value={item.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => item.onChange?.(e.target.value)}
                            placeholder={item.placeholder}
                            className="w-48"
                          />
                          {hasChanges && item.id === 'userName' && (
                            <Button onClick={handleSaveUserName} size="sm">
                              <Save className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {item.type === 'switch' && (
                        <Switch
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(checked: boolean) => item.onChange?.(checked)}
                        />
                      )}
                      
                      {item.type === 'select' && (
                        <div className="w-48">
                          <Combobox
                            items={item.options?.map(opt => ({ value: opt.value, label: opt.label })) || []}
                            value={item.value}
                            onChange={(value: string) => item.onChange?.(value)}
                            placeholder={item.title}
                            emptyMessage={t('no_option', 'No options')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < section.items.length - 1 && <hr className="mt-6 border-t border-muted" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recording History Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{t('recording_history_title', 'Recording History')}</CardTitle>
          </div>
          <CardDescription>
            {t('recording_history_desc', 'View and manage your past recitation tests.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground">{t('no_recordings', 'No recordings yet.')}</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {history.map((rec) => (
                <Button
                  key={rec.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setSelectedRecordingId(rec.id)}
                >
                  <span>
                    {rec.surahId ? `Surah ${rec.surahId}, Ayah ${rec.ayahNumber}` : `Recording ${new Date(rec.timestamp).toLocaleString()}`}
                  </span>
                  <span className={`font-medium ${rec.accuracy_percentage >= 80 ? 'text-green-600' : rec.accuracy_percentage >= 50 ? 'text-orange-500' : 'text-yellow-500'}`}>
                    {rec.accuracy_percentage.toFixed(1)}%
                  </span>
                </Button>
              ))}
            </div>
          )}
          {history.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearHistory}
              className="mt-4 w-full text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('clear_history', 'Clear History')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Display selected recording detail */}
      {selectedRecordingId && (
        <RecordingDetail
          recordingId={selectedRecordingId}
          onClose={() => setSelectedRecordingId(null)}
        />
      )}
      
      {/* Cache Status */}
      <CacheStatus className="mt-6" />
      
      {/* Reset Settings */}
      <Card className="mt-6 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {t('reset_settings', 'Reset Settings')}
          </CardTitle>
          <CardDescription>
            {t('reset_settings_desc', 'This will reset all settings to their default values')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={resetSettings}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t('reset_all', 'Reset All Settings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
