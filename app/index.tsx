import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, Image as RNImage } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter, Redirect } from 'expo-router';
import { ROUTES } from "@/constants/routes";
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Leaf } from 'lucide-react-native';
import { CITICLINE_LOGO_BASE64 } from '@/components/ui/logoBase64';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { HubButton } from '@/components/ui/HubButton';
import { HubText } from '@/components/ui/HubText';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<Session | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch (e) {
        console.error("Home screen auth check failed:", e);
      } finally {
        setIsChecking(false);
      }
    };
    init();
  }, []);

  if (isChecking) {
    return <View className="flex-1 bg-white" />;
  }

  if (session) {
    return <Redirect href={ROUTES.MARKETPLACE as any} />;
  }

  return (
    <View 
      className="flex-1 bg-white items-center justify-between px-8"
      style={{ 
        paddingTop: insets.top + 60,
        paddingBottom: Math.max(insets.bottom, 40)
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      {/* Top Section: Logo & Badge */}
      <View className="items-center justify-center">
        <View className="w-48 h-48 bg-zinc-50 rounded-[4rem] items-center justify-center shadow-2xl shadow-zinc-200/50">
          <RNImage 
            source={{ uri: CITICLINE_LOGO_BASE64 }} 
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>
        <View className="bg-primary/10 px-4 py-2 rounded-full mt-8 flex-row items-center">
          <Leaf size={14} color="#2A9D8F" />
          <HubText variant="label" className="ml-2 text-primary">ECO-ENGINEERING HUB</HubText>
        </View>
      </View>
 
      {/* Middle Section: Hero Text */}
      <View className="items-center w-full">
        <View>
          <Text className="text-5xl font-black uppercase italic tracking-tighter text-zinc-900 text-center leading-[0.9]">
            CITI<Text className="text-primary">CLINE</Text>
          </Text>
        </View>
        <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mt-4 text-center">
          L'EXCELLENCE DE LA GESTION DES DÉCHETS
        </Text>
      </View>
 
      {/* Bottom Section: Action & Footer */}
      <View className="w-full">
        <HubButton 
          onPress={() => router.push('/onboarding')}
          size="xl"
          variant="primary"
          icon={<ArrowRight size={20} color="white" />}
        >
          Commencer l'aventure
        </HubButton>
        
        <View className="mt-12 items-center">
            <HubText variant="label" className="text-zinc-300">Powered by Citicline Central</HubText>
        </View>
      </View>

    </View>
  );
}
