import AsyncStorage from '@react-native-async-storage/async-storage';
import seedData from '../data/words.json';

const STORAGE_KEY = '@flashcard_words';

// Initialize: load from storage or seed from JSON
export async function loadWords() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedWords = JSON.parse(stored);
      
      // Havuzda olmayan yeni eklenmiş raw kelimeleri tespit edip AsyncStorage'a senkronize et
      const storedWordTexts = new Set(storedWords.map(w => w.word.toLowerCase()));
      let hasNew = false;
      
      seedData.forEach((item) => {
        if (!storedWordTexts.has(item.word.toLowerCase())) {
          // Find the max ID to safely append
          const maxId = storedWords.reduce((max, w) => {
             const idNum = parseInt(w.id, 10);
             return isNaN(idNum) ? max : Math.max(max, idNum);
          }, 0);
          
          storedWords.push({
            ...item,
            id: (maxId + 1).toString() + Math.random().toString().substring(2, 6), // Benzersiz ID
            status: 'to-learn'
          });
          hasNew = true;
        }
      });

      if (hasNew) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));
      }
      return storedWords;
    }
    
    // First launch: seed all words with "to-learn" status
    const words = seedData.map((w) => ({ ...w, status: 'to-learn' }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    return words;
  } catch (e) {
    console.error('loadWords error:', e);
    return seedData.map((w) => ({ ...w, status: 'to-learn' }));
  }
}

// Save all words
export async function saveWords(words) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (e) {
    console.error('saveWords error:', e);
  }
}

// Update a single word's status
export async function updateWordStatus(words, wordId, newStatus) {
  const updated = words.map((w) =>
    w.id === wordId ? { ...w, status: newStatus } : w
  );
  await saveWords(updated);
  return updated;
}

// Delete a word permanently
export async function deleteWord(words, wordId) {
  const updated = words.filter((w) => w.id !== wordId);
  await saveWords(updated);
  return updated;
}

// Add a new word
export async function addWord(words, word, translation, level) {
  const maxId = words.reduce((max, w) => Math.max(max, w.id), 0);
  const newWord = {
    id: maxId + 1,
    word,
    translation,
    level,
    status: 'to-learn',
  };
  const updated = [...words, newWord];
  await saveWords(updated);
  return updated;
}

// Get words by status and optionally level
export function getWordsByFilter(words, status, level = null) {
  return words.filter(
    (w) => w.status === status && (level === null || w.level === level)
  );
}

// Get counts per status
export function getCounts(words) {
  return {
    'to-learn': words.filter((w) => w.status === 'to-learn').length,
    'to-repeat': words.filter((w) => w.status === 'to-repeat').length,
    memorized: words.filter((w) => w.status === 'memorized').length,
    spam: words.filter((w) => w.status === 'spam').length,
  };
}

// Get counts per level for a given status
export function getLevelCounts(words, status) {
  const filtered = words.filter((w) => w.status === status);
  return {
    A2: filtered.filter((w) => w.level === 'A2').length,
    B1: filtered.filter((w) => w.level === 'B1').length,
    B2: filtered.filter((w) => w.level === 'B2').length,
    C1: filtered.filter((w) => w.level === 'C1').length,
  };
}

// Reset all data (for debugging)
export async function resetAllData() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
