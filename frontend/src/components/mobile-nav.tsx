import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet"
import { Menu, Home, Info, Mail, Settings, User, Github } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { LanguageToggle } from "./language-toggle"
import { useSettings } from "@/hooks/useSettings"
import { useRecordingHistory } from "@/hooks/useRecordingHistory"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  currentPage?: string
  onNavigate?: (page: string) => void
}

export function MobileNav({ currentPage = "home", onNavigate }: MobileNavProps) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const isArabic = i18n.language === 'ar'
  const { settings, isLoaded: settingsLoaded } = useSettings()
  const { history, isLoaded: historyLoaded } = useRecordingHistory()

  // Check if user should see the profile link (only after both are loaded)
  const shouldShowProfile = settingsLoaded && historyLoaded && (settings.userName.trim() !== '' || history.length > 0)

  const baseNavigationItems = [
    {
      id: "home",
      label: t("nav_home", "Home"),
      icon: Home,
      href: "#home"
    },
    {
      id: "about", 
      label: t("nav_about", "About"),
      icon: Info,
      href: "#about"
    },
    {
      id: "contact",
      label: t("nav_contact", "Contact"), 
      icon: Mail,
      href: "#contact"
    },
    {
      id: "settings",
      label: t("nav_settings", "Settings"), 
      icon: Settings,
      href: "#settings"
    }
  ]

  // Conditionally add profile item
  const navigationItems = shouldShowProfile 
    ? [
        baseNavigationItems[0], // home
        {
          id: "profile",
          label: t("nav_profile", "My Profile"),
          icon: User,
          href: "#profile"
        },
        ...baseNavigationItems.slice(1) // about, contact, settings
      ]
    : baseNavigationItems

  const handleNavigation = (pageId: string) => {
    setIsOpen(false)
    if (onNavigate) {
      onNavigate(pageId)
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <h1 className={cn(
            "text-lg font-bold",
            isArabic ? "font-arabic" : ""
          )}>
            {t("title")}
          </h1>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item.id)}
              className="flex items-center gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
          
          {/* GitHub Link - Desktop Navigation */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <a
              href="https://github.com/Itqan-community/iqra-al-quran"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </Button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Theme and Language toggles - Always visible */}
          <LanguageToggle />
          <ModeToggle />
          
          {/* Mobile Menu - Only visible on mobile */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("open_menu", "Open menu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side={isArabic ? "left" : "right"} 
              className="w-[300px] sm:w-[400px]"
            >
              <SheetHeader>
                <SheetTitle className={cn(
                  "text-left",
                  isArabic ? "text-right font-arabic" : "text-left"
                )}>
                  {t("navigation", "Navigation")}
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col space-y-4 mt-6">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    size="lg"
                    onClick={() => handleNavigation(item.id)}
                    className={cn(
                      "justify-start gap-3 h-12",
                      isArabic ? "flex-row-reverse" : ""
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-base">{item.label}</span>
                  </Button>
                ))}
                
                {/* Divider */}
                <div className="border-t my-4" />
                
                {/* GitHub Link - Mobile */}
                <Button
                  variant="ghost"
                  size="lg"
                  asChild
                  className={cn(
                    "justify-start gap-3 h-12 w-full",
                    isArabic ? "flex-row-reverse" : ""
                  )}
                >
                  <a
                    href="https://github.com/Itqan-community/iqra-al-quran"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-5 w-5" />
                    <span className="text-base">GitHub</span>
                  </a>
                </Button>
                
                <div className="border-t my-4" />
                
                {/* Additional Options */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground px-3">
                    {t("settings", "Settings")}
                  </p>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">{t("theme", "Theme")}</span>
                    <ModeToggle />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">{t("language", "Language")}</span>
                    <LanguageToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
