import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Target, MapPin, Clock, ShieldCheck, Box, RefreshCw } from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Waste } from '@/lib/types';
import { MotiView } from 'moti';

export default function MissionsScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [missions, setMissions] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadMissions();
  }, [profile]);

  const loadMissions = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Charger les wastes réservées assignées à cet agent/collecteur
    const { data } = await supabase
      .from('wastes')
      .select('*, waste_types(*), profiles!wastes_seller_id_fkey(*)')
      .eq('collector_id', user.id)
      .in('status', ['reserved', 'published'])
      .order('created_at', { ascending: true });

    setMissions((data as Waste[]) || []);
    setLoading(false);
  };

  // Guard : seuls les collecteurs/agents voient cet écran
  if (!profileLoading && profile?.role === 'vendeur') {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-10">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
          <ShieldCheck size={32} color="#cbd5e1" />
        </View>
        <Text className="text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
          Cet espace est réservé aux agents de collecte officiels.
        </Text>
      </SafeAreaView>
    );
  }

  const doneCount = missions.filter(m => m.status === 'collected').length;
  const remaining = missions.filter(m => m.status === 'reserved' || m.status === 'published').length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-8 pt-6 flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => router.push('/(tabs)/espace')} className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text className="text-sm font-black text-[#020617] uppercase tracking-widest">Ma Feuille de Route</Text>
        <TouchableOpacity onPress={loadMissions} className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
          <RefreshCw size={18} color="#020617" />
        </TouchableOpacity>
      </View>

      {(profileLoading || loading) ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2aa275" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-8 pb-32" showsVerticalScrollIndicator={false}>
          {/* Stats Summary */}
          <View className="flex-row gap-4 mb-10">
            <View className="flex-1 bg-slate-900 p-6 rounded-[2rem]">
              <Text className="text-primary font-black text-[9px] uppercase tracking-widest mb-1">Total</Text>
              <Text className="text-white text-2xl font-black italic tracking-tighter">
                {missions.length} <Text className="text-slate-400 text-sm not-italic">missions</Text>
              </Text>
            </View>
            <View className="flex-1 bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
              <Text className="text-slate-400 font-black text-[9px] uppercase tracking-widest mb-1">Restant</Text>
              <Text className="text-[#020617] text-2xl font-black italic tracking-tighter">{remaining}</Text>
            </View>
          </View>

          {missions.length === 0 ? (
            <View className="items-center py-20">
              <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                <Target size={32} color="#cbd5e1" />
              </View>
              <Text className="text-slate-400 font-black uppercase tracking-widest text-[10px] text-center">
                Aucune mission assignée pour le moment
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
                Missions Actives ({remaining})
              </Text>
              
              <View className="space-y-4 mb-10">
                {missions.map((mission, i) => (
                  <MotiView
                    key={mission.id}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 50 * i }}
                  >
                    <TouchableOpacity 
                      onPress={() => router.push({ 
                        pathname: '/(tabs)/missions/[id]', 
                        params: { 
                          id: mission.id, 
                          name: (mission.profiles as any)?.full_name || 'Client', 
                          type: mission.waste_types?.name || 'Recyclables', 
                          color: '#2aa275' 
                        } 
                      })}
                      className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                          <Text style={{ fontSize: 20 }}>{mission.waste_types?.emoji || '♻️'}</Text>
                        </View>
                        <View className="ml-4 flex-1">
                          <Text className="text-xs font-black text-[#020617] uppercase tracking-wider" numberOfLines={1}>
                            {(mission.profiles as any)?.full_name || 'Client'}
                          </Text>
                          <Text className="text-[8px] font-bold text-slate-400 uppercase" numberOfLines={1}>
                            {mission.waste_types?.name || 'Recyclables'} · {mission.estimated_weight} kg
                          </Text>
                          {mission.location ? (
                            <Text className="text-[8px] font-bold text-slate-300 uppercase mt-0.5" numberOfLines={1}>
                              📍 {mission.location}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View className="px-3 py-1 bg-primary/10 rounded-full ml-2">
                        <Text className="text-primary font-black text-[8px] uppercase">Scanner</Text>
                      </View>
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Action Bar */}
      <View className="absolute bottom-10 left-8 right-8 bg-[#020617] p-4 rounded-3xl flex-row items-center justify-between shadow-2xl">
        <View className="flex-row items-center ml-2">
          <View className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
          <Text className="text-white font-black text-[9px] uppercase tracking-widest">GPS Actif</Text>
        </View>
        <TouchableOpacity 
          onPress={loadMissions}
          className="bg-primary px-8 py-3 rounded-2xl"
        >
          <Text className="text-white font-black text-[10px] uppercase tracking-widest">Actualiser</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
