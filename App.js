import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './src/screens/DashboardScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import FlashcardScreen from './src/screens/FlashcardScreen';
import AddWordScreen from './src/screens/AddWordScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{
            headerStyle: { backgroundColor: '#040D1A' }, // Deep Sea
            headerTintColor: '#F8FAFC',
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            headerShadowVisible: false,
            headerBackTitle: 'Geri',
            contentStyle: { backgroundColor: '#040D1A' },
            animation: 'none', // Animasyon (efekt) iptal edildi
          }}
        >
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LevelSelect"
            component={LevelSelectScreen}
            options={{
              title: '',
            }}
          />
          <Stack.Screen
            name="Flashcard"
            component={FlashcardScreen}
            options={{
              title: '',
            }}
          />
          <Stack.Screen
            name="AddWord"
            component={AddWordScreen}
            options={{ title: 'Yeni Kelime' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
