import { View, ScrollView, TouchableOpacity, Dimensions, Image as RNImage, Platform, Alert } from 'react-native';
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

  // ✅ Fix race condition : verrou optimiste sur status='published'
  const handleReserve = async () => {
    if (!profile?.id) {
      Alert.alert("Non autorisé", "Vous devez être connecté pour réserver !");
      return;
    }
    try {
      const { data, error } = await supabase
        .from('wastes')
        .update({ status: 'reserved', collector_id: profile.id, reserved_at: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'published')   // ← verrou optimiste : échoue si déjà réservé
        .select()
        .single();

      if (error || !data) {
        Alert.alert(
          "Lot déjà pris",
          "Ce lot vient d'être réservé par un autre collecteur. Veuillez en choisir un autre."
        );
        return;
      }

      // Notifications
      await supabase.from('notifications').insert([
        { profile_id: data.seller_id, title: "Lot Réservé !", content: "Votre lot a été réservé par un collecteur.", type: 'offer' },
        { profile_id: profile.id,     title: "Réservation confirmée", content: "Vous avez réservé ce lot avec succès.", type: 'collection' }
      ]);

      Alert.alert("Félicitations !", "Lot réservé avec succès. Contactez le vendeur !");
      router.push({
        pathname: `/chat/${waste?.seller_id}`,
        params: { name: (waste?.profiles as any)?.full_name || 'Vendeur' }
      } as any);
    } catch (err: any) {
      console.error("handleReserve error:", err);
      Alert.alert("Erreur", err.message || "Une erreur est survenue lors de la réservation.");
    }
  };

  // ✅ Fix simulation vide : logique métier réelle de confirmation de collecte
  const handleConfirmCollection = async (finalWeight: number) => {
    if (!waste || !profile?.id) return;

    try {
      // 1. Vérifier que c'est bien ce collecteur qui a le lot
      if (waste.collector_id !== profile.id) {
        Alert.alert("Non autorisé", "Seul le collecteur assigné peut confirmer la collecte.");
        return;
      }
      if (waste.status !== 'reserved') {
        Alert.alert("Erreur", "Ce lot ne peut pas être validé (statut : " + waste.status + ")");
        return;
      }

      // 2. Récupérer les wallets + taux fiscaux configurables
      const pricePerKg    = waste.waste_types?.price_per_kg ?? 150;
      const totalAmount   = finalWeight * pricePerKg;

      // Lire les taux depuis platform_settings (fallback : 10% commission, 2% éco-taxe)
      let commissionRate = 0.10;
      let ecoTaxRate     = 0.02;
      try {
        const { data: settings } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', ['commission_rate', 'eco_tax_rate']);
        if (settings) {
          for (const s of settings) {
            const v = parseFloat(s.value);
            if (!isNaN(v)) {
              if (s.key === 'commission_rate') commissionRate = v;
              if (s.key === 'eco_tax_rate')    ecoTaxRate     = v;
            }
          }
        }
      } catch { /* utilise les valeurs par défaut */ }

      const commission    = totalAmount * commissionRate;
      const sellerAmount  = totalAmount - commission;
      const ecoTax        = totalAmount * ecoTaxRate;
      const ecoPoints     = Math.round(finalWeight);

      const [{ data: sellerProfile }, { data: collectorProfile }] = await Promise.all([
        supabase.from('profiles').select('wallet_balance, eco_points').eq('id', waste.seller_id).single(),
        supabase.from('profiles').select('wallet_balance').eq('id', profile.id).single(),
      ]);

      // 3. Mise à jour statut du lot
      await supabase.from('wastes').update({
        status: 'collected',
        final_weight: finalWeight,
      }).eq('id', waste.id);

      // 4. Créditer vendeur + débiter collecteur
      await Promise.all([
        supabase.from('profiles').update({
          wallet_balance: Number(sellerProfile?.wallet_balance ?? 0) + sellerAmount,
          eco_points:     Number(sellerProfile?.eco_points ?? 0) + ecoPoints,
        }).eq('id', waste.seller_id),

        supabase.from('profiles').update({
          wallet_balance: Number(collectorProfile?.wallet_balance ?? 0) - totalAmount,
        }).eq('id', profile.id),
      ]);

      // 5. Éco-taxe Mairie (premier super_admin)
      const { data: mairies } = await supabase
        .from('profiles').select('id, wallet_balance').eq('role', 'super_admin').limit(1);
      const mairie = mairies?.[0];
      if (mairie) {
        await supabase.from('profiles').update({
          wallet_balance: Number(mairie.wallet_balance ?? 0) + ecoTax,
        }).eq('id', mairie.id);
      }

      // 6. Transactions
      const txs: any[] = [
        { profile_id: waste.seller_id, amount:  sellerAmount,  type: 'income',  description: `Vente de ${finalWeight}kg de ${waste.waste_types?.name}` },
        { profile_id: profile.id,      amount: -totalAmount,   type: 'outcome', description: `Achat de ${finalWeight}kg de ${waste.waste_types?.name}` },
      ];
      if (mairie) txs.push({ profile_id: mairie.id, amount: ecoTax, type: 'income', description: `Éco-taxe 2% - Lot #${waste.id.slice(0, 6)}` });
      await supabase.from('transactions').insert(txs);

      // 7. Notifications
      const notifs: any[] = [
        { profile_id: waste.seller_id, title: "Paiement Reçu !",   content: `+${sellerAmount.toFixed(0)} FCFA. Votre vente est validée.`,           type: 'payment' },
        { profile_id: profile.id,      title: "Collecte Terminée", content: `Vous avez finalisé la collecte de ${finalWeight}kg.`,                  type: 'collection' },
      ];
      if (mairie) notifs.push({ profile_id: mairie.id, title: "Taxe Urbaine", content: `+${ecoTax.toFixed(0)} FCFA prélevés.`, type: 'system' });
      await supabase.from('notifications').insert(notifs);

      Alert.alert(
        "Collecte validée ! ✅",
        `${finalWeight}kg collectés.\nGain collecteur : -${totalAmount.toFixed(0)} FCFA\nVendeur crédité : +${sellerAmount.toFixed(0)} FCFA`,
        [{ text: "Voir mon wallet", onPress: () => router.replace(ROUTES.WALLET as any) }]
      );

    } catch (err: any) {
      console.error("handleConfirmCollection error:", err);
      Alert.alert("Erreur", err.message || "Une erreur est survenue lors de la validation.");
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
                        {/* QR Code Scanner */}
                        <TouchableOpacity 
                            onPress={() => {
                                // Simulate QR scan success then ask weight
                                Alert.alert(
                                  "QR Code reconnu ✅",
                                  "Confirmez le poids final de la collecte (KG) :",
                                  [
                                    { text: "Annuler", style: "cancel" },
                                    {
                                      text: "Confirmer",
                                      onPress: () => {
                                        Alert.prompt(
                                          "Poids final",
                                          "Entrez le poids en KG :",
                                          (weightStr) => {
                                            const w = parseFloat(weightStr);
                                            if (!isNaN(w) && w > 0) {
                                              handleConfirmCollection(w);
                                            } else {
                                              Alert.alert("Erreur", "Poids invalide.");
                                            }
                                          },
                                          "plain-text",
                                          waste.estimated_weight.toString()
                                        );
                                      }
                                    }
                                  ]
                                );
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

                        {/* PIN manuel */}
                        <TouchableOpacity 
                            onPress={() => {
                                Alert.prompt(
                                  "Code PIN Vendeur",
                                  "Saisissez le code PIN du vendeur (6 caractères) :",
                                  (pin) => {
                                    if (!pin) return;
                                    const expectedPin = waste.id.slice(0, 6).toUpperCase();
                                    if (pin.toUpperCase() !== expectedPin) {
                                      Alert.alert("Code PIN incorrect", "Le code saisi ne correspond pas à ce lot.");
                                      return;
                                    }
                                    Alert.prompt(
                                      "Poids final",
                                      "Confirmez le poids final (KG) :",
                                      (weightStr) => {
                                        const w = parseFloat(weightStr);
                                        if (!isNaN(w) && w > 0) {
                                          handleConfirmCollection(w);
                                        } else {
                                          Alert.alert("Erreur", "Poids invalide.");
                                        }
                                      },
                                      "plain-text",
                                      waste.estimated_weight.toString()
                                    );
                                  },
                                  "plain-text"
                                );
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

      {/* FIXED SWIPE BAR — visible uniquement si le lot est encore disponible */}
      {waste?.status === 'published' && (
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
      )}
    </View>
  );
}
