import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { LanguageProvider } from './src/context/LanguageContext';
import RecitationChecker from './src/components/RecitationChecker';

// Islamic-themed color palette
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32', // Islamic green
    accent: '#FFD700', // Gold
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#2C3E50',
    placeholder: '#95A5A6',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <PaperProvider theme={theme}>
          <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
            <RecitationChecker />
          </SafeAreaView>
        </PaperProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});