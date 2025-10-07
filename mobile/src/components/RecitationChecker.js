import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text as RNText,
} from 'react-native';
import {
  Title,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
  Text,
  List,
  TextInput,
} from 'react-native-paper';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { apiService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function RecitationChecker() {
  const { t, isRTL, currentLanguage } = useLanguage();
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [ayahNumber, setAyahNumber] = useState('1');
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check backend connection
      await apiService.healthCheck();
      setBackendStatus('connected');
      
      // Load surahs
      const response = await apiService.getJuz30Surahs();
      setSurahs(response.surahs || []);
    } catch (error) {
      console.error('Initialization error:', error);
      setBackendStatus('disconnected');
      Alert.alert(t('connectionError'), t('backendConnectionFailed'));
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('permission'), t('microphonePermission'));
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert(t('recordingError'), t('recordingFailed'));
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setAudioFile({
        uri,
        name: 'recording.m4a',
        mimeType: 'audio/m4a',
      });
      
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert(t('recordingError'), t('stopRecordingFailed'));
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setAudioFile(result.assets[0]);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert(t('filePickerError'), t('fileSelectionFailed'));
    }
  };

  const checkRecitation = async () => {
    if (!selectedSurah || !ayahNumber || !audioFile) {
      Alert.alert(t('missingData'), t('missingDataMessage'));
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await apiService.checkRecitation(
        audioFile,
        selectedSurah.id,
        parseInt(ayahNumber),
        currentLanguage
      );
      setResult(response);
    } catch (error) {
      console.error('Check recitation error:', error);
      Alert.alert(t('recitationCheckError'), error.message || t('recitationCheckError'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Card style={styles.resultCard}>
        <Card.Content>
          <Title style={isRTL && styles.rtlText}>{t('resultsTitle')}</Title>
          
          {result.wer_score !== undefined && (
            <View style={[styles.scoreContainer, isRTL && styles.rtlRow]}>
              <Text style={[styles.scoreLabel, isRTL && styles.rtlText]}>{t('accuracyRate')}:</Text>
              <Text style={[styles.scoreValue, {
                color: result.wer_score < 0.3 ? '#2E7D32' : 
                       result.wer_score < 0.6 ? '#FF8F00' : '#D32F2F'
              }]}>
                {((1 - result.wer_score) * 100).toFixed(1)}%
              </Text>
            </View>
          )}

          {result.feedback && (
            <Text style={styles.feedback}>{result.feedback}</Text>
          )}

          {result.detected_text && (
            <View style={styles.textContainer}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('detectedText')}:</Text>
              <Text style={[styles.detectedText, isRTL && styles.rtlText]}>{result.detected_text}</Text>
            </View>
          )}

          {result.reference_text && (
            <View style={styles.textContainer}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('referenceText')}:</Text>
              <Text style={[styles.referenceText, isRTL && styles.rtlText]}>{result.reference_text}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtlContainer]}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
            <Title style={[styles.title, isRTL && styles.rtlText]}>
              {t('appTitle')} - {t('subtitle')}
            </Title>
            <LanguageToggle />
          </View>
          <View style={styles.statusContainer}>
            <Chip 
              icon={backendStatus === 'connected' ? 'check-circle' : 'alert-circle'}
              style={[styles.statusChip, {
                backgroundColor: backendStatus === 'connected' ? '#E8F5E8' : '#FFEBEE'
              }]}
            >
              {backendStatus === 'connected' ? t('connected') : t('disconnected')}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.inputCard}>
        <Card.Content>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('selectSurah')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.surahContainer}>
              {surahs.map((surah) => (
                <Chip
                  key={surah.id}
                  selected={selectedSurah?.id === surah.id}
                  onPress={() => setSelectedSurah(surah)}
                  style={styles.surahChip}
                >
                  {surah.name_arabic}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <Divider style={styles.divider} />

          <TextInput
            label={t('ayahNumber')}
            value={ayahNumber}
            onChangeText={setAyahNumber}
            keyboardType="numeric"
            style={[styles.ayahInput, isRTL && styles.rtlInput]}
            mode="outlined"
          />
        </Card.Content>
      </Card>

      <Card style={styles.audioCard}>
        <Card.Content>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('audioRecording')}</Text>
          
          <View style={[styles.audioButtons, isRTL && styles.rtlRow]}>
            <Button
              mode={isRecording ? 'contained' : 'outlined'}
              onPress={isRecording ? stopRecording : startRecording}
              icon={isRecording ? 'stop' : 'microphone'}
              style={styles.audioButton}
              buttonColor={isRecording ? '#D32F2F' : undefined}
            >
              {isRecording ? t('stopRecording') : t('startRecording')}
            </Button>

            <Button
              mode="outlined"
              onPress={pickAudioFile}
              icon="file-music"
              style={styles.audioButton}
            >
              {t('selectFile')}
            </Button>
          </View>

          {audioFile && (
            <Chip icon="music" style={styles.fileChip}>
              {audioFile.name || t('audioFileSelected')}
            </Chip>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={checkRecitation}
        loading={isLoading}
        disabled={isLoading || !selectedSurah || !ayahNumber || !audioFile}
        style={styles.checkButton}
        icon="check-circle"
      >
        {isLoading ? t('checking') : t('checkRecitation')}
      </Button>

      {renderResult()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  rtlContainer: {
    direction: 'rtl',
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statusChip: {
    alignSelf: 'center',
  },
  inputCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  surahContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  surahChip: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 16,
  },
  ayahInput: {
    marginTop: 8,
  },
  rtlInput: {
    textAlign: 'right',
  },
  audioCard: {
    marginBottom: 16,
  },
  audioButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  audioButton: {
    flex: 1,
  },
  fileChip: {
    alignSelf: 'flex-start',
  },
  checkButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  resultCard: {
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  feedback: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  textContainer: {
    marginTop: 12,
  },
  detectedText: {
    fontSize: 16,
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 4,
    textAlign: 'right',
  },
  referenceText: {
    fontSize: 16,
    backgroundColor: '#E8F5E8',
    padding: 8,
    borderRadius: 4,
    textAlign: 'right',
  },
});
