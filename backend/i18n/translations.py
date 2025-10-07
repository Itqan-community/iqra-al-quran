# Backend Internationalization for Iqra Al-Quran
from typing import Dict, Any

# Translation dictionary for backend responses
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        # API Response Messages
        "service_healthy": "Service is healthy",
        "service_name": "Iqra Al-Quran API",
        
        # Audio Processing
        "audio_processing": "Processing audio...",
        "audio_processed": "Audio processed successfully",
        "audio_error": "Failed to process audio file",
        "invalid_audio_format": "Invalid audio format. Supported: MP3, WAV, M4A, FLAC",
        "audio_too_large": "Audio file too large. Maximum size: 10MB",
        "audio_too_short": "Audio recording too short. Minimum: 2 seconds",
        
        # Quran Data
        "fetching_surahs": "Fetching Quran chapters...",
        "surahs_loaded": "Quran chapters loaded successfully",
        "surah_not_found": "Surah not found",
        "ayah_not_found": "Ayah not found",
        "invalid_surah_id": "Invalid surah ID",
        "invalid_ayah_number": "Invalid ayah number",
        
        # Speech Recognition
        "transcribing_audio": "Converting speech to text...",
        "transcription_complete": "Speech recognition completed",
        "transcription_failed": "Speech recognition failed",
        "model_loading": "Loading AI model...",
        "model_loaded": "AI model ready",
        
        # Recitation Analysis
        "analyzing_recitation": "Analyzing recitation accuracy...",
        "analysis_complete": "Analysis completed",
        "recitation_excellent": "Excellent! Your recitation is very accurate.",
        "recitation_good": "Good recitation with minor areas for improvement.",
        "recitation_needs_work": "Keep practicing! There are some areas to improve.",
        "recitation_poor": "Significant practice needed. Focus on proper pronunciation.",
        
        # Error Messages
        "missing_audio": "Audio file is required",
        "missing_surah": "Surah selection is required", 
        "missing_ayah": "Ayah number is required",
        "processing_error": "Error processing request",
        "api_connection_error": "Failed to connect to Quran API",
        "temporary_error": "Temporary service error. Please try again.",
        
        # Server Messages
        "server_starting": "Server starting...",
        "server_ready": "Server ready on port",
        "model_download": "Downloading AI model (first time only)...",
        "api_test_success": "Quran API connection successful",
        "api_test_warning": "Quran API connection failed, using local data",
        
        # Feedback Categories
        "accuracy_perfect": "Perfect recitation! Mashallah!",
        "accuracy_excellent": "Excellent recitation with great pronunciation",
        "accuracy_very_good": "Very good recitation, minor improvements possible",
        "accuracy_good": "Good recitation, some areas need attention",
        "accuracy_fair": "Fair recitation, practice recommended",
        "accuracy_needs_improvement": "Recitation needs improvement, keep practicing",
        
        # Web Interface
        "page_title": "Recitation Checker - Juz Amma",
        "app_heading": "Quranic Recitation Checker",
        "app_subheading": "Juz Amma",
        "select_surah_label": "Select Surah:",
        "choose_surah": "-- Choose Surah --",
        "ayah_number_label": "Ayah Number:",
        "upload_audio_label": "Upload Audio Recording:",
        "supported_formats": "Supported formats: MP3, WAV, M4A, FLAC (Max: 10MB)",
        "analyze_button": "Analyze Recitation",
        "language_toggle": "العربية",
        "results_title": "Analysis Results",
        "detected_text_label": "Detected Text:",
        "reference_text_label": "Reference Text:",
        "accuracy_score": "Accuracy Score:"
    },
    
    "ar": {
        # API Response Messages
        "service_healthy": "الخدمة تعمل بشكل صحيح",
        "service_name": "واجهة برمجة إقرأ القرآن",
        
        # Audio Processing
        "audio_processing": "جاري معالجة الصوت...",
        "audio_processed": "تم معالجة الصوت بنجاح",
        "audio_error": "فشل في معالجة الملف الصوتي",
        "invalid_audio_format": "تنسيق صوتي غير صحيح. المدعوم: MP3, WAV, M4A, FLAC",
        "audio_too_large": "الملف الصوتي كبير جداً. الحد الأقصى: 10 ميجابايت",
        "audio_too_short": "التسجيل قصير جداً. الحد الأدنى: ثانيتان",
        
        # Quran Data
        "fetching_surahs": "جاري جلب سور القرآن...",
        "surahs_loaded": "تم تحميل سور القرآن بنجاح",
        "surah_not_found": "السورة غير موجودة",
        "ayah_not_found": "الآية غير موجودة", 
        "invalid_surah_id": "رقم السورة غير صحيح",
        "invalid_ayah_number": "رقم الآية غير صحيح",
        
        # Speech Recognition
        "transcribing_audio": "جاري تحويل الكلام إلى نص...",
        "transcription_complete": "تم التعرف على الكلام بنجاح",
        "transcription_failed": "فشل في التعرف على الكلام",
        "model_loading": "جاري تحميل نموذج الذكاء الاصطناعي...",
        "model_loaded": "نموذج الذكاء الاصطناعي جاهز",
        
        # Recitation Analysis
        "analyzing_recitation": "جاري تحليل دقة التلاوة...",
        "analysis_complete": "تم التحليل بنجاح",
        "recitation_excellent": "ممتاز! تلاوتك دقيقة جداً.",
        "recitation_good": "تلاوة جيدة مع بعض النقاط للتحسين.",
        "recitation_needs_work": "استمر في التدريب! هناك بعض المجالات للتحسين.",
        "recitation_poor": "تحتاج لتدريب كثير. ركز على النطق الصحيح.",
        
        # Error Messages
        "missing_audio": "الملف الصوتي مطلوب",
        "missing_surah": "اختيار السورة مطلوب",
        "missing_ayah": "رقم الآية مطلوب",
        "processing_error": "خطأ في معالجة الطلب",
        "api_connection_error": "فشل في الاتصال بواجهة القرآن",
        "temporary_error": "خطأ مؤقت في الخدمة. يرجى المحاولة مرة أخرى.",
        
        # Server Messages
        "server_starting": "جاري بدء الخادم...",
        "server_ready": "الخادم جاهز على المنفذ",
        "model_download": "جاري تحميل نموذج الذكاء الاصطناعي (المرة الأولى فقط)...",
        "api_test_success": "اتصال واجهة القرآن ناجح",
        "api_test_warning": "فشل اتصال واجهة القرآن، استخدام البيانات المحلية",
        
        # Feedback Categories
        "accuracy_perfect": "تلاوة مثالية! ماشاء الله!",
        "accuracy_excellent": "تلاوة ممتازة مع نطق رائع",
        "accuracy_very_good": "تلاوة جيدة جداً، تحسينات طفيفة ممكنة",
        "accuracy_good": "تلاوة جيدة، بعض المجالات تحتاج انتباه",
        "accuracy_fair": "تلاوة مقبولة، ينصح بالتدريب",
        "accuracy_needs_improvement": "التلاوة تحتاج تحسين، استمر في التدريب",
        
        # Web Interface
        "page_title": "فاحص التلاوة - جزء عمّ",
        "app_heading": "فاحص التلاوة القرآنية",
        "app_subheading": "جزء عمّ",
        "select_surah_label": "اختر السورة:",
        "choose_surah": "-- اختر السورة --",
        "ayah_number_label": "رقم الآية:",
        "upload_audio_label": "ارفع التسجيل الصوتي:",
        "supported_formats": "الصيغ المدعومة: MP3, WAV, M4A, FLAC (الحد الأقصى: 10 ميجابايت)",
        "analyze_button": "تحليل التلاوة",
        "language_toggle": "English",
        "results_title": "نتائج التحليل",
        "detected_text_label": "النص المكتشف:",
        "reference_text_label": "النص المرجعي:",
        "accuracy_score": "نسبة الدقة:"
    }
}

def get_translation(key: str, language: str = "en") -> str:
    """
    Get translation for a given key and language.
    
    Args:
        key: Translation key
        language: Language code ('en' or 'ar')
        
    Returns:
        Translated string or the key if translation not found
    """
    return TRANSLATIONS.get(language, {}).get(key, TRANSLATIONS["en"].get(key, key))

def get_feedback_message(wer_score: float, language: str = "en") -> str:
    """
    Get contextual feedback message based on WER score.
    
    Args:
        wer_score: Word Error Rate (0.0 = perfect, 1.0 = completely wrong)
        language: Language code ('en' or 'ar')
        
    Returns:
        Appropriate feedback message
    """
    if wer_score <= 0.1:
        return get_translation("accuracy_perfect", language)
    elif wer_score <= 0.2:
        return get_translation("accuracy_excellent", language)  
    elif wer_score <= 0.3:
        return get_translation("accuracy_very_good", language)
    elif wer_score <= 0.5:
        return get_translation("accuracy_good", language)
    elif wer_score <= 0.7:
        return get_translation("accuracy_fair", language)
    else:
        return get_translation("accuracy_needs_improvement", language)

def get_supported_languages() -> list:
    """Get list of supported language codes."""
    return list(TRANSLATIONS.keys())

def is_supported_language(language: str) -> bool:
    """Check if language is supported."""
    return language in TRANSLATIONS
