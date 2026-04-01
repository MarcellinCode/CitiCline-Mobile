import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Leaf, Zap, BarChart3, TrendingUp, Globe, Award, Package } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

export default function ImpactRSEScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { profile } = useProfile();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalWeight: 0,
        co2Saved: 0,
        ecoPoints: 0,
        trees: 0
    });

    const fetchImpactData = async () => {
        if (!profile?.id) return;
        try {
            const { data, error } = await supabase
                .from('wastes')
                .select('final_weight, estimated_weight')
                .or(`seller_id.eq.${profile.id},collector_id.eq.${profile.id}`)
                .eq('status', 'collected');

            if (data) {
                const weight = data.reduce((acc, w) => acc + (Number(w.final_weight) || Number(w.estimated_weight) || 0), 0);
                setStats({
                    totalWeight: weight,
                    co2Saved: weight * 1.22,
                    ecoPoints: weight * 10,
                    trees: Math.floor(weight / 45) // Roughly 1 tree saved per 45kg of recycling impact
                });
            }
        } catch (error) {
            console.error('Error fetching impact data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchImpactData();
    }, [profile]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchImpactData();
    };

    const metrics = [
        { label: "CO2 Évité", value: `${stats.co2Saved.toFixed(1)}kg`, icon: Globe, color: "#2A9D8F" },
        { label: "Plastique", value: stats.totalWeight >= 1000 ? `${(stats.totalWeight/1000).toFixed(1)}t` : `${stats.totalWeight}kg`, icon: Package, color: "#E9C46A" },
        { label: "Points Eco", value: stats.ecoPoints >= 1000 ? `${(stats.ecoPoints/1000).toFixed(1)}k` : stats.ecoPoints.toString(), icon: Award, color: "#6366f1" },
        { label: "Arbres", value: stats.trees.toString(), icon: Leaf, color: "#22c55e" },
    ];

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ 
                headerShown: true,
                headerTitle: () => <HubText variant="label" className="text-zinc-900 italic tracking-[0.2em] mb-0">IMPACT RSE</HubText>,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: 'white' },
                headerLeft: () => (
                    <TouchableOpacity 
                        onPress={() => navigateSafe(router, ROUTES.ESPACE)}
                        className="ml-4 w-10 h-10 bg-zinc-50 rounded-xl items-center justify-center border border-zinc-100"
                    >
                        <ArrowLeft size={20} color="#020617" />
                    </TouchableOpacity>
                ),
            }} />

            <ScrollView 
                className="flex-1 px-8 pt-6" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2A9D8F" />
                }
            >
                <View className="mb-10">
                    <HubText variant="label" className="text-zinc-400 mb-2">BILAN ÉCOLOGIQUE</HubText>
                    <HubText variant="h1" className="text-zinc-900 uppercase italic leading-none tracking-tighter">VOTRE IMPACT</HubText>
                </View>

                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#2A9D8F" />
                    </View>
                ) : (
                    <View className="flex-row flex-wrap justify-between gap-y-6">
                        {metrics.map((m, i) => (
                            <HubCard key={i} className="w-[47%] p-6 border-0 bg-zinc-50 items-center">
                                <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm mb-4">
                                    <m.icon size={24} color={m.color} />
                                </View>
                                <HubText variant="label" className="text-zinc-400 text-[8px] mb-1">{m.label}</HubText>
                                <HubText variant="h2" className="text-zinc-900">{m.value}</HubText>
                            </HubCard>
                        ))}
                    </View>
                )}

                {/* Progress Card */}
                <View className="mt-10 mb-8 p-10 bg-zinc-900 rounded-[3rem] items-center">
                    <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-6">
                        <Globe size={40} color="#2A9D8F" />
                    </View>
                    <HubText variant="h2" className="text-white text-center mb-2 italic">Vision Globale</HubText>
                    <HubText variant="body" className="text-zinc-500 text-center text-xs px-4">
                        "Votre contribution a permis d'économiser l'équivalent de {((stats.totalWeight * 1.22) / 180).toFixed(1)} mois de consommation électrique pour un foyer moyen."
                    </HubText>
                    
                    <View className="w-full mt-10 h-2 bg-zinc-800 rounded-full">
                        <View 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.min((stats.totalWeight / 1000) * 100, 100)}%` }}
                        />
                    </View>
                    <View className="w-full mt-2 flex-row justify-between">
                        <HubText variant="caption" className="text-zinc-500">Objectif 1t Recyclage</HubText>
                        <HubText variant="caption" className="text-primary italic">{Math.min((stats.totalWeight / 1000) * 100, 100).toFixed(0)}% atteint</HubText>
                    </View>
                </View>

                <HubCard className="p-8 border-2 border-primary/20 bg-primary/5 rounded-[2.5rem] items-center">
                    <HubText variant="h3" className="text-zinc-900 mb-2">Partager mon impact</HubText>
                    <HubText variant="body" className="text-zinc-500 text-center text-xs mb-6 px-4">
                        Générez un certificat PDF de vos accomplissements écologiques.
                    </HubText>
                    <TouchableOpacity className="px-10 py-4 bg-primary rounded-full shadow-lg shadow-primary/20">
                        <HubText variant="label" className="text-white mb-0">Télécharger PDF</HubText>
                    </TouchableOpacity>
                </HubCard>

            </ScrollView>
        </View>
    );
}

