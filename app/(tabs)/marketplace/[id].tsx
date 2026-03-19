import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image as RNImage } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Waste } from '@/lib/types';
import { ArrowLeft, MapPin, Scale, User, ShieldCheck } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
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

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.6;

export default function WasteDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [waste, setWaste] = useState<Waste | null>(null);
  const [loading, setLoading] = useState(true);

  // Swipe Animation logic
  const translateX = useSharedValue(0);

  useEffect(() => {
    async function fetchDetail() {
      const { data, error } = await supabase
        .from('wastes')
        .select(`*, waste_types(*), profiles:seller_id(*)`)
        .eq('id', id)
        .single();
      
      if (data) setWaste(data as Waste);
      setLoading(false);
    }
    fetchDetail();
  }, [id]);

  const handleReserve = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Vous devez être connecté pour réserver !");
        return;
      }

      const { error } = await supabase
        .from('wastes')
        .update({ status: 'reserved', collector_id: user.id })
        .eq('id', id);
      
      if (error) alert(error.message);
      else {
        alert("Félicitations ! Déchet réservé. Contactez le vendeur !");
        router.push('/(tabs)/chat');
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

  if (loading) return null;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1">
        {/* Header / Image Slider Placeholder */}
        <View className="w-full h-[450] bg-slate-50 overflow-hidden relative">
          {waste?.images?.[0] ? (
            <RNImage source={{ uri: waste.images[0] }} className="w-full h-full" resizeMode="cover" />
          ) : (
             <View className="w-full h-full items-center justify-center">
                <Text className="text-8xl opacity-10">{waste?.waste_types?.emoji}</Text>
             </View>
          )}

          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-16 left-8 w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-lg border border-slate-100"
          >
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        </View>

        <View className="-mt-12 bg-white rounded-t-[3rem] px-8 pt-10 pb-40">
           <View className="flex-row items-center justify-between mb-2">
              <Text className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                {waste?.waste_types?.name}
              </Text>
              <View className="px-3 py-1 bg-teal-50 rounded-full">
                <Text className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{waste?.status}</Text>
              </View>
           </View>

           <View className="flex-row items-center mb-8">
              <MapPin size={14} color="#94a3b8" />
              <Text className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest">{waste?.location}</Text>
           </View>

           <View className="flex-row gap-4 mb-10">
              <View className="flex-1 bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem]">
                  <Scale size={20} color="#14b8a6" className="mb-2" />
                  <Text className="text-xl font-black text-slate-900 leading-none">{waste?.estimated_weight} KG</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Poids estimé</Text>
              </View>
              <View className="flex-1 bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem]">
                  <ShieldCheck size={20} color="#14b8a6" className="mb-2" />
                  <Text className="text-xl font-black text-slate-900 leading-none">Vérifié</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Qualité CITICLINE</Text>
              </View>
           </View>

           <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Vendeur</Text>
           <View className="flex-row items-center p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] mb-10">
              <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-slate-100 mr-4">
                <User size={20} color="#64748b" />
              </View>
              <View>
                <Text className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                  {waste?.profiles?.full_name || 'Utilisateur CITICLINE'}
                </Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membre vérifié</Text>
              </View>
           </View>

           <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Description</Text>
           <Text className="text-sm font-medium text-slate-500 leading-relaxed">
             Ce lot de {waste?.waste_types?.name.toLowerCase()} est propre et prêt à être collecté. Idéal pour les collecteurs de proximité recherchant des matériaux de qualité.
           </Text>
        </View>
      </ScrollView>

      {/* FIXED SWIPE BAR AT BOTTOM */}
      <View className="absolute bottom-10 left-8 right-8 h-20 bg-white rounded-[2.5rem] p-1.5 flex-row items-center border border-slate-100 shadow-2xl overflow-hidden">
        <Animated.View style={textOpacity} className="absolute w-full items-center justify-center">
          <Text className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Glisser pour réserver</Text>
        </Animated.View>
        
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View 
            style={animatedStyle}
            className="w-16 h-16 bg-primary rounded-[2.2rem] items-center justify-center shadow-lg"
          >
            <ArrowLeft className="rotate-180" size={24} color="white" />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
}
