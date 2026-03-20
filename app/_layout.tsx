import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../src/styles/global.css";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { expoPushToken, notification } = usePushNotifications();
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  
  const [loaded, error] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoaded(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (!authLoaded || !loaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inIndex = segments.length === 0 || (segments.length === 1 && segments[0] === '');

    if (session && (inAuthGroup || inOnboarding || inIndex)) {
      // If logged in and in auth/onboarding/index, go to main app
      router.replace('/(tabs)/marketplace');
    } else if (!session && !inAuthGroup && !inOnboarding && !inIndex) {
      // If not logged in and not in auth/onboarding/index, go to home
      router.replace('/');
    }
  }, [session, authLoaded, loaded, segments]);

  // Global Message Listener for in-app notifications
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('global_messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${session.user.id}`
        },
        async (payload: any) => {
          // If we are already in the chat with this person, don't show an alert
          const currentPath = segments.join('/');
          const isChatting = currentPath.includes('chat/') && currentPath.includes(payload.new.sender_id);
          
          if (!isChatting) {
            // Fetch sender name
            const { data } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.sender_id)
              .single();

            Alert.alert(
              "Nouveau Message",
              `${data?.full_name || 'Partenaire CITICLINE'}: ${payload.new.content}`,
              [
                { text: "Ignorer", style: "cancel" },
                { 
                  text: "Répondre", 
                  onPress: () => router.push({
                    pathname: '/(tabs)/chat/[id]',
                    params: { id: payload.new.sender_id, name: data?.full_name }
                  } as any)
                }
              ]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, segments]);

  if (!loaded && !error) {
    return null;
  }

  return (
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
  );
}
