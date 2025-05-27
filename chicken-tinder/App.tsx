import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import LoginScreen from './features/auth/LoginScreen';
import RegisterScreen from './features/auth/RegisterScreen';
import PairingScreen from './features/auth/PairingScreen';
import SwipeScreen from './features/swipe/SwipeScreen';
import TournamentScreen from './features/tournament/TournamentScreen';
import ResultScreen from './features/tournament/ResultScreen';
import HistoryScreen from './features/settings/HistoryScreen';
import SettingsScreen from './features/settings/SettingsScreen';

// Import providers
import { AuthProvider } from './providers/auth-provider';
import { SessionProvider } from './providers/session-provider';

// Import types
import { RootStackParamList } from './lib/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SessionProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Pairing" component={PairingScreen} />
              <Stack.Screen name="Swipe" component={SwipeScreen} />
              <Stack.Screen name="Tournament" component={TournamentScreen} />
              <Stack.Screen name="Result" component={ResultScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </SessionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
