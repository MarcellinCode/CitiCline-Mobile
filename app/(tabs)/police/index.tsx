import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { ShieldAlert, MapPin, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';

export default function PoliceDashboard() {
  const router = useRouter();
  const { profile } = useProfile();
  const [infractions, setInfractions] = useState<any[]>([]);
  const [stats, setStats] = useState({ open: 0, critical: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('environmental_infractions')
        .select('*, zones:zone_id(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInfractions(data || []);

      // Calculate stats
      const open = data?.filter(i => i.status === 'open').length || 0;
      const critical = data?.filter(i => i.severity === 'critical' && i.status === 'open').length || 0;
      const resolved = data?.filter(i => i.status === 'resolved').length || 0;
      setStats({ open, critical, resolved });
    } catch (err) {
      console.error("Error fetching police data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#ef4444" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Secteur De Patrouille</Text>
            <Text className="text-2xl font-black italic uppercase text-zinc-900 tracking-tighter">
              {profile?.city || 'Zone Alpha-1'}
            </Text>
          </View>
          <View className="w-12 h-12 bg-red-50 rounded-2xl items-center justify-center border border-red-100">
            <ShieldAlert size={24} color="#dc2626" />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-4 mb-10">
          <View className="flex-1 bg-zinc-900 p-5 rounded-[2.5rem] shadow-xl shadow-zinc-400/20">
            <Text className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">Alertes Actives</Text>
            <Text className="text-3xl font-black italic text-white">{stats.open}</Text>
          </View>
          <View className="flex-1 bg-zinc-50 p-5 rounded-[2.5rem] border border-zinc-100">
             <Text className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Points Critiques</Text>
             <Text className="text-3xl font-black italic text-zinc-900">{stats.critical}</Text>
          </View>
        </View>

        {/* Radar View Teaser */}
        <TouchableOpacity 
          onPress={() => router.push(ROUTES.MAP as any)}
          className="w-full h-48 bg-emerald-50 rounded-[3rem] border border-emerald-100 mb-10 overflow-hidden relative items-center justify-center"
        >
          <View className="absolute w-[300px] h-[300px] border border-emerald-500/10 rounded-full animate-ping" />
          <MapPin size={32} color="#059669" />
          <Text className="mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Ouvrir le Radar Tactique</Text>
        </TouchableOpacity>

        {/* Recent Incidents Feed */}
        <View className="mb-20">
          <View className="flex-row justify-between items-end mb-6 px-2">
            <Text className="text-sm font-black italic uppercase text-zinc-900">Incidents à Proximité</Text>
            <TouchableOpacity onPress={() => router.push(ROUTES.POLICE_HISTORY as any)}>
              <Text className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Voir tout</Text>
            </TouchableOpacity>
          </View>

          {infractions.length === 0 ? (
            <View className="py-12 bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200 items-center justify-center">
               <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic">RAS : Zone Calme</Text>
            </View>
          ) : (
            <View className="gap-4">
              {infractions.slice(0, 5).map((inf) => (
                <TouchableOpacity 
                  key={inf.id}
                  className="bg-white p-5 rounded-[2.5rem] border border-zinc-100 flex-row items-center gap-4 shadow-sm"
                >
                  <View className="w-12 h-12 bg-zinc-50 rounded-2xl items-center justify-center">
                    <AlertTriangle size={20} color={inf.severity === 'critical' ? '#dc2626' : '#f59e0b'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-black uppercase text-zinc-900 tracking-tight">{inf.type}</Text>
                    <Text className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.1em]">{inf.zones?.name || "Non localisé"}</Text>
                  </View>
                  <View className={cn(
                    "px-3 py-1 rounded-full",
                    inf.status === 'open' ? "bg-red-50" : "bg-emerald-50"
                  )}>
                    <Text className={cn(
                      "text-[7px] font-black uppercase",
                      inf.status === 'open' ? "text-red-600" : "text-emerald-600"
                    )}>{inf.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
