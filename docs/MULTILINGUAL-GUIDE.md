# Multi-Language Support Guide

## Overview

Iqra Al-Quran now supports **English** and **Arabic** languages with full RTL (Right-to-Left) support for Arabic text.

## Features

### ✅ Complete Translation System
- **English/Arabic** toggle button in top-right corner
- **Persistent language preference** saved locally
- **RTL layout support** for Arabic text
- **Contextual translations** for all UI elements

### ✅ User Interface Elements
- App title and subtitle
- Connection status indicators  
- Surah selection interface
- Audio recording controls
- Results and feedback messages
- Error messages and alerts

### ✅ Technical Implementation
- **Context-based translations** using React Context API
- **AsyncStorage** for language preference persistence
- **RTL layout** automatically applied for Arabic
- **Accessible** language switching

## Usage

### Language Toggle
1. **Look for translate icon** (🌐) in top-right corner
2. **Tap the current language** (English/العربية)
3. **Select preferred language** from dropdown
4. **Interface updates immediately**

### Supported Languages
- **English**: Left-to-right layout, English text
- **العربية (Arabic)**: Right-to-left layout, Arabic text

## Translation Keys

### Core Interface
- `appTitle`: "Iqra Al-Quran" / "إقرأ القرآن"
- `subtitle`: "Quranic Recitation Checker" / "فاحص التلاوة"
- `connected`: "Connected" / "متصل"
- `selectSurah`: "Select Surah" / "اختيار السورة"

### Audio Features
- `startRecording`: "Start Recording" / "بدء التسجيل"
- `stopRecording`: "Stop Recording" / "إيقاف التسجيل"
- `selectFile`: "Select File" / "اختيار ملف"

### Results
- `resultsTitle`: "Check Results" / "نتيجة الفحص"
- `accuracyRate`: "Accuracy Rate" / "نسبة الدقة"
- `detectedText`: "Detected Text" / "النص المكتشف"

## Development

### Adding New Translations
1. Edit `mobile/src/i18n/translations.js`
2. Add new key to both `en` and `ar` objects
3. Use `t('keyName')` in components

### Example Usage
```javascript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t, isRTL } = useLanguage();
  
  return (
    <Text style={isRTL && styles.rtlText}>
      {t('myTranslationKey')}
    </Text>
  );
}
```

### RTL Styling
- Use `isRTL` flag for conditional styling
- Apply `rtlText` style for right-aligned text
- Use `rtlRow` for reversed flex direction

## Testing

### Language Switch Testing
1. **Start app** in English (default)
2. **Tap language button** in header
3. **Switch to Arabic** - interface should flip to RTL
4. **Test all features** in both languages
5. **Restart app** - language preference should persist

### RTL Layout Testing
- **Text alignment**: Arabic text should be right-aligned
- **Button layout**: Icons and text should be RTL in Arabic
- **Navigation**: Menu items should be right-aligned

## Future Enhancements

### Additional Languages
- **Urdu**: Large Muslim population
- **Turkish**: Significant Quranic learning community
- **Malay/Indonesian**: Large Muslim regions
- **French**: West African Muslim communities

### Advanced Features
- **Voice prompts** in selected language
- **Transliteration support** for non-Arabic speakers
- **Regional Arabic dialects** for pronunciation guidance
- **Audio feedback** in user's preferred language

## Implementation Files

- `mobile/src/i18n/translations.js` - Translation definitions
- `mobile/src/context/LanguageContext.js` - Language state management  
- `mobile/src/components/LanguageToggle.js` - Language switcher UI
- `mobile/src/components/RecitationChecker.js` - Updated with translations

Ready for multi-lingual Quranic learning! 🌍📚🤲

