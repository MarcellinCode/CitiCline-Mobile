import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Package, CheckCircle2, Clock, XCircle, RefreshCw, History } from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Waste } from '@/lib/types';
import { MotiView } from 'moti';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Disponible', color: '#2aa275', bg: '#2aa27515' },
  reserved:  { label: 'Réservé',    color: '#f59e0b', bg: '#f59e0b15' },
  collected: { label: 'Collecté',   color: '#64748b', bg: '#64748b15' },
  cancelled: { label: 'Annulé',     color: '#ef4444', bg: '#ef444415' },
};

export default function MesDechetsScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadWastes();
  }, [profile]);

  const loadWastes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let query = supabase
      .from('wastes')
      .select('*, waste_types(*)')
      .order('created_at', { ascending: false });

    if (profile?.role === 'vendeur') {
      query = query.eq('seller_id', user.id);
    } else if (profile?.role === 'collecteur' || profile?.role === 'agent_collecteur') {
      query = query.eq('collector_id', user.id);
    }

    const { data } = await query;
    setWastes((data as Waste[]) || []);
    setLoading(false);
  };

  const title = profile?.role === 'vendeur' ? 'Mes Publications' : 'Mes Collectes';
  const emptyLabel = profile?.role === 'vendeur' 
    ? 'Vous n\'avez pas encore publié de déchets'
    : 'Vous n\'avez pas encore effectué de collecte';

  const isLoad = profileLoading || loading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-8 pt-6 flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => router.push('/(tabs)/espace')} className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text className="text-sm font-black text-[#020617] uppercase tracking-widest">{title}</Text>
        <TouchableOpacity onPress={loadWastes} className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
          <RefreshCw size={18} color="#020617" />
        </TouchableOpacity>
      </View>

      {isLoad ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2aa275" />
        </View>
      ) : wastes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
            <Package size={32} color="#cbd5e1" />
          </View>
          <Text className="text-slate-400 font-black uppercase tracking-widest text-xs text-center">{emptyLabel}</Text>
          {profile?.role === 'vendeur' && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/marketplace/publish')}
              className="mt-8 bg-primary px-8 py-4 rounded-2xl"
            >
              <Text className="text-white font-black uppercase tracking-widest text-[10px]">Publier un lot</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView className="flex-1 px-8 pb-32" showsVerticalScrollIndicator={false}>
          {/* Stats rapides */}
          <View className="flex-row gap-3 mb-8">
            <View className="flex-1 bg-slate-900 p-4 rounded-[1.5rem] items-center">
              <Text className="text-primary font-black text-[8px] uppercase tracking-widest mb-1">Total</Text>
              <Text className="text-white text-xl font-black italic">{wastes.length}</Text>
            </View>
            <View className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-[1.5rem] items-center">
              <Text className="text-slate-400 font-black text-[8px] uppercase tracking-widest mb-1">Actifs</Text>
              <Text className="text-[#020617] text-xl font-black italic">
                {wastes.filter(w => w.status === 'published' || w.status === 'reserved').length}
              </Text>
            </View>
            <View className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-[1.5rem] items-center">
              <Text className="text-primary font-black text-[8px] uppercase tracking-widest mb-1">Collectés</Text>
              <Text className="text-primary text-xl font-black italic">
                {wastes.filter(w => w.status === 'collected').length}
              </Text>
            </View>
          </View>

          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Historique</Text>

          <View className="space-y-4">
            {wastes.map((waste, i) => {
              const statusCfg = STATUS_CONFIG[waste.status];
              const wasteType = waste.waste_types;
              return (
                <MotiView
                  key={waste.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 50 * i }}
                >
                  <TouchableOpacity className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] flex-row items-center">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm mr-4">
                      <Text style={{ fontSize: 22 }}>{wasteType?.emoji || '♻️'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-[#020617] uppercase tracking-wider mb-1">
                        {wasteType?.name || 'Déchets recyclables'}
                      </Text>
                      <Text className="text-[9px] font-bold text-slate-400 uppercase">
                        {waste.estimated_weight} kg · {waste.location || 'Localisation non définie'}
                      </Text>
                    </View>
                    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusCfg.bg }}>
                      <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: statusCfg.color }}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>

          <View className="h-20" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
