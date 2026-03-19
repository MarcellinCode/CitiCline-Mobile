import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useWastes } from '@/hooks/useWastes';
import { useProfile } from '@/hooks/useProfile';
import { WasteCard } from '@/components/WasteCard';
import { FeaturedWasteCard } from '@/components/FeaturedWasteCard';
import { Waste } from '@/lib/types';
import { Search, Filter, Leaf, Zap, Box, ShoppingBag, Bell } from 'lucide-react-native';

const CATEGORIES = [
  { id: 'all', name: 'Tous les Matériaux', icon: Leaf },
  { id: 1, name: 'Plastique', icon: Box },
  { id: 2, name: 'Métal', icon: Zap },
  { id: 3, name: 'Papier', icon: ShoppingBag },
];

export default function Marketplace() {
  const { wastes, loading: wastesLoading, refreshing, onRefresh } = useWastes();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredWastes = useMemo(() => {
    let list = wastes;
    
    // Role-based filtering
    if (profile?.role === 'vendeur') {
      // For Vendeur, we might show their own or a specialized feed
      // For now, let's keep the full feed but add a "Your listings" filter potentially in the future
      // Or simply filter based on a new logic
    }

    return list.filter(w => {
      const matchSearch = w.waste_types?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          w.location.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'all' || w.type_id.toString() === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [wastes, search, activeCategory, profile]);

  const loading = wastesLoading || profileLoading;

  const featuredWastes = useMemo(() => {
    return wastes.slice(0, 3); // Mocking features as the first 3 items
  }, [wastes]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#2aa275" />
      </View>
    );
  }

  const renderHeader = () => (
    <View className="pt-16 pb-6 px-6">
      <View className="flex-row items-center justify-between mb-8">
        <View className="w-10" />
        <Text className="text-2xl font-black text-primary uppercase italic tracking-tighter">CITIC<Text className="text-[#020617]">LINE</Text></Text>
        <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
          <Bell size={20} color="#020617" />
          <View className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

      <View className="bg-slate-50 border border-slate-100 rounded-2xl flex-row items-center px-4 py-3 mb-6 shadow-sm">
        <Search size={20} color="#94a3b8" />
        <TextInput 
          placeholder="Rechercher des produits recyclables..."
          placeholderTextColor="#94a3b8"
          className="flex-1 ml-3 text-sm font-semibold text-[#020617]"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat.id}
            onPress={() => setActiveCategory(cat.id.toString())}
            className={`flex-row items-center px-5 py-2.5 rounded-full mr-3 border ${
              activeCategory === cat.id.toString() 
                ? 'bg-primary/10 border-primary' 
                : 'bg-white border-slate-100'
            }`}
          >
            <cat.icon size={14} color={activeCategory === cat.id.toString() ? '#2aa275' : '#64748b'} />
            <Text className={`ml-2 text-[11px] font-black uppercase tracking-wider ${
              activeCategory === cat.id.toString() ? 'text-primary' : 'text-slate-500'
            }`}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured Lots - Only for Collecteurs/Entreprises or showing Vendeur's best deals */}
      <View className="mb-8">
        <Text className="text-lg font-black text-[#020617] mb-4">
          {profile?.role === 'vendeur' ? 'Opportunités Locales' : 'Lots en Vedette'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredWastes.map((item) => (
            <FeaturedWasteCard key={`featured-${item.id}`} waste={item} />
          ))}
        </ScrollView>
      </View>

      <Text className="text-lg font-black text-[#020617] mb-4">
        {profile?.role === 'vendeur' ? 'Vos Publications' : 'Nouveaux Arrivages'}
      </Text>
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
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 20 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2aa275" />
        }
        ListEmptyComponent={() => (
          <View className="py-20 items-center">
            <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Aucun lot correspondant trouvé
            </Text>
          </View>
        )}
      />
    </View>
  );
}
