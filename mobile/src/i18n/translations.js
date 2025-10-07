// Internationalization translations for Iqra Al-Quran
export const translations = {
  en: {
    // App Title and Navigation
    appTitle: "Iqra Al-Quran",
    subtitle: "Quranic Recitation Checker",
    
    // Connection Status
    connected: "Connected",
    disconnected: "Disconnected",
    connecting: "Connecting...",
    
    // Surah Selection
    selectSurah: "Select Surah",
    ayahNumber: "Ayah Number",
    
    // Audio Recording
    audioRecording: "Audio Recording",
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    selectFile: "Select File",
    audioFileSelected: "Audio file selected",
    
    // Actions
    checkRecitation: "Check Recitation",
    checking: "Checking...",
    
    // Results
    resultsTitle: "Check Results",
    accuracyRate: "Accuracy Rate",
    detectedText: "Detected Text",
    referenceText: "Reference Text",
    
    // Feedback Messages
    excellent: "Excellent! Your recitation is very accurate.",
    good: "Good recitation with minor areas for improvement.",
    needsWork: "Keep practicing! There are some areas to improve.",
    
    // Errors and Warnings
    missingData: "Missing Data",
    missingDataMessage: "Please select surah, ayah number, and record audio",
    connectionError: "Connection Error",
    backendConnectionFailed: "Cannot connect to server. Check your internet connection.",
    recordingError: "Recording Error",
    recordingFailed: "Could not start recording",
    stopRecordingFailed: "Could not stop recording",
    filePickerError: "File Picker Error", 
    fileSelectionFailed: "Could not select file",
    recitationCheckError: "Recitation Check Error",
    
    // Permissions
    permission: "Permission",
    microphonePermission: "We need microphone permission to record audio",
    
    // Settings
    language: "Language",
    settings: "Settings",
    
    // API Endpoints Info
    endpoints: "Available Endpoints",
    healthCheck: "Health Check",
    getSurahs: "Get Juz 30 Surahs", 
    getAllSurahs: "Get All Surahs",
    checkRecitationEndpoint: "Check Recitation"
  },
  
  ar: {
    // App Title and Navigation  
    appTitle: "إقرأ القرآن",
    subtitle: "فاحص التلاوة",
    
    // Connection Status
    connected: "متصل",
    disconnected: "غير متصل", 
    connecting: "جاري الاتصال...",
    
    // Surah Selection
    selectSurah: "اختيار السورة",
    ayahNumber: "رقم الآية",
    
    // Audio Recording
    audioRecording: "تسجيل الصوت",
    startRecording: "بدء التسجيل",
    stopRecording: "إيقاف التسجيل", 
    selectFile: "اختيار ملف",
    audioFileSelected: "تم تحديد ملف صوتي",
    
    // Actions
    checkRecitation: "فحص التلاوة",
    checking: "جاري الفحص...",
    
    // Results
    resultsTitle: "نتيجة الفحص",
    accuracyRate: "نسبة الدقة",
    detectedText: "النص المكتشف",
    referenceText: "النص المرجعي",
    
    // Feedback Messages
    excellent: "ممتاز! تلاوتك دقيقة جداً.",
    good: "تلاوة جيدة مع بعض النقاط للتحسين.",
    needsWork: "استمر في التدريب! هناك بعض المجالات للتحسين.",
    
    // Errors and Warnings
    missingData: "نقص في البيانات",
    missingDataMessage: "يرجى اختيار السورة ورقم الآية وتسجيل الصوت",
    connectionError: "خطأ في الاتصال",
    backendConnectionFailed: "لا يمكن الاتصال بالخادم. تحقق من اتصال الإنترنت.",
    recordingError: "خطأ في التسجيل",
    recordingFailed: "لم يتمكن من بدء التسجيل",
    stopRecordingFailed: "لم يتمكن من إيقاف التسجيل",
    filePickerError: "خطأ في اختيار الملف",
    fileSelectionFailed: "لم يتمكن من اختيار الملف",
    recitationCheckError: "خطأ في فحص التلاوة",
    
    // Permissions
    permission: "إذن",
    microphonePermission: "نحتاج إذن الميكروفون لتسجيل الصوت",
    
    // Settings
    language: "اللغة",
    settings: "الإعدادات",
    
    // API Endpoints Info
    endpoints: "النقاط المتاحة",
    healthCheck: "فحص الصحة",
    getSurahs: "الحصول على سور جزء عم",
    getAllSurahs: "الحصول على جميع السور", 
    checkRecitationEndpoint: "فحص التلاوة"
  }
};

// Language names in their native scripts
export const languageNames = {
  en: "English",
  ar: "العربية"
};

// RTL languages
export const rtlLanguages = ['ar'];

// Get translation by key and language
export const getTranslation = (key, language = 'en') => {
  return translations[language]?.[key] || translations.en[key] || key;
};

// Check if language is RTL
export const isRTL = (language) => {
  return rtlLanguages.includes(language);
};

