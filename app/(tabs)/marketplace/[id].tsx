import { View, ScrollView, TouchableOpacity, Dimensions, Image as RNImage, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Waste } from '@/lib/types';
import { 
  MapPin, 
  ShieldCheck, 
  ArrowLeft,
  Scale,
  ChevronRight,
  Leaf,
  Scan,
  KeyRound
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

import { useProfile } from '@/hooks/useProfile';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { HubButton } from '@/components/ui/HubButton';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.6;

export default function WasteDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [waste, setWaste] = useState<Waste | null>(null);
  const [loading, setLoading] = useState(true);

  // Swipe Animation logic
  const translateX = useSharedValue(0);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const { data, error } = await supabase
          .from('wastes')
          .select(`*, waste_types(*), profiles:seller_id(*)`)
          .eq('id', id)
          .single();
        
        if (data) setWaste(data as Waste);
      } catch (err) {
        console.error("fetchDetail error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleReserve = async () => {
    if (!profile?.id) {
      alert("Vous devez être connecté pour réserver !");
      return;
    }
    try {
      const { error } = await supabase
        .from('wastes')
        .update({ status: 'reserved', collector_id: profile.id })
        .eq('id', id);
      
      if (error) alert(error.message);
      else {
        alert("Félicitations ! Déchet réservé. Contactez le vendeur !");
        router.push({
            pathname: `/chat/${waste?.seller_id}`,
            params: { 
                name: (waste?.profiles as any)?.full_name || 'Vendeur'
            }
        } as any);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
    onStart: (_, ctx) => { ctx.startX = translateX.value; },
    onActive: (event, ctx) => {
      translateX.value = Math.max(0, ctx.startX + event.translationX);
    },
    onEnd: () => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(width - 80);
        runOnJS(handleReserve)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const textOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [1, 0], Extrapolate.CLAMP),
  }));

  if (loading) {
      return (
        <View className="flex-1 bg-white items-center justify-center">
            <HubText variant="label" className="animate-pulse">Chargement...</HubText>
        </View>
      );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View className="w-full h-[450px] bg-zinc-50 overflow-hidden relative">
          {waste?.images?.[0] ? (
            <RNImage source={{ uri: waste.images[0] }} className="w-full h-full" resizeMode="cover" />
          ) : (
             <View className="w-full h-full items-center justify-center bg-emerald-50/30">
                <HubText className="text-9xl opacity-10">{waste?.waste_types?.emoji}</HubText>
                <Leaf size={120} color="#2A9D8F" className="absolute opacity-5" />
             </View>
          )}

          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute left-8 w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-2xl shadow-zinc-900/20 border border-zinc-100"
            style={{ top: insets.top + (Platform.OS === 'android' ? 20 : 0) }}
          >
            <ArrowLeft size={20} color="#020617" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* Content Container */}
        <View className="mt-[-60px] bg-white rounded-[4rem] px-8 pt-12 pb-40 border-t border-zinc-50">
            <View className="flex-row items-center justify-between mb-4">
                <HubText variant="h1" className="text-zinc-900 leading-tight">
                    {waste?.waste_types?.name}
                </HubText>
                <View className="bg-primary/10 px-4 py-2 rounded-full">
                    <HubText variant="label" className="text-primary text-[10px] tracking-[0.2em] mb-0">
                        {waste?.status === 'published' ? 'DISPONIBLE' : waste?.status?.toUpperCase()}
                    </HubText>
                </View>
            </View>

            <View className="flex-row items-center gap-2 mb-10">
                <MapPin size={16} color="#2A9D8F" />
                <HubText variant="caption" className="text-zinc-400 text-sm italic">{waste?.location}</HubText>
            </View>

            {/* Stats Bento Grid */}
            <View className="flex-row gap-4 mb-10">
                <HubCard className="flex-1 p-6 bg-zinc-50 border-0 items-center justify-center">
                    <Scale size={24} color="#2A9D8F" className="mb-4" />
                    <HubText variant="h2" className="text-zinc-900 text-xl mb-1">{waste?.estimated_weight} KG</HubText>
                    <HubText variant="label" className="text-zinc-400 text-[8px] tracking-widest">POIDS ESTIMÉ</HubText>
                </HubCard>
                <HubCard className="flex-1 p-6 bg-zinc-50 border-0 items-center justify-center">
                    <ShieldCheck size={24} color="#2A9D8F" className="mb-4" />
                    <HubText variant="h2" className="text-zinc-900 text-xl mb-1">VÉRIFIÉ</HubText>
                    <HubText variant="label" className="text-zinc-400 text-[8px] tracking-widest">QUALITÉ HUB</HubText>
                </HubCard>
            </View>

            {/* Seller Section */}
            <HubText variant="label" className="mb-6 ml-2">Propriétaire du lot</HubText>
            <HubCard className="flex-row items-center justify-between p-6 border-2 border-zinc-50 mb-10">
                <View className="flex-row items-center gap-4">
                    <View className="w-14 h-14 rounded-2xl bg-zinc-100 items-center justify-center border border-zinc-100">
                        <HubText className="text-xl">👤</HubText>
                    </View>
                    <View>
                        <HubText variant="h3" className="text-zinc-900 text-[13px] mb-0">
                            {(waste?.profiles as any)?.full_name || 'Utilisateur CITICLINE'}
                        </HubText>
                        <HubText variant="caption" className="text-primary font-black text-[9px] tracking-widest uppercase">MEMBRE CERTIFIÉ</HubText>
                    </View>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-zinc-50 items-center justify-center border border-zinc-100">
                    <ChevronRight size={16} color="#020617" strokeWidth={3} />
                </TouchableOpacity>
            </HubCard>

            {/* Collector Validation Section */}
            {waste.status === 'reserved' && profile?.id === waste.collector_id && (
                <View className="mb-10">
                    <HubText variant="label" className="mb-4 ml-2">Validation de la collecte</HubText>
                    <HubCard className="p-8 border-2 border-emerald-50">
                        <TouchableOpacity 
                            onPress={() => {
                                alert("Simulation : QR Code scanné avec succès !");
                                const weight = prompt("Confirmez le poids final (KG) :", waste.estimated_weight.toString());
                                if (weight) {
                                    alert(`Collecte de ${weight}kg validée ! Paiement en cours...`);
                                    router.replace(ROUTES.WALLET as any);
                                }
                            }}
                            className="bg-zinc-900 h-16 rounded-2xl flex-row items-center justify-center gap-3 mb-6"
                        >
                            <Scan size={20} color="white" />
                            <HubText className="text-white font-bold text-[10px] tracking-widest uppercase">Scanner le QR Code</HubText>
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-4 mb-6">
                            <View className="h-[1px] flex-1 bg-zinc-100" />
                            <HubText className="text-zinc-300 text-[8px] font-bold">OU PIN CODE</HubText>
                            <View className="h-[1px] flex-1 bg-zinc-100" />
                        </View>

                        <TouchableOpacity 
                            onPress={() => {
                                const pin = prompt("Saisissez le code PIN du vendeur :");
                                if (pin?.toUpperCase() === waste.id.slice(0, 6).toUpperCase()) {
                                    const weight = prompt("Confirmez le poids final (KG) :", waste.estimated_weight.toString());
                                    if (weight) {
                                        alert(`Collecte de ${weight}kg validée !`);
                                        router.replace(ROUTES.WALLET as any);
                                    }
                                } else if (pin) {
                                    alert("Code PIN incorrect.");
                                }
                            }}
                            className="bg-white border-2 border-zinc-100 h-16 rounded-2xl flex-row items-center justify-center gap-3"
                        >
                            <KeyRound size={20} color="#020617" />
                            <HubText className="text-zinc-900 font-bold text-[10px] tracking-widest uppercase">Entrer le PIN manuel</HubText>
                        </TouchableOpacity>
                    </HubCard>
                </View>
            )}

            <HubText variant="label" className="mb-4 ml-2">Description</HubText>
            <HubText variant="body" className="text-zinc-500 leading-relaxed mb-10">
                Ce lot de <HubText variant="body" className="text-zinc-900 font-bold">{waste?.waste_types?.name.toLowerCase()}</HubText> est trié et prêt à être collecté. CITICLINE garantit la traçabilité de ce lot jusqu'au centre de traitement agréé.
            </HubText>

        </View>
      </ScrollView>

      {/* FIXED SWIPE BAR AT BOTTOM */}
      <View 
        className="absolute left-8 right-8 h-24 bg-zinc-900 rounded-[3rem] p-2 flex-row items-center border-4 border-white shadow-2xl shadow-zinc-900/50"
        style={{ bottom: insets.bottom + 40 }}
      >
        <Animated.View className="absolute w-full items-center justify-center" style={textOpacity}>
          <HubText variant="label" className="text-white/40 italic tracking-[0.2em] mb-0">GLISSER POUR RÉSERVER</HubText>
        </Animated.View>
        
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View 
            className="w-20 h-20 bg-primary rounded-[2.5rem] items-center justify-center shadow-xl shadow-primary/30"
            style={animatedStyle}
          >
            <ChevronRight size={32} color="white" strokeWidth={3} />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
}
