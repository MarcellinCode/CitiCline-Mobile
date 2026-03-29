import 'react-native-reanimated';
import { Stack, useRouter, useSegments } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { navigateSafe } from "@/utils/navigation";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../src/styles/global.css";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

import { ProfileProvider } from "../src/context/ProfileContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { expoPushToken, notification } = usePushNotifications();
  const [loaded, error] = useFonts({});
  const segments = useSegments();
// Auth logic is now handled in ProfileProvider via Context

  return (
    <ErrorBoundary>
      <ProfileProvider>
        <AuthNavigationWrapper loaded={loaded} error={error} segments={segments}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                animation: 'fade_from_bottom',
              }} 
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </GestureHandlerRootView>
        </AuthNavigationWrapper>
      </ProfileProvider>
    </ErrorBoundary>
  );
}

import { useProfileContext } from "../src/context/ProfileContext";

function AuthNavigationWrapper({ children, loaded, error, segments }: { children: React.ReactNode, loaded: boolean, error: any, segments: string[] }) {
  const { session, loading: profileLoading } = useProfileContext();
  const router = useRouter();

  useEffect(() => {
    if (profileLoading || (!loaded && !error)) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inIndex = segments.length === 0 || (segments.length === 1 && segments[0] === '');

    if (session && (inAuthGroup || inOnboarding || inIndex)) {
      router.replace(ROUTES.MARKETPLACE);
    } else if (!session && !inAuthGroup && !inOnboarding && !inIndex) {
      router.replace('/');
    }

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {}
    };

    // Only hide splash when profile is loaded (or error)
    if (!profileLoading) {
      setTimeout(hideSplash, 300);
    }
  }, [session, profileLoading, loaded, segments]);

  // Global Message Listener - Staticized to avoid re-renders on every scroll/nav
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('global_messages_fixed')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${session.user.id}`
        },
        async (payload: any) => {
          // Verify path without depending on segments array to avoid re-running effect
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.sender_id)
            .single();

          Alert.alert(
            "Nouveau Message",
            `${data?.full_name || 'Partenaire'}: ${payload.new.content}`,
            [
              { text: "Ignorer", style: "cancel" },
              { 
                text: "Répondre", 
                onPress: () => router.push({
                  pathname: ROUTES.CHAT_DETAILS(payload.new.sender_id),
                  params: { name: data?.full_name }
                } as any)
              }
            ]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]); // Only depend on User ID, NOT segments

  if (!loaded && !error) return null;

  return children;
}
