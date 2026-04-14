import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Target, ShieldCheck, RefreshCw, ArrowUpRight, MapPin, Scale, Power, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Waste } from '@/lib/types';
import { ROUTES } from '@/constants/routes';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { HubButton } from '@/components/ui/HubButton';
import { cn } from '@/lib/utils';
import { useTracking } from '@/hooks/useTracking';

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { isTracking, toggleTracking } = useTracking();
  const [missions, setMissions] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);

  const handleToggleTracking = () => {
    if (!isTracking) {
      Alert.alert(
        "Démarrer le Tracking ?",
        "Votre position sera partagée en direct avec les services de la Mairie jusqu'à la fin de votre service.",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Démarrer", 
            style: "default",
            onPress: () => toggleTracking() 
          }
        ]
      );
    } else {
      toggleTracking();
    }
  };

  useEffect(() => {
    if (!profile) return;
    loadMissions();
  }, [profile]);

  const loadMissions = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      
      // 1. Récupérer les missions (Lots réservés OU Collectes d'abonnements assignées)
      const { data: wastes, error: wError } = await supabase
        .from('wastes')
        .select('*, waste_types(*)')
        .eq('assigned_agent_id', profile.id) // Utilisation de la nouvelle colonne d'assignation
        .in('status', ['reserved', 'published', 'assigned'])
        .order('created_at', { ascending: true });

      if (wError) throw wError;

      if (!wastes || wastes.length === 0) {
        setMissions([]);
        return;
      }

      // 2. Récupérer les profils des vendeurs pour ces lots
      const sellerIds = [...new Set(wastes.map(w => w.seller_id).filter(Boolean))];
      const { data: sellers, error: sError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', sellerIds);

      if (sError) throw sError;

      // 3. Fusionner les données
      const enrichedMissions = wastes.map(waste => ({
        ...waste,
        profiles: sellers?.find(s => s.id === waste.seller_id) || null
      }));

      setMissions(enrichedMissions as Waste[]);
    } catch (err: any) {
      console.error("loadMissions error:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profileLoading && profile?.role !== 'agent_collecteur') {
    return (
      <View className="flex-1 bg-white items-center justify-center px-10">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="w-20 h-20 bg-zinc-50 rounded-full items-center justify-center mb-8 border border-zinc-100">
          <ShieldCheck size={32} color="#94a3b8" />
        </View>
        <HubText variant="h2" className="text-center mb-2">Accès Limité</HubText>
        <HubText variant="body" className="text-center text-zinc-400">
          Cet espace est exclusivement réservé aux agents de collecte officiels de CITICLINE (Salubrité). Les acheteurs indépendants gèrent leurs activités via la Marketplace.
        </HubText>
        <HubButton 
          className="mt-8"
          onPress={() => router.push(ROUTES.ESPACE as any)}
        >
          Retour au Hub
        </HubButton>
      </View>
    );
  }

  const remaining = missions.filter(m => m.status === 'reserved' || m.status === 'published').length;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View 
        className="px-8 flex-row items-center justify-between mb-8"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }}
      >
        <TouchableOpacity 
            onPress={() => router.push(ROUTES.ESPACE as any)} 
            className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-xl shadow-zinc-200/50 border border-zinc-50"
        >
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <HubText variant="label" className="text-zinc-900 italic">Ma Feuille de Route</HubText>
        <TouchableOpacity 
            onPress={loadMissions} 
            className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-xl shadow-zinc-200/50 border border-zinc-50"
        >
          <RefreshCw size={18} color="#020617" />
        </TouchableOpacity>
      </View>

      {(profileLoading || loading) ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2A9D8F" size="large" />
        </View>
      ) : (
        <ScrollView 
          className="px-8" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
        >
          {/* Stats Summary */}
          <View className="flex-row gap-4 mb-10">
            <View className="flex-1 bg-zinc-900 p-6 rounded-[2.5rem] justify-between h-32">
              <HubText variant="label" className="text-primary italic">TOTAL</HubText>
              <HubText variant="h1" className="text-white mb-0 leading-tight">
                {missions.length} <HubText className="text-zinc-500 text-sm normal-case italic">missions</HubText>
              </HubText>
            </View>
            <View className="flex-1 bg-zinc-50 border border-zinc-100 p-6 rounded-[2.5rem] justify-between h-32">
              <HubText variant="label" className="text-zinc-400 italic">RESTANT</HubText>
              <HubText variant="h1" className="text-zinc-900 mb-0 leading-tight">{remaining}</HubText>
            </View>
          </View>

          {missions.length === 0 ? (
            <View className="items-center py-20">
              <View className="w-20 h-20 bg-zinc-50 rounded-full items-center justify-center mb-6">
                <Target size={32} color="#cbd5e1" />
              </View>
              <HubText variant="label" className="text-zinc-300 text-center uppercase tracking-[0.3em]">
                Aucune mission active
              </HubText>
            </View>
          ) : (
            <>
              <HubText variant="label" className="mb-6 ml-1">Missions Actives</HubText>
              
              <View className="gap-6">
                {missions.map((mission, i) => (
                  <View key={mission.id}>
                    <TouchableOpacity 
                      activeOpacity={0.9}
                      onPress={() => router.push(ROUTES.MISSION_DETAILS(mission.id) as any)}
                    >
                        <HubCard className={cn(
                            "p-6 border-2",
                            mission.is_urgent ? "border-red-500 bg-red-50/10 shadow-lg shadow-red-200" : "border-zinc-50"
                        )}>
                            {mission.is_urgent && (
                                <View className="flex-row items-center gap-2 mb-3 bg-red-500 self-start px-3 py-1 rounded-full">
                                    <AlertCircle size={10} color="white" strokeWidth={3} />
                                    <HubText variant="label" className="text-white text-[8px] mb-0 tracking-widest font-black">RÉQUISITION MAIRIE — PRIORITAIRE</HubText>
                                </View>
                            )}
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-12 h-12 bg-zinc-50 rounded-2xl items-center justify-center">
                                        <HubText className="text-2xl">{mission.waste_types?.emoji || '♻️'}</HubText>
                                    </View>
                                    <View>
                                        <HubText variant="h3" className="text-zinc-900" numberOfLines={1}>
                                            {(mission.profiles as any)?.full_name || 'Client'}
                                        </HubText>
                                        <HubText variant="caption" className="text-primary font-black">
                                            {mission.waste_types?.name || 'Recyclables'}
                                        </HubText>
                                    </View>
                                </View>
                                <View className={cn(
                                    "px-3 py-1.5 rounded-full",
                                    mission.mission_type === 'subscription_pickup' ? "bg-primary/10" : "bg-emerald-50"
                                )}>
                                    <HubText 
                                        variant="label" 
                                        className={cn(
                                            "text-[8px] tracking-[0.1em]",
                                            mission.mission_type === 'subscription_pickup' ? "text-primary" : "text-emerald-600"
                                        )}
                                    >
                                        {mission.mission_type === 'subscription_pickup' ? 'ABONNEMENT' : 'MARKETPLACE'}
                                    </HubText>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between border-t border-zinc-50 pt-4">
                                <View className="flex-row items-center gap-4">
                                    <View className="flex-row items-center gap-1">
                                        <Scale size={14} color="#94a3b8" />
                                        <HubText variant="h3" className="text-[10px] text-zinc-600 italic">{mission.estimated_weight} KG</HubText>
                                    </View>
                                    {mission.location && (
                                        <View className="flex-row items-center gap-1">
                                            <MapPin size={14} color="#94a3b8" />
                                            <HubText variant="caption" className="text-[9px] uppercase tracking-tighter" numberOfLines={1}>
                                                {mission.location.split(',')[0]}
                                            </HubText>
                                        </View>
                                    )}
                                </View>
                                <ArrowUpRight size={16} color="#2A9D8F" />
                            </View>
                        </HubCard>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Dynamic Action Bar - Tracking Controller */}
      <View 
        className={cn(
            "absolute left-8 right-8 p-6 rounded-[2.5rem] flex-row items-center justify-between shadow-2xl transition-all duration-500",
            isTracking ? "bg-emerald-500 shadow-emerald-500/40" : "bg-zinc-900 shadow-zinc-900/50"
        )}
        style={{ bottom: insets.bottom + 110 }}
      >
        <View className="flex-row items-center gap-3 ml-2">
          {!isTracking ? (
            <>
                 <View className="w-2 h-2 bg-zinc-500 rounded-full" />
                 <HubText variant="label" className="text-zinc-400 italic tracking-widest text-[10px]">TRACKING INACTIF</HubText>
            </>
          ) : (
            <>
                <View className="w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50" />
                <HubText variant="label" className="text-white italic tracking-widest text-[10px]">LIVE EMISSION</HubText>
            </>
          )}
        </View>
        
        <TouchableOpacity 
            onPress={handleToggleTracking}
            className={cn(
                "px-8 h-10 rounded-2xl items-center justify-center flex-row gap-2 border",
                isTracking ? "bg-white border-white" : "bg-primary border-primary"
            )}
        >
            <Power size={14} color={isTracking ? "#10b981" : "white"} strokeWidth={3} />
            <HubText 
                variant="label" 
                className={cn(
                    "mb-0 text-[10px] tracking-widest",
                    isTracking ? "text-emerald-500" : "text-white"
                )}
            >
                {isTracking ? "ARRÊTER" : "DÉMARRER"}
            </HubText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
