import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { BookOpen, Heart, Users, Zap } from "lucide-react"

export function AboutPage() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const features = [
    {
      icon: BookOpen,
      title: isArabic ? "تعلم القرآن" : "Learn Quran",
      description: isArabic 
        ? "تحسين تلاوة القرآن الكريم باستخدام تقنية الذكاء الاصطناعي"
        : "Improve your Quran recitation using AI technology"
    },
    {
      icon: Zap,
      title: isArabic ? "تحليل فوري" : "Instant Analysis", 
      description: isArabic
        ? "احصل على تحليل فوري لتلاوتك مع تقييم دقيق"
        : "Get instant analysis of your recitation with accurate assessment"
    },
    {
      icon: Heart,
      title: isArabic ? "سهل الاستخدام" : "Easy to Use",
      description: isArabic
        ? "واجهة بسيطة ومناسبة لجميع الأعمار"
        : "Simple interface suitable for all ages"
    },
    {
      icon: Users,
      title: isArabic ? "للجميع" : "For Everyone",
      description: isArabic
        ? "مناسب للمبتدئين والمتقدمين في تعلم القرآن"
        : "Suitable for beginners and advanced Quran learners"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {isArabic ? "حول تطبيق اقرأ القرآن" : "About Iqra Al-Quran"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isArabic 
            ? "تطبيق متقدم لتحسين تلاوة القرآن الكريم باستخدام أحدث تقنيات الذكاء الاصطناعي والتعرف على الصوت"
            : "An advanced application for improving Quran recitation using the latest AI and speech recognition technologies"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isArabic ? "مهمتنا" : "Our Mission"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {isArabic 
              ? "نهدف إلى جعل تعلم وتحسين تلاوة القرآن الكريم أكثر سهولة وفعالية من خلال استخدام التكنولوجيا الحديثة. يوفر تطبيقنا تحليلاً دقيقاً لتلاوتك ويساعدك على تحسين النطق والتجويد."
              : "We aim to make learning and improving Quran recitation easier and more effective through modern technology. Our application provides accurate analysis of your recitation and helps you improve pronunciation and Tajweed."
            }
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {isArabic
              ? "باستخدام تقنيات الذكاء الاصطناعي المتقدمة، نقدم تغذية راجعة فورية ومفصلة لمساعدتك في رحلتك لإتقان تلاوة القرآن الكريم."
              : "Using advanced AI technologies, we provide instant and detailed feedback to help you in your journey to master Quran recitation."
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
