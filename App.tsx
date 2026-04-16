import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider, useApp } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { InteractionsProvider } from './src/context/InteractionsContext';
import AuthEmailScreen from './src/screens/AuthEmailScreen';
import AuthOTPScreen from './src/screens/AuthOTPScreen';
import SplashScreenView from './src/screens/SplashScreen';
import RegionSelectionScreen from './src/screens/RegionSelectionScreen';
import AlertSetupScreen from './src/screens/AlertSetupScreen';
import ManageRegionsScreen from './src/screens/ManageRegionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import SearchScreen from './src/screens/SearchScreen';
import SectionDetailScreen from './src/screens/SectionDetailScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import MainTabs from './src/navigation/MainTabs';
import { setupNotificationHandler, createAndroidChannels } from './src/services/notificationService';
import type { RootStackParamList } from './src/navigation/types';

SplashScreen.preventAutoHideAsync();
setupNotificationHandler();

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { onboardingComplete } = useApp();
  const { isAuthLoading } = useAuth();

  useEffect(() => {
    createAndroidChannels();
  }, []);

  // Hide the native splash only once all async init (fonts, storage, auth) is done.
  // This prevents the blank dark frame that appears when the splash hides before
  // the navigator has content to show.
  useEffect(() => {
    if (!isAuthLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAuthLoading]);

  if (isAuthLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!onboardingComplete ? (
        // ── Onboarding flow (no login required) ──────────────────
        <>
          <Stack.Screen name="Splash" component={SplashScreenView} />
          <Stack.Screen name="RegionSelection" component={RegionSelectionScreen} />
        </>
      ) : (
        // ── Main app (open to all) ────────────────────────────────
        <Stack.Screen name="Main" component={MainTabs} />
      )}
      {/* Always-available screens */}
      <Stack.Screen name="AuthEmail" component={AuthEmailScreen} />
      <Stack.Screen name="AuthOTP" component={AuthOTPScreen} />
      <Stack.Screen name="AlertSetup" component={AlertSetupScreen} />
      <Stack.Screen name="ManageRegions" component={ManageRegionsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="SectionDetail" component={SectionDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}

function AppWithFonts() {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AuthProvider>
          <InteractionsProvider>
            <AppWithFonts />
          </InteractionsProvider>
        </AuthProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
