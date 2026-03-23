import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, Dimensions, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useWastes } from '@/hooks/useWastes';
import { useProfile } from '@/hooks/useProfile';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
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
  }, [wastes, search, activeCategory, profile]);

  const loading = wastesLoading || profileLoading;

  const featuredWastes = useMemo(() => {
    return wastes.slice(0, 3);
  }, [wastes]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#2aa275" />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{profile?.full_name || 'Citoyen'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
          <Bell size={20} color="#0f172a" />
          {unreadCount > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      {/* Bento Widget: Impact Ecolo */}
      <View style={styles.bentoWidget}>
         <View style={styles.bentoLeft}>
            <View style={styles.iconWrapper}>
               <Leaf size={20} color="#10b981" />
            </View>
            <Text style={styles.bentoTitle}>Impact Écologique</Text>
            <Text style={styles.bentoValue}>12.5 <Text style={styles.bentoUnit}>kg recyclés</Text></Text>
         </View>
         <View style={styles.bentoRight}>
            <Zap size={24} color="#f59e0b" />
            <Text style={styles.bentoRightText}>Niv. 2</Text>
         </View>
      </View>

      <Text style={styles.sectionTitleExplore}>Explorer le réseau</Text>

      <View style={styles.searchBar}>
        <Search size={20} color="#94a3b8" />
        <TextInput 
          placeholder="Rechercher des produits recyclables..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat.id.toString()}
            onPress={() => setActiveCategory(cat.id.toString())}
            style={[
              styles.categoryBtn,
              activeCategory === cat.id.toString() ? styles.categoryBtnActive : styles.categoryBtnInactive
            ] as any}
          >
            <cat.icon size={14} color={activeCategory === cat.id.toString() ? '#2aa275' : '#64748b'} />
            <Text style={[
              styles.categoryText,
              activeCategory === cat.id.toString() ? styles.categoryTextActive : styles.categoryTextInactive
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>
          {profile?.role === 'vendeur' ? 'Opportunités Locales' : 'Lots en Vedette'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredWastes.map((item) => (
            <FeaturedWasteCard key={`featured-${item.id}`} waste={item} />
          ))}
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>
        {profile?.role === 'vendeur' ? 'Vos Publications' : 'Nouveaux Arrivages'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <FlatList
        data={filteredWastes}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }: { item: Waste }) => <WasteCard waste={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 20 }}
        contentContainerStyle={{ 
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 160 
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2aa275" />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>
              Aucun lot correspondant trouvé
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  headerContainer: { paddingBottom: 24, paddingHorizontal: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  greeting: { fontSize: 14, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: 28, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  notificationBtn: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  notificationBadge: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 5, borderWidth: 2, borderColor: 'white' },
  
  bentoWidget: { flexDirection: 'row', backgroundColor: '#10b981', borderRadius: 32, padding: 24, marginBottom: 32, shadowColor: '#10b981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
  bentoLeft: { flex: 1 },
  iconWrapper: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 16 },
  bentoTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  bentoValue: { color: 'white', fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  bentoUnit: { fontSize: 14, fontStyle: 'normal', color: 'rgba(255,255,255,0.8)' },
  bentoRight: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  bentoRightText: { color: 'white', fontSize: 10, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },

  sectionTitleExplore: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16, letterSpacing: -0.5 },
  searchBar: { backgroundColor: 'white', borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.04, shadowRadius: 15, elevation: 3 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#0f172a' },
  categoriesScroll: { marginBottom: 32 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginRight: 12, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  categoryBtnActive: { backgroundColor: '#10b981' },
  categoryBtnInactive: { backgroundColor: 'white' },
  categoryText: { marginLeft: 8, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  categoryTextActive: { color: 'white' },
  categoryTextInactive: { color: '#64748b' },
  featuredSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16, letterSpacing: -0.5 },
  emptyList: { paddingVertical: 80, alignItems: 'center' },
  emptyListText: { color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, fontSize: 11 }
});
