import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { loadWords, getLevelCounts } from '../utils/storage';

const LEVELS = ['A2', 'B1', 'B2', 'C1'];

const LEVEL_DESCRIPTIONS = {
  A2: 'Temel Seviye',
  B1: 'Orta Altı',
  B2: 'Orta Üstü',
  C1: 'İleri Seviye',
};

export default function LevelSelectScreen({ navigation, route }) {
  const { status, label, color, bg } = route.params;
  const [levelCounts, setLevelCounts] = useState({ A2: 0, B1: 0, B2: 0, C1: 0 });

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const words = await loadWords();
        setLevelCounts(getLevelCounts(words, status));
      })();
    }, [status])
  );

  const totalInCategory = Object.values(levelCounts).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{label.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>Hangi seviyeden başlamak istersin?</Text>
          <Text style={styles.subtitle}>Bu kategoride toplam {totalInCategory} kelime var.</Text>
        </View>

        <View style={styles.levelList}>
          {LEVELS.map((level) => {
            const count = levelCounts[level];
            const isDisabled = count === 0;

            return (
              <Pressable
                key={level}
                style={({ pressed }) => [
                  styles.levelCard,
                  isDisabled && styles.levelCardDisabled,
                  pressed && !isDisabled && { opacity: 0.8 },
                ]}
                disabled={isDisabled}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Flashcard', {
                    status,
                    level,
                    label,
                    color,
                    bg,
                  });
                }}
              >
                <View style={styles.levelLeft}>
                  <View style={[styles.levelBadge, isDisabled ? {} : { backgroundColor: color }]}>
                    <Text style={[styles.levelBadgeText, isDisabled ? { color: '#64748B' } : { color: '#040D1A' }]}>
                      {level}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.levelName, isDisabled && { color: '#64748B' }]}>
                      {LEVEL_DESCRIPTIONS[level]}
                    </Text>
                    <Text style={[styles.levelCount, isDisabled && { color: '#475569' }]}>
                      {count} kelime seçilmeyi bekliyor
                    </Text>
                  </View>
                </View>
                <Text style={[styles.arrow, isDisabled && { opacity: 0 }]}>
                  ›
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: 12,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  levelList: {
    gap: 16,
  },
  levelCard: {
    backgroundColor: '#0B162C',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#15243C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  levelCardDisabled: {
    backgroundColor: '#060E18',
    borderColor: '#0A1524',
    shadowOpacity: 0,
    elevation: 0,
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeText: {
    fontSize: 20,
    fontWeight: '800',
  },
  levelName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  levelCount: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 32,
    color: '#475569',
    fontWeight: '300',
    marginBottom: 4,
  },
});
