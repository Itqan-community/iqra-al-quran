import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { getTranslation, isRTL, languageNames } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference on app start
  useEffect(() => {
    loadLanguagePreference();
  }, []);

  // Update RTL layout when language changes
  useEffect(() => {
    const shouldBeRTL = isRTL(currentLanguage);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      // Note: In production, you might want to restart the app here
      // RNRestart.Restart(); 
    }
  }, [currentLanguage]);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      setCurrentLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const t = (key) => getTranslation(key, currentLanguage);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isRTL: isRTL(currentLanguage),
    isLoading,
    availableLanguages: Object.keys(languageNames),
    getLanguageName: (code) => languageNames[code] || code
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
