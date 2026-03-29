import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useWastes } from '@/hooks/useWastes';
import { useProfile } from '@/hooks/useProfile';
import { WasteCard } from '@/components/WasteCard';
import { Search, Leaf, Zap, Box, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  { id: 'all', name: 'Tous les Matériaux', icon: Leaf },
  { id: 1, name: 'Plastique', icon: Box },
  { id: 2, name: 'Métal', icon: Zap },
  { id: 3, name: 'Papier', icon: ShoppingBag },
];

export default function AppelsDOffresScreen() {
  const { wastes, loading: wastesLoading, refreshing, onRefresh } = useWastes();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredWastes = useMemo(() => {
    let list = wastes;
    return list.filter(w => {
      const matchSearch = w.waste_types?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          w.location.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'all' || w.type_id.toString() === activeCategory;
      const isPublished = w.status === 'published';
      return matchSearch && matchCategory && isPublished;
    });
  }, [wastes, search, activeCategory]);

  const loading = wastesLoading || profileLoading;

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
        <TouchableOpacity onPress={() => navigateSafe(router, ROUTES.ESPACE)} style={styles.iconBtn}>
          <ArrowLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text style={styles.mainTitle}>Appels d'Offres</Text>
        <View style={{ width: 48 }} />
      </View>

      <Text style={styles.subtitle}>Consultez les lots B2B disponibles pour la collecte industrielle.</Text>

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
            key={cat.id}
            onPress={() => setActiveCategory(cat.id.toString())}
            style={[
              styles.categoryBtn,
              activeCategory === cat.id.toString() ? styles.categoryBtnActive : styles.categoryBtnInactive
            ]}
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

      <Text style={styles.sectionTitle}>Lots ouverts ({filteredWastes.length})</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={filteredWastes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listCardContainer}>
            <WasteCard waste={item} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2aa275" />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <ShieldCheck size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyText}>Aucun appel d'offre pour le moment</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  listContent: { },
  headerContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  iconBtn: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  mainTitle: { fontSize: 18, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24, fontWeight: '500' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, height: 64, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#0f172a' },
  categoriesScroll: { marginBottom: 32 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 9999, marginRight: 12, borderWidth: 1 },
  categoryBtnActive: { backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' },
  categoryBtnInactive: { backgroundColor: 'white', borderColor: '#f1f5f9' },
  categoryText: { marginLeft: 8, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  categoryTextActive: { color: '#0f766e' },
  categoryTextInactive: { color: '#64748b' },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
  listCardContainer: { paddingHorizontal: 24, marginBottom: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconBg: { width: 100, height: 100, backgroundColor: 'white', borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  emptyText: { color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 14 }
});
