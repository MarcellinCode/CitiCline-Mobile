import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Leaf, RefreshCw } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Waste } from '@/lib/types';

export default function WalletScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [transactions, setTransactions] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadTransactions();
  }, [profile]);

  const loadTransactions = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('wastes')
      .select('*, waste_types(*)')
      .or(`seller_id.eq.${user.id},collector_id.eq.${user.id}`)
      .eq('status', 'collected')
      .order('created_at', { ascending: false })
      .limit(10);

    setTransactions((data as Waste[]) || []);
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-8 pt-6 flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => router.push('/(tabs)/espace')} className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text className="text-sm font-black text-[#020617] uppercase tracking-widest">Portefeuille</Text>
        <TouchableOpacity onPress={loadTransactions} className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
          <RefreshCw size={18} color="#020617" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Solde Principal */}
        <View className="px-8 mb-12 items-center">
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center"
          >
            <View className="w-16 h-16 bg-[#2aa27510] rounded-full items-center justify-center mb-4">
              <WalletIcon size={32} color="#2aa275" />
            </View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Solde Disponible</Text>
            {profileLoading ? (
              <ActivityIndicator color="#2aa275" />
            ) : (
              <View className="flex-row items-baseline">
                <Text className="text-6xl font-black text-[#020617] italic tracking-tighter">
                  {profile?.wallet_balance?.toLocaleString('fr-FR') || '0'}
                </Text>
                <Text className="text-xl font-bold text-primary ml-2 uppercase italic">FCFA</Text>
              </View>
            )}

            {/* Eco-Points */}
            <View className="flex-row items-center mt-4 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <Leaf size={14} color="#2aa275" />
              <Text className="ml-2 text-[10px] font-black text-primary uppercase tracking-widest">
                {profile?.eco_points || 0} ECO-POINTS
              </Text>
            </View>
          </MotiView>

          {/* Actions */}
          <View className="flex-row gap-4 mt-10 w-full">
            <TouchableOpacity className="flex-1 bg-[#020617] py-5 rounded-[2rem] items-center justify-center shadow-xl shadow-slate-900/20">
              <Text className="text-white font-black uppercase tracking-widest text-[10px]">Retirer Fonds</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[2rem] items-center justify-center">
              <ArrowUpRight size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Historique des transactions */}
        <View className="bg-slate-50/50 rounded-t-[3rem] px-8 pt-10 pb-20 border-t border-slate-100">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Historique</Text>
            <TouchableOpacity>
              <Text className="text-[10px] font-black text-primary uppercase tracking-widest">Voir Tout</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#2aa275" />
            </View>
          ) : transactions.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                Aucune transaction
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {transactions.map((tx, i) => {
                const isIncome = !!tx.seller_id && tx.status === 'collected';
                const amount = (tx.final_weight || tx.estimated_weight) * (tx.waste_types?.price_per_kg || 0);
                return (
                  <MotiView
                    key={tx.id}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 100 * i }}
                    className="bg-white p-5 rounded-[2rem] flex-row items-center shadow-sm border border-slate-50"
                  >
                    <View className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center mr-4">
                      <ArrowDownLeft size={20} color={isIncome ? '#2aa275' : '#ef4444'} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-[#020617] uppercase tracking-wider mb-0.5">
                        {tx.waste_types?.name || 'Recyclage'}
                      </Text>
                      <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {tx.final_weight || tx.estimated_weight} kg · {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <Text className="text-sm font-black" style={{ color: isIncome ? '#2aa275' : '#ef4444' }}>
                      {isIncome ? '+' : '-'}{amount.toLocaleString('fr-FR')} FCFA
                    </Text>
                  </MotiView>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
