import * as React from 'react';
import { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, Dimensions, StyleSheet } from 'react-native';
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
  const { wastes, loading: wastesLoading, refreshing, onRefresh } = useWastes();
  const { profile, loading: profileLoading } = useProfile();
  const unreadCount = useUnreadNotifications();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredWastes = useMemo(() => {
    let list = wastes;
    return list.filter(w => {
      const matchSearch = w.waste_types?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          w.location.toLowerCase().includes(search.toLowerCase());
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
        <View style={styles.emptyBox} />
        <Text style={styles.mainTitle}>CITIC<Text style={styles.mainTitleSub}>LINE</Text></Text>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
          <Bell size={20} color="#020617" />
          {unreadCount > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

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
        contentContainerStyle={{ paddingBottom: 120 }}
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
  container: { flex: 1, backgroundColor: 'white' },
  loadingContainer: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  headerContainer: { paddingTop: 64, paddingBottom: 24, paddingHorizontal: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  emptyBox: { width: 40 },
  mainTitle: { fontSize: 24, fontWeight: '900', color: '#10b981', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1 },
  mainTitleSub: { color: '#020617' },
  notificationBtn: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  notificationBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#10b981', borderRadius: 4, borderWidth: 2, borderColor: 'white' },
  searchBar: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600', color: '#020617' },
  categoriesScroll: { marginBottom: 32 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9999, marginRight: 12, borderWidth: 1 },
  categoryBtnActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' },
  categoryBtnInactive: { backgroundColor: 'white', borderColor: '#f1f5f9' },
  categoryText: { marginLeft: 8, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  categoryTextActive: { color: '#10b981' },
  categoryTextInactive: { color: '#64748b' },
  featuredSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#020617', marginBottom: 16 },
  emptyList: { paddingVertical: 80, alignItems: 'center' },
  emptyListText: { color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }
});
