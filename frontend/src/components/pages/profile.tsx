import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/useSettings"
import { useRecordingHistory } from "@/hooks/useRecordingHistory"
import { User, Trophy, Target, TrendingUp, Calendar, BookOpen, Award } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface ProfilePageProps {
  onNavigateToHome?: () => void
}

export function ProfilePage({ onNavigateToHome }: ProfilePageProps) {
  const { t, i18n } = useTranslation()
  const { settings } = useSettings()
  const { history } = useRecordingHistory()
  
  // Get user's display name or default to "Qari"
  const displayName = settings.userName || "Qari"
  
  // Calculate statistics from recording history
  const totalRecordings = history.length
  const averageAccuracy = totalRecordings > 0 
    ? history.reduce((sum, rec) => sum + (rec.accuracy_percentage || 0), 0) / totalRecordings 
    : 0
  
  const bestAccuracy = totalRecordings > 0 
    ? Math.max(...history.map(rec => rec.accuracy_percentage || 0))
    : 0
  
  const recentRecordings = history.slice(-5).reverse() // Last 5 recordings, most recent first
  const improvementTrend = calculateImprovementTrend(history)
  
  // Calculate improvement trend (comparing first 3 vs last 3 recordings)
  function calculateImprovementTrend(recordings: any[]) {
    if (recordings.length < 6) return 0
    
    const firstThree = recordings.slice(-6, -3)
    const lastThree = recordings.slice(-3)
    
    const firstAvg = firstThree.reduce((sum, rec) => sum + (rec.accuracy_percentage || 0), 0) / 3
    const lastAvg = lastThree.reduce((sum, rec) => sum + (rec.accuracy_percentage || 0), 0) / 3
    
    return lastAvg - firstAvg
  }

  const stats = [
    {
      icon: BookOpen,
      title: t('total_recordings', 'Total Recordings'),
      value: formatNumber(totalRecordings, i18n.language),
      description: t('recordings_completed', 'recitations completed')
    },
    {
      icon: Target,
      title: t('average_accuracy', 'Average Accuracy'),
      value: `${formatNumber(averageAccuracy.toFixed(1), i18n.language)}%`,
      description: t('overall_performance', 'overall performance')
    },
    {
      icon: Trophy,
      title: t('best_score', 'Best Score'),
      value: `${formatNumber(bestAccuracy.toFixed(1), i18n.language)}%`,
      description: t('personal_best', 'personal best')
    },
    {
      icon: TrendingUp,
      title: t('improvement', 'Improvement'),
      value: improvementTrend > 0 ? `+${formatNumber(improvementTrend.toFixed(1), i18n.language)}%` : formatNumber(improvementTrend.toFixed(1), i18n.language) + '%',
      description: t('recent_trend', 'recent trend'),
      isPositive: improvementTrend > 0
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
          <User className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">
          {t('welcome', 'Welcome')}, {displayName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('profile_subtitle', 'Your Quranic recitation journey and progress')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className={`p-2 rounded-lg ${stat.isPositive ? 'bg-green-100 dark:bg-green-900/20' : stat.isPositive === false ? 'bg-red-100 dark:bg-red-900/20' : 'bg-primary/10'}`}>
                  <stat.icon className={`h-6 w-6 ${stat.isPositive ? 'text-green-600 dark:text-green-400' : stat.isPositive === false ? 'text-red-600 dark:text-red-400' : 'text-primary'}`} />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {stat.value}
              </CardTitle>
              <CardDescription className="text-sm">
                {stat.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      {recentRecordings.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('recent_activity', 'Recent Activity')}
            </CardTitle>
            <CardDescription>
              {t('recent_activity_desc', 'Your latest recitation attempts')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRecordings.map((recording) => (
                <div key={recording.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {recording.surahId ? `Surah ${recording.surahId}, Ayah ${recording.ayahNumber}` : t('recording', 'Recording')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(recording.timestamp).toLocaleDateString(i18n.language)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${(recording.accuracy_percentage || 0) >= 80 ? 'text-green-600' : (recording.accuracy_percentage || 0) >= 50 ? 'text-orange-500' : 'text-yellow-500'}`}>
                      {formatNumber((recording.accuracy_percentage || 0).toFixed(1), i18n.language)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(recording.accuracy_percentage || 0) >= 80 ? t('excellent', 'Excellent') : 
                       (recording.accuracy_percentage || 0) >= 50 ? t('good', 'Good') : t('keep_practicing', 'Keep practicing')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {totalRecordings === 0 
                ? t('get_started', 'Ready to begin your journey?')
                : t('keep_going', 'Keep up the great work!')
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {totalRecordings === 0 
                ? t('get_started_desc', 'Start your first recitation to begin tracking your progress and improving your Quranic recitation skills.')
                : t('keep_going_desc', 'Continue practicing to improve your accuracy and deepen your connection with the Quran.')
              }
            </p>
            <Button size="lg" className="mt-2" onClick={onNavigateToHome}>
              {totalRecordings === 0 ? t('start_recording', 'Start Recording') : t('continue_practicing', 'Continue Practicing')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
