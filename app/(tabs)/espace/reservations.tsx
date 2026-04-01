import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, ChevronRight, Package, Loader2 } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReservationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { profile } = useProfile();
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReservations = async () => {
        if (!profile?.id) return;
        
        try {
            const { data, error } = await supabase
                .from('wastes')
                .select(`
                    id, 
                    status, 
                    estimated_weight, 
                    location, 
                    created_at,
                    waste_types(name, emoji)
                `)
                .eq('status', 'reserved')
                .or(`seller_id.eq.${profile.id},collector_id.eq.${profile.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReservations(data || []);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [profile]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReservations();
    };

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ 
                headerShown: true,
                headerTitle: () => <HubText variant="label" className="text-zinc-900 italic tracking-[0.2em] mb-0">RÉSERVATIONS</HubText>,
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
                    <HubText variant="label" className="text-zinc-400 mb-2">GESTION DES LOTS</HubText>
                    <HubText variant="h1" className="text-zinc-900 uppercase italic leading-none">VOS RÉSERVATIONS</HubText>
                </View>

                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#2A9D8F" />
                        <HubText variant="caption" className="mt-4 text-zinc-400 uppercase tracking-widest">Chargement...</HubText>
                    </View>
                ) : reservations.length > 0 ? (
                    reservations.map((res) => (
                        <HubCard key={res.id} className="p-6 mb-4 border-0 bg-zinc-50 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm">
                                    <HubText className="text-xl">{res.waste_types?.emoji || '🗑️'}</HubText>
                                </View>
                                <View>
                                    <HubText variant="h3" className="text-zinc-900">{res.waste_types?.name}</HubText>
                                    <View className="flex-row items-center gap-2">
                                        <Clock size={12} color="#94a3b8" />
                                        <HubText variant="caption" className="text-zinc-400">
                                            {format(new Date(res.created_at), 'dd MMMM', { locale: fr })} • {res.estimated_weight}kg
                                        </HubText>
                                    </View>
                                </View>
                            </View>
                            <ChevronRight size={18} color="#94a3b8" />
                        </HubCard>
                    ))
                ) : (
                    <View className="py-20 items-center justify-center bg-zinc-50 rounded-[2.5rem] border border-dashed border-zinc-200">
                        <Package size={48} color="#cbd5e1" />
                        <HubText variant="h3" className="mt-4 text-zinc-400 uppercase italic">Aucune réservation</HubText>
                        <HubText variant="body" className="text-zinc-400 text-center px-8 mt-2">Réservez des lots sur le marché pour les voir apparaître ici.</HubText>
                    </View>
                )}

                <View className="mt-8 p-8 bg-zinc-900 rounded-[2.5rem] overflow-hidden">
                    <HubText variant="label" className="text-primary mb-2">INFO SYSTÈME</HubText>
                    <HubText variant="body" className="text-white italic leading-5">
                        "Les réservations de plus de 48h non confirmées seront automatiquement remises sur la Marketplace."
                    </HubText>
                    <View className="absolute -bottom-6 -right-6 opacity-10">
                        <Calendar size={100} color="white" />
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
