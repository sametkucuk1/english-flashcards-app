import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { loadWords, addWord } from '../utils/storage';

const LEVELS = ['A2', 'B1', 'B2', 'C1'];

export default function AddWordScreen({ navigation }) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('B1');

  const handleAdd = async () => {
    const trimmedWord = word.trim();
    const trimmedTranslation = translation.trim();

    if (!trimmedWord || !trimmedTranslation) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Eksik Bilgi', 'Lütfen kelime ve çeviri alanlarını doldurun.');
      return;
    }

    const words = await loadWords();
    const exists = words.some(
      (w) => w.word.toLowerCase() === trimmedWord.toLowerCase()
    );
    if (exists) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', 'Bu kelime zaten havuzda mevcut!');
      return;
    }

    await addWord(words, trimmedWord, trimmedTranslation, selectedLevel);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Tebrikler 🎉', `"${trimmedWord}" kelimesi başarıyla eklendi.`, [
      {
        text: 'Yeni Ekle',
        onPress: () => {
          setWord('');
          setTranslation('');
        },
      },
      {
        text: 'Ana Sayfaya Dön',
        style: 'cancel',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Text style={styles.headerIcon}>✍️</Text>
            </View>
            <Text style={styles.title}>Yeni Kelime</Text>
            <Text style={styles.subtitle}>
              Öğreneceklerim listesine hemen ekle.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>İNGİLİZCE KELİME</Text>
            <TextInput
              style={styles.input}
              value={word}
              onChangeText={setWord}
              placeholder="Örn: Serendipity"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TÜRKÇE ÇEVİRİSİ</Text>
            <TextInput
              style={styles.input}
              value={translation}
              onChangeText={setTranslation}
              placeholder="Örn: Tesadüfen bulma"
              placeholderTextColor="#475569"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ZORLUK SEVİYESİ</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((level) => {
                const isActive = selectedLevel === level;
                return (
                  <Pressable
                    key={level}
                    style={({ pressed }) => [
                      styles.levelBtn,
                      isActive && styles.levelBtnActive,
                      pressed && !isActive && { opacity: 0.8 }
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedLevel(level);
                    }}
                  >
                    <Text
                      style={[
                        styles.levelBtnText,
                        isActive && styles.levelBtnTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.85 }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleAdd();
            }}
          >
            <Text style={styles.addButtonText}>Kelimeyi Havuza Ekle</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#040D1A',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0B162C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#15243C',
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#0B162C',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 17,
    fontWeight: '600',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#15243C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 12,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#0B162C',
    borderWidth: 1,
    borderColor: '#15243C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  levelBtnActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
    shadowOpacity: 0,
    elevation: 0,
  },
  levelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  levelBtnTextActive: {
    color: '#F8FAFC',
  },
  addButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
