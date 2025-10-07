import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Mail, MessageSquare, Github, Globe, MapPin } from "lucide-react"

export function ContactPage() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const contactMethods = [
    {
      icon: Mail,
      title: isArabic ? "البريد الإلكتروني" : "Email",
      value: "connect@itqan.dev",
      description: isArabic ? "للاستفسارات والدعم الفني" : "For inquiries and technical support",
      action: () => window.open("mailto:connect@itqan.dev")
    },
    {
      icon: Github,
      title: isArabic ? "جيت هاب" : "GitHub",
      value: "github.com/itqan-community/iqra-al-quran",
      description: isArabic ? "كود المصدر والمساهمة" : "Source code and contributions",
      action: () => window.open("https://github.com/Itqan-community/iqra-al-quran", "_blank")
    },
    {
      icon: MessageSquare,
      title: isArabic ? "التغذية الراجعة" : "Feedback",
      value: isArabic ? "شاركنا رأيك" : "Share your thoughts",
      description: isArabic ? "ساعدنا في تحسين التطبيق" : "Help us improve the application",
      action: () => window.open("mailto:connect@itqan.dev?subject=App Feedback")
    }
  ]

  const teamInfo = [
    {
      icon: Globe,
      title: isArabic ? "الموقع الإلكتروني" : "Website",
      value: "www.itqan.dev",
      description: isArabic ? "شركة إتقان للتطوير" : "Itqan Development Company"
    },
    {
      icon: MapPin,
      title: isArabic ? "الموقع" : "Location", 
      value: isArabic ? "المملكة العربية السعودية" : "Saudi Arabia",
      description: isArabic ? "نخدم المسلمين حول العالم" : "Serving Muslims worldwide"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {isArabic ? "اتصل بنا" : "Contact Us"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isArabic 
            ? "نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو اقتراحات أو دعم فني"
            : "We're here to help. Contact us for any questions, suggestions, or technical support"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {contactMethods.map((method, index) => (
          <Card key={index} className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={method.action}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <method.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{method.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-primary mb-2">{method.value}</p>
              <CardDescription>{method.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {teamInfo.map((info, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <info.icon className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg">{info.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{info.value}</p>
              <CardDescription>{info.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isArabic ? "ساهم في التطوير" : "Contribute to Development"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {isArabic 
              ? "اقرأ القرآن هو مشروع مفتوح المصدر. نرحب بمساهماتكم في تطوير وتحسين التطبيق لخدمة المجتمع الإسلامي."
              : "Iqra Al-Quran is an open-source project. We welcome your contributions to develop and improve the application to serve the Islamic community."
            }
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => window.open("https://github.com/Itqan-community/iqra-al-quran", "_blank")}
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              {isArabic ? "عرض على جيت هاب" : "View on GitHub"}
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open("mailto:contribute@iqra-al-quran.com")}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {isArabic ? "راسلنا للمساهمة" : "Email to Contribute"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
