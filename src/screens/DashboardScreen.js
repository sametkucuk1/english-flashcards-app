import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { loadWords, getCounts } from '../utils/storage';

const { width } = Dimensions.get('window');
// 48px ekran padding'i (24 sağ + 24 sol), 16px de kartlar arası boşluk (gap)
const cardWidth = (width - 48 - 16) / 2;

const CATEGORIES = [
  {
    key: 'to-learn',
    label: 'Öğrenilecekler',
    emoji: '📘',
    color: '#60A5FA', // Light Blue
    bg: '#1E3A8A', // Deep Blue
  },
  {
    key: 'to-repeat',
    label: 'Tekrar Edilecek',
    emoji: '🔁',
    color: '#FBBF24', // Amber
    bg: '#78350F', // Dark Amber
  },
  {
    key: 'memorized',
    label: 'Ezberlenenler',
    emoji: '🏆',
    color: '#34D399', // Emerald
    bg: '#064E3B', // Dark Emerald
  },
  {
    key: 'spam',
    label: 'Çok Kolay (Spam)',
    emoji: '👻',
    color: '#9CA3AF', // Gray
    bg: '#374151', // Dark Gray
  },
];

export default function DashboardScreen({ navigation }) {
  const [counts, setCounts] = useState({
    'to-learn': 0,
    'to-repeat': 0,
    memorized: 0,
    spam: 0,
  });

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const words = await loadWords();
        setCounts(getCounts(words));
      })();
    }, [])
  );

  const totalWords = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome! 👋</Text>
          <Text style={styles.title}>Trust Your Process</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>Toplam {totalWords} kelime havuzda</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.8 }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('LevelSelect', {
                  status: cat.key,
                  label: cat.label,
                  color: cat.color,
                  bg: cat.bg,
                });
              }}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrapper, { backgroundColor: cat.bg }]}>
                  <Text style={styles.cardEmoji}>{cat.emoji}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.countText}>{counts[cat.key]}</Text>
                <Text style={[styles.cardLabel, { color: cat.color }]}>
                  {cat.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.85 }
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('AddWord');
          }}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Yeni Kelime Ekle</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#040D1A', // Deep Sea Base
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    marginBottom: 36,
    marginTop: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8', // Slate 400
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F8FAFC', // Slate 50
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  totalBadge: {
    backgroundColor: '#0F1E36', // Slightly lighter than base
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  totalBadgeText: {
    color: '#CBD5E1', // Slate 300
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16, // Yatay ve dikey boşluklar için tek bir gap kullanıyoruz
  },
  card: {
    width: cardWidth,
    backgroundColor: '#0B162C', // Deep Sea Dark Blue Card
    borderRadius: 28,
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#15243C', // Subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardBottom: {
    marginTop: 16,
  },
  countText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#1E3A8A', // Strong Deep Blue
    flexDirection: 'row',
    borderRadius: 24,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  addButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginRight: 8,
    lineHeight: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
