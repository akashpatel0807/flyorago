import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store';
import { AnimatedToast } from '../components/AnimatedToast';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import { useState } from 'react';

// Keep splash screen visible until we load auth status
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const scheme = useColorScheme();
  const initializeAuth = useAuthStore((state) => state.initialize);
  const authLoading = useAuthStore((state) => state.isLoading);
  const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  useEffect(() => {
    // Initialise auth and hide splash screen
    const loadApp = async () => {
      console.log('Starting auth initialization...');
      try {
        await initializeAuth();
        console.log('Auth initialized.');
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
          console.log('Splash screen hidden.');
        }
      } catch (e) {
        console.error('Error during loadApp:', e);
      }
    };
    if (fontsLoaded) {
      loadApp();
    }
  }, [initializeAuth, fontsLoaded]);

  // Do not return null here, Expo Router needs the Stack to mount.
  // The splash screen prevents the user from seeing the initial unauthenticated state.

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/signup" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="kyc" />
            <Stack.Screen name="admin/login" />
            <Stack.Screen name="admin/dashboard" />
            <Stack.Screen name="create-shipment" />
            <Stack.Screen name="create-trip" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="personal-information" />
            <Stack.Screen name="addresses" />
            <Stack.Screen name="payment-methods" />
            <Stack.Screen name="refer-earn" />
            <Stack.Screen name="help-support" />
            <Stack.Screen name="settings-preferences" />
            <Stack.Screen name="find-traveller" />
            <Stack.Screen name="package-details" />
          </Stack>
          <AnimatedToast />
          
          {/* Custom Animated Splash Screen Overlay */}
          {!isSplashAnimationComplete && (
            <AnimatedSplashScreen onAnimationComplete={() => setIsSplashAnimationComplete(true)} />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
