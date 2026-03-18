import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  loadWords,
  getWordsByFilter,
  updateWordStatus,
  deleteWord,
} from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

const STATUS_CONFIG = {
  'to-learn': { label: 'Öğrenilecekler', color: '#60A5FA', emoji: '📘' },
  'to-repeat': { label: 'Tekrar', color: '#FBBF24', emoji: '🔁' },
  memorized: { label: 'Ezber', color: '#34D399', emoji: '🏆' },
  spam: { label: 'Kolay/Spam', color: '#9CA3AF', emoji: '👻' },
};

export default function FlashcardScreen({ navigation, route }) {
  const { status, level, color, bg } = route.params;
  const [allWords, setAllWords] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const stateRef = useRef({ index: 0, length: 0 });
  stateRef.current = { index: currentIndex, length: cards.length };

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (_, gs) => {
        return Math.abs(gs.dx) > 30 && Math.abs(gs.dx) > Math.abs(gs.dy);
      },
      onPanResponderMove: (_, gs) => {
        slideAnim.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        const { index, length } = stateRef.current;
        if (gs.dx > SWIPE_THRESHOLD && index > 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.timing(slideAnim, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex((i) => i - 1);
            resetFlip();
            slideAnim.setValue(-SCREEN_WIDTH);
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 50,
              useNativeDriver: true,
            }).start();
          });
        } else if (gs.dx < -SWIPE_THRESHOLD && index < length - 1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.timing(slideAnim, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex((i) => i + 1);
            resetFlip();
            slideAnim.setValue(SCREEN_WIDTH);
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 50,
              useNativeDriver: true,
            }).start();
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const words = await loadWords();
        setAllWords(words);
        
        let filtered = getWordsByFilter(words, status, level);
        for (let i = filtered.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        
        setCards(filtered);
        setCurrentIndex(0);
        resetFlip();
      })();
    }, [status, level])
  );

  const resetFlip = () => {
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const animateButtonTransition = (callback) => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      slideAnim.setValue(SCREEN_WIDTH);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleStatusChange = async (newStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const card = cards[currentIndex];
    const updatedAll = await updateWordStatus(allWords, card.id, newStatus);
    setAllWords(updatedAll);
    const newCards = cards.filter((c) => c.id !== card.id);
    setCards(newCards);

    if (newCards.length === 0) {
      navigation.goBack();
      return;
    }

    const newIndex = Math.min(currentIndex, newCards.length - 1);
    animateButtonTransition(() => {
      setCurrentIndex(newIndex);
      resetFlip();
    });
  };

  const handleDelete = (card) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Emin misin?', `"${card.word}" kalıcı olarak silinecek.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const updatedAll = await deleteWord(allWords, card.id);
          setAllWords(updatedAll);
          const newCards = cards.filter((c) => c.id !== card.id);
          setCards(newCards);

          if (newCards.length === 0) {
            navigation.goBack();
            return;
          }

          const newIndex = Math.min(currentIndex, newCards.length - 1);
          animateButtonTransition(() => {
            setCurrentIndex(newIndex);
            resetFlip();
          });
        },
      },
    ]);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const otherStatuses = Object.keys(STATUS_CONFIG).filter((s) => s !== status);

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>Tebrikler!</Text>
          <Text style={styles.emptyText}>Bu bölümdeki tüm kartları bitirdin.</Text>
          <Pressable
            style={({ pressed }) => [styles.backBtn, { backgroundColor: color, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backBtnText, { color: '#040D1A' }]}>Geri Dön</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const card = cards[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header / Progress */}
        <View style={styles.headerArea}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: color,
                    width: `${((currentIndex + 1) / cards.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.counterText}>
            <Text style={styles.counterCurrent}>{currentIndex + 1}</Text>
            <Text style={styles.counterTotal}> / {cards.length}</Text>
          </Text>
        </View>

        {/* Card Area */}
        <View style={styles.cardArea} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.cardWrapper,
              { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
            ]}
          >
            <Pressable
              onPress={flipCard}
              style={styles.cardTouchable}
            >
              {/* Front */}
              <Animated.View
                style={[
                  styles.card,
                  styles.cardFront,
                  { transform: [{ rotateY: frontInterpolate }] },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.5 : 1 }]}
                  onPress={() => handleDelete(card)}
                  hitSlop={15}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </Pressable>

                <View style={[styles.levelTag, { backgroundColor: bg }]}>
                  <Text style={[styles.levelTagText, { color }]}>
                    {card.level}
                  </Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardWord}>{card.word}</Text>
                </View>

                <Text style={styles.tapHint}>çevirmek için dokun</Text>
              </Animated.View>

              {/* Back */}
              <Animated.View
                style={[
                  styles.card,
                  styles.cardBack,
                  { transform: [{ rotateY: backInterpolate }] },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.5 : 1 }]}
                  onPress={() => handleDelete(card)}
                  hitSlop={15}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </Pressable>

                <View style={[styles.levelTag, { backgroundColor: bg }]}>
                  <Text style={[styles.levelTagText, { color }]}>
                    {card.level}
                  </Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTranslation}>{card.translation}</Text>
                  <Text style={styles.cardWordSmall}>{card.word}</Text>
                </View>

                <Text style={styles.tapHint}>tekrar çevir</Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Swipe Hint / Navigation */}
        <View style={styles.navRow}>
          <Text style={styles.swipeHint}>
            {currentIndex > 0 ? '← Önceki' : ''}
          </Text>
          <Text style={styles.swipeHint}>
            {currentIndex < cards.length - 1 ? 'Sonraki →' : ''}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Text style={styles.actionTitle}>Kartı Taşı:</Text>
          <View style={styles.actionRow}>
            {otherStatuses.map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <Pressable
                  key={s}
                  style={({ pressed }) => [styles.actionBtn, { backgroundColor: cfg.bg, opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => handleStatusChange(s)}
                >
                  <Text style={styles.actionEmoji}>{cfg.emoji}</Text>
                  <Text style={[styles.actionLabel, { color: cfg.color }]}>{cfg.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#040D1A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerArea: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  counterText: {
    fontVariant: ['tabular-nums'],
  },
  counterCurrent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  counterTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    aspectRatio: 0.75,
    maxHeight: 400,
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: '#0B162C', // Deep sea core
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: '#15243C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
    padding: 24,
  },
  cardFront: {},
  cardBack: {
    backgroundColor: '#0F1E38', // Slightly different for back
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '800',
  },
  levelTag: {
    position: 'absolute',
    top: 24,
    left: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  levelTagText: {
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  cardWord: {
    fontSize: 42,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: -1,
  },
  cardTranslation: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  cardWordSmall: {
    fontSize: 18,
    color: '#94A3B8',
    marginTop: 16,
    fontWeight: '500',
  },
  tapHint: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  swipeHint: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  actionContainer: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  actionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  backBtn: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
