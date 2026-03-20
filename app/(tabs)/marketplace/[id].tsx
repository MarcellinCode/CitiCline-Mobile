import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image as RNImage, StyleSheet } from 'react-native';
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
        router.push({ 
          pathname: '/(tabs)/chat/[id]', 
          params: { 
            id: waste?.seller_id, 
            name: waste?.profiles?.full_name || 'Vendeur',
            waste_id: waste?.id // Transmission de l'ID du lot pour compatibilité web
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
     return <View style={styles.container} />; // Eviter de retourner null pour prévenir les problèmes de montage
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header / Image Slider Placeholder */}
        <View style={styles.imageContainer}>
          {waste?.images?.[0] ? (
            <RNImage source={{ uri: waste.images[0] }} style={styles.image} resizeMode="cover" />
          ) : (
             <View style={styles.emojiContainer}>
                <Text style={styles.emojiText}>{waste?.waste_types?.emoji}</Text>
             </View>
          )}

          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
           <View style={styles.titleRow}>
              <Text style={styles.wasteName}>
                {waste?.waste_types?.name}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{waste?.status}</Text>
              </View>
           </View>

           <View style={styles.locationRow}>
              <MapPin size={14} color="#94a3b8" />
              <Text style={styles.locationText}>{waste?.location}</Text>
           </View>

           <View style={styles.statsRow}>
              <View style={styles.statBox}>
                  <Scale size={20} color="#14b8a6" style={{ marginBottom: 8 }} />
                  <Text style={styles.statBoxValue}>{waste?.estimated_weight} KG</Text>
                  <Text style={styles.statBoxLabel}>Poids estimé</Text>
              </View>
              <View style={styles.statBox}>
                  <ShieldCheck size={20} color="#14b8a6" style={{ marginBottom: 8 }} />
                  <Text style={styles.statBoxValue}>Vérifié</Text>
                  <Text style={styles.statBoxLabel}>Qualité CITICLINE</Text>
              </View>
           </View>

           <Text style={styles.sectionTitle}>Vendeur</Text>
           <View style={styles.sellerCard}>
              <View style={styles.sellerAvatarBg}>
                <User size={20} color="#64748b" />
              </View>
              <View>
                <Text style={styles.sellerName}>
                  {waste?.profiles?.full_name || 'Utilisateur CITICLINE'}
                </Text>
                <Text style={styles.sellerStatus}>Membre vérifié</Text>
              </View>
           </View>

           <Text style={styles.sectionTitle}>Description</Text>
           <Text style={styles.descriptionText}>
             Ce lot de {waste?.waste_types?.name.toLowerCase()} est propre et prêt à être collecté. Idéal pour les collecteurs de proximité recherchant des matériaux de qualité.
           </Text>
        </View>
      </ScrollView>

      {/* FIXED SWIPE BAR AT BOTTOM */}
      <View style={styles.swipeContainer}>
        <Animated.View style={[styles.swipeTextContainer, textOpacity]}>
          <Text style={styles.swipeHintText}>Glisser pour réserver</Text>
        </Animated.View>
        
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.swipeButton, animatedStyle]}>
            <ArrowLeft style={{ transform: [{ rotate: '180deg' }] }} size={24} color="white" />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollView: { flex: 1 },
  imageContainer: { width: '100%', height: 450, backgroundColor: '#f8fafc', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  emojiContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 96, opacity: 0.1 },
  backBtn: { position: 'absolute', top: 64, left: 32, width: 48, height: 48, backgroundColor: 'white', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  contentContainer: { marginTop: -48, backgroundColor: 'white', borderTopLeftRadius: 48, borderTopRightRadius: 48, paddingHorizontal: 32, paddingTop: 40, paddingBottom: 160 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  wasteName: { fontSize: 30, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#f0fdfa', borderRadius: 9999 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#0d9488', textTransform: 'uppercase', letterSpacing: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  locationText: { fontSize: 14, fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 2, marginLeft: 4 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', padding: 24, borderRadius: 40 },
  statBoxValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  statBoxLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 40, marginBottom: 40 },
  sellerAvatarBg: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9', marginRight: 16 },
  sellerName: { fontSize: 14, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  sellerStatus: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 },
  descriptionText: { fontSize: 14, fontWeight: '500', color: '#64748b', lineHeight: 24 },
  swipeContainer: { position: 'absolute', bottom: 40, left: 32, right: 32, height: 80, backgroundColor: 'white', borderRadius: 40, padding: 6, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 15 },
  swipeTextContainer: { position: 'absolute', width: '100%', alignItems: 'center', justifyContent: 'center' },
  swipeHintText: { color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 },
  swipeButton: { width: 64, height: 64, backgroundColor: '#2aa275', borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#2aa275', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }
});
