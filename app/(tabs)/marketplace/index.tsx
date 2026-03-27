import React, { useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, Image as RNImage, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useWastes } from '@/hooks/useWastes';
import { useProfile } from '@/hooks/useProfile';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { WasteCard } from '@/components/WasteCard';
import { FeaturedWasteCard } from '@/components/FeaturedWasteCard';
import { Waste } from '@/lib/types';
import { Search, Leaf, Zap, Box, ShoppingBag, Bell } from 'lucide-react-native';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', name: 'Tous', icon: Leaf },
  { id: 1, name: 'Plastique', icon: Box },
  { id: 2, name: 'Métal', icon: Zap },
  { id: 3, name: 'Papier', icon: ShoppingBag },
];

export default function Marketplace() {
  const insets = useSafeAreaInsets();
  const { wastes, loading: wastesLoading, refreshing, onRefresh } = useWastes();
  const { profile, loading: profileLoading } = useProfile();
  const unreadCount = useUnreadNotifications();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredWastes = useMemo(() => {
    let list = wastes;
    return list.filter(w => {
      const matchSearch = (w.waste_types?.name || "").toLowerCase().includes(search.toLowerCase()) || 
                          (w.location || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'all' || w.type_id.toString() === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [wastes, search, activeCategory]);

  const loading = wastesLoading || profileLoading;

  const featuredWastes = useMemo(() => {
    return wastes.slice(0, 3);
  }, [wastes]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#2A9D8F" size="large" />
      </View>
    );
  }

  const renderHeader = () => (
    <View className="pb-6 px-6">
      <View className="mb-10 px-8 flex-row items-center justify-between mb-8">
        <View>
          <HubText variant="label" className="text-zinc-400">Bonjour,</HubText>
          <HubText variant="h2" className="text-zinc-900 leading-tight">
            {profile?.full_name?.split(' ')[0] || 'Eco-Guerrier'}
          </HubText>
        </View>
        <TouchableOpacity 
            onPress={() => router.push('/notifications' as any)}
            className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-xl shadow-zinc-200/50 border border-zinc-50"
        >
          <Bell size={20} color="#0f172a" strokeWidth={2.5} />
          {unreadCount > 0 && <View className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
        </TouchableOpacity>
      </View>

      {/* Bento Widget: Impact Ecolo */}
      <View>
          <HubCard className="bg-primary border-0 p-8 mb-10 overflow-hidden">
             <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-6">
                       <Leaf size={20} color="white" />
                    </View>
                    <HubText variant="label" className="text-white/80 mb-1">Impact ÉCOLOGIQUE</HubText>
                    <HubText variant="h2" className="text-white">12.5 <HubText className="text-white/70 text-base italic normal-case">kg recyclés</HubText></HubText>
                </View>
                <View className="bg-white/10 rounded-3xl p-4 items-center justify-center">
                    <Zap size={24} color="#E9C46A" />
                    <HubText variant="label" className="text-white mt-1 text-[8px]">Niv. 2</HubText>
                </View>
             </View>
             
             {/* Background decoration */}
             <View className="absolute -bottom-10 -right-10 opacity-10">
                <Leaf size={160} color="white" />
             </View>
          </HubCard>
      </View>

      <HubText variant="h3" className="mb-6 ml-1">Explorer le réseau</HubText>

      <View className="bg-white border-2 border-zinc-50 rounded-[2rem] flex-row items-center px-6 py-4 mb-8 shadow-xl shadow-zinc-200/30">
        <Search size={22} color="#94a3b8" />
        <TextInput 
          placeholder="Rechercher des produits..."
          placeholderTextColor="#94a3b8"
          className="flex-1 ml-4 text-base font-semibold text-zinc-900"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10">
        {CATEGORIES.map((cat, idx) => (
          <View key={cat.id.toString()}>
            <TouchableOpacity 
                onPress={() => setActiveCategory(cat.id.toString())}
                className={cn(
                  "flex-row items-center px-6 py-4 rounded-[1.5rem] mr-3 border-2 transition-all",
                  activeCategory === cat.id.toString() ? "bg-zinc-900 border-zinc-900 shadow-lg shadow-zinc-400/30" : "bg-white border-zinc-50"
                )}
            >
                <cat.icon size={16} color={activeCategory === cat.id.toString() ? '#2A9D8F' : '#94a3b8'} strokeWidth={3} />
                <HubText 
                    variant="label" 
                    className={cn(
                        "ml-3 mb-0 text-[9px]",
                        activeCategory === cat.id.toString() ? "text-white" : "text-zinc-500"
                    )}
                >
                    {cat.name}
                </HubText>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {featuredWastes.length > 0 && (
        <View className="mb-10">
            <View className="flex-row justify-between items-end mb-6 ml-1">
                <HubText variant="h3">
                    {profile?.role === 'vendeur' ? 'Opportunités' : 'Lots en Vedette'}
                </HubText>
                <HubText variant="label" className="text-primary italic">VOIR TOUT</HubText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
            {featuredWastes.map((item) => (
                <View key={`featured-${item.id}`} className="mr-6">
                    <FeaturedWasteCard waste={item} />
                </View>
            ))}
            </ScrollView>
        </View>
      )}

      <HubText variant="h3" className="mb-6 ml-1">
        {profile?.role === 'vendeur' ? 'Vos Publications' : 'Nouveaux Arrivages'}
      </HubText>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <FlatList
        data={filteredWastes}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }: { item: Waste }) => <WasteCard waste={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 24 }}
        contentContainerStyle={{ 
          paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0),
          paddingBottom: insets.bottom + 160 
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2A9D8F" />
        }
        ListEmptyComponent={() => (
          <View className="py-20 items-center">
            <HubText variant="label" className="text-zinc-300">
              Aucun lot correspondant trouvé
            </HubText>
          </View>
        )}
      />
    </View>
  );
}
