import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      
      <Stack screenOptions={{ animation: 'slide_from_right', presentation: 'card' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-club"
          options={{
            headerTitle: '',
          }}
        />
        <Stack.Screen
          name="join-club"
          options={{
            headerTitle: '',
          }}
        />
        <Stack.Screen
          name="signupScreen"
          options={{
            title: 'Create Account',
            headerShown: true,
            headerStyle: { backgroundColor: '#4c87df' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'back',
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            title: 'Sign In',
            headerShown: true,
            headerStyle: { backgroundColor: '#4c87df' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'back',
          }}
          />
          <Stack.Screen
          name="[id]"
          options={{
            headerTitle: '',
            headerShown: true,
            headerStyle: { backgroundColor: '#4c87df' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'back',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
