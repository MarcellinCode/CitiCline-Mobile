import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Search, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  MoreVertical
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { MotiView } from 'moti';

interface Agent {
  id: string;
  full_name: string;
  phone: string;
  eco_points: number;
  wallet_balance: number;
  status?: 'active' | 'offline';
}

export default function AgentsManagement() {
  const router = useRouter();
  const { profile } = useProfile();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      if (!profile?.id) return;
      
      // Simulation pour l'instant ou requête réelle si organization_id existe
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent_collecteur'); // A affiner avec organization_id plus tard
      
      if (data) {
        setAgents(data as Agent[]);
      }
      setLoading(false);
    }

    fetchAgents();
  }, [profile]);

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ 
        headerShown: true,
        headerTitle: "NOS AGENTS",
        headerTitleStyle: { fontFamily: 'System', fontWeight: '900', letterSpacing: -0.5 },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="ml-4 p-2 bg-slate-50 rounded-xl">
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        ),
        headerShadowVisible: false
      }} />

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
            <Text className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-1">Effectif</Text>
            <Text className="text-2xl font-black text-indigo-950">{agents.length}</Text>
          </View>
          <View className="flex-1 bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
            <Text className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-1">Performance</Text>
            <Text className="text-2xl font-black text-emerald-950">+12%</Text>
          </View>
        </View>

        {/* Search & Actions */}
        <View className="flex-row items-center gap-3 mb-8">
          <View className="flex-1 flex-row items-center bg-slate-50 px-5 py-4 rounded-3xl border border-slate-100">
            <Search size={18} color="#94a3b8" />
            <Text className="ml-3 text-slate-400 font-bold text-xs uppercase tracking-tight">Chercher un agent...</Text>
          </View>
          <TouchableOpacity className="w-14 h-14 bg-slate-900 rounded-2xl items-center justify-center shadow-lg shadow-slate-900/20">
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Agents List */}
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Liste des Collaborateurs</Text>
        
        {loading ? (
          <ActivityIndicator color="#6366f1" className="mt-20" />
        ) : agents.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <User size={48} color="#f1f5f9" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-tight mt-4">Aucun agent trouvé</p>
          </View>
        ) : (
          <View className="space-y-4">
            {agents.map((agent, index) => (
              <MotiView
                key={agent.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 100 * index }}
                className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex-row items-center"
              >
                <View className="w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
                  <User size={24} color="#64748b" />
                </View>
                
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-black text-[#020617] text-sm uppercase">{agent.full_name}</Text>
                    <View className="w-2 h-2 rounded-full bg-emerald-500" />
                  </View>
                  <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{agent.phone}</Text>
                </View>

                <View className="items-end">
                   <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-tight mb-1">{agent.wallet_balance.toLocaleString()} $</Text>
                   <TouchableOpacity className="p-2 bg-slate-50 rounded-lg">
                      <MoreVertical size={16} color="#94a3b8" />
                   </TouchableOpacity>
                </View>
              </MotiView>
            ))}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
