import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Crown, CheckCircle2, Globe, AlertCircle, Calendar } from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { MotiView } from 'moti';

type Subscription = {
  id: string;
  zone_name: string;
  company_name: string;
  pickup_days: string[];
  pickup_time: string;
  status: string;
  tier: string;
};

export default function AbonnementsScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadSubscription();
  }, [profile]);

  const loadSubscription = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Chercher l'abonnement actif du citoyen
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    setSubscription(data as Subscription | null);
    setLoading(false);
  };

  const title = profile?.role === 'vendeur' ? 'Service de Collecte' : 'Abonnement';
  const isLoad = profileLoading || loading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-8 pt-6 flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => router.push('/(tabs)/espace')} className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text className="text-sm font-black text-[#020617] uppercase tracking-widest">{title}</Text>
        <View className="w-12" />
      </View>

      {isLoad ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2aa275" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-8 pb-20">
          {profile?.role === 'vendeur' && subscription ? (
            /* ── ABONNÉ ACTIF ── */
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <View className="bg-primary/10 border border-primary/20 p-8 rounded-[3rem] items-center mb-10">
                <View className="w-20 h-20 bg-white rounded-[2rem] items-center justify-center mb-4 shadow-sm">
                  <Crown size={40} color="#2aa275" />
                </View>
                <Text className="text-2xl font-black text-[#020617] uppercase italic tracking-tighter mb-1">
                  {subscription.zone_name || 'Zone Assignée'}
                </Text>
                <Text className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">
                  Géré par : {subscription.company_name || 'Partenaire CITICLINE'}
                </Text>
                <View className="px-4 py-2 bg-primary rounded-full">
                  <Text className="text-white font-black text-[9px] uppercase tracking-widest">Service Actif</Text>
                </View>
              </View>

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Jours de Passage</Text>
              <View className="space-y-4 mb-10">
                {(subscription.pickup_days || ['Lundi', 'Mercredi', 'Vendredi']).map((day: string, i: number) => (
                  <View key={i} className="flex-row items-center justify-between bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <View className="flex-row items-center">
                      <Calendar size={18} color="#2aa275" />
                      <Text className="ml-3 text-sm font-black text-[#020617] uppercase tracking-widest">{day}</Text>
                    </View>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase">
                      {subscription.pickup_time || '08h - 10h'}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity className="w-full bg-[#ef4444] h-16 rounded-2xl items-center justify-center shadow-lg shadow-red-500/20">
                <AlertCircle size={16} color="white" />
                <Text className="text-white font-black uppercase tracking-widest text-xs mt-1">Signaler un Problème</Text>
              </TouchableOpacity>
            </MotiView>

          ) : profile?.role === 'vendeur' && !subscription ? (
            /* ── PAS D'ABONNEMENT ── */
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <View className="bg-slate-50 border border-slate-100 p-8 rounded-[3rem] items-center mb-10">
                <View className="w-20 h-20 bg-white rounded-[2rem] items-center justify-center mb-4 shadow-sm">
                  <Crown size={40} color="#cbd5e1" />
                </View>
                <Text className="text-2xl font-black text-[#020617] uppercase italic tracking-tighter mb-2">Pas d'Abonnement</Text>
                <Text className="text-slate-400 font-medium text-center text-sm">
                  Souscrivez à un service de collecte pour vos déchets ménagers.
                </Text>
              </View>

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Avantages</Text>
              <View className="space-y-4 mb-10">
                {[
                  'Collecte régulière planifiée',
                  'Notification avant chaque passage',
                  'Historique de vos collectes',
                  'Support prioritaire 24/7',
                ].map((item, i) => (
                  <View key={i} className="flex-row items-center py-2">
                    <CheckCircle2 size={18} color="#2aa275" />
                    <Text className="ml-3 text-sm font-bold text-slate-600">{item}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity className="w-full bg-[#020617] h-16 rounded-2xl items-center justify-center shadow-lg">
                <Text className="text-white font-black uppercase tracking-widest text-xs">Contacter un Collecteur</Text>
              </TouchableOpacity>
            </MotiView>

          ) : (
            /* ── COLLECTEUR / ENTREPRISE / AUTRES ── */
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <View className="bg-indigo-50 border border-indigo-100 p-8 rounded-[3rem] items-center mb-8">
                <View className="w-20 h-20 bg-white rounded-[2rem] items-center justify-center mb-4 shadow-sm">
                  <Crown size={40} color="#6366f1" />
                </View>
                <Text className="text-2xl font-black text-[#020617] uppercase italic tracking-tighter mb-2">
                  {profile?.subscription_tier === 'pro' ? 'Plan Pro' : 
                   profile?.subscription_tier === 'business' ? 'Plan Business' : 'Plan Starter'}
                </Text>
                <View className="px-4 py-2 bg-indigo-600 rounded-full">
                  <Text className="text-white font-black text-[9px] uppercase tracking-widest">Actif</Text>
                </View>
              </View>

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Avantages Premium</Text>
              <View className="space-y-3 mb-10">
                {[
                  'Collectes prioritaires',
                  'Frais de service réduits',
                  'Support 24/7 dédié',
                  'Badge Partenaire Vérifié',
                  'Tableau de bord analytique',
                ].map((item, i) => (
                  <View key={i} className="flex-row items-center py-2">
                    <CheckCircle2 size={18} color="#6366f1" />
                    <Text className="ml-3 text-sm font-bold text-slate-600">{item}</Text>
                  </View>
                ))}
              </View>
            </MotiView>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
