import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { History, ShieldAlert, CheckCircle2, Gavel, Clock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'expo-router';

export default function PoliceHistory() {
  const router = useRouter();
  const { profile } = useProfile();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('environmental_infractions')
        .select('*, zones:zone_id(name)')
        .eq('reported_by', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching report history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [profile?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#dc2626" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />}
      >
         {/* Navigation */}
         <TouchableOpacity onPress={() => router.back()} className="mb-6">
           <Text className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">← Menu Patrouille</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">Historique</Text>
        <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10">Suivi des Constats de Terrain</Text>

        {reports.length === 0 ? (
          <View className="py-20 items-center justify-center bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
             <History size={48} color="#d4d4d8" />
             <Text className="mt-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Aucun rapport émis</Text>
          </View>
        ) : (
          <View className="gap-6 mb-20">
            {reports.map((report) => (
              <View 
                key={report.id}
                className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                      {new Date(report.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                    <Text className="text-lg font-black italic uppercase text-zinc-900 tracking-tight leading-none">{report.type}</Text>
                  </View>
                  <View className={cn(
                    "px-4 py-2 rounded-2xl",
                    report.status === 'open' ? "bg-amber-50" : report.status === 'sanctioned' ? "bg-red-50" : "bg-emerald-50"
                  )}>
                    <Text className={cn(
                      "text-[8px] font-black uppercase tracking-widest",
                      report.status === 'open' ? "text-amber-600" : report.status === 'sanctioned' ? "text-red-600" : "text-emerald-600"
                    )}>{report.status}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2 mb-4">
                  <ShieldAlert size={12} color="#94a3b8" />
                  <Text className="text-[9px] font-bold text-zinc-500 uppercase">{report.zones?.name || "Zone non spécifiée"}</Text>
                </View>

                {report.status === 'sanctioned' && (
                  <View className="mt-4 p-4 bg-red-600 rounded-2xl flex-row items-center gap-3">
                     <Gavel size={14} color="white" />
                     <Text className="text-[9px] font-black text-white uppercase tracking-widest">Sanction Administrative Appliquée</Text>
                  </View>
                )}

                {report.status === 'resolved' && (
                  <View className="mt-4 p-4 bg-emerald-500 rounded-2xl flex-row items-center gap-3">
                     <CheckCircle2 size={14} color="white" />
                     <Text className="text-[9px] font-black text-white uppercase tracking-widest">Incident Clos par la Mairie</Text>
                  </View>
                )}

                {report.status === 'open' && (
                  <View className="mt-4 p-4 bg-zinc-900 rounded-2xl flex-row items-center gap-3">
                     <Clock size={14} color="white" />
                     <Text className="text-[9px] font-black text-white uppercase tracking-widest">En cours d'examen au City OS</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
