import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { 
  ChevronLeft, 
  RefreshCw,
  Package,
  CheckCircle2
} from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Waste } from '@/lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Disponible', color: '#2aa275', bg: '#2aa27515' },
  reserved:  { label: 'Réservé',    color: '#f59e0b', bg: '#f59e0b15' },
  collected: { label: 'Collecté',   color: '#64748b', bg: '#64748b15' },
  cancelled: { label: 'Annulé',     color: '#ef4444', bg: '#ef444415' },
};

export default function MesDechetsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadWastes();
  }, [profile]);

  const loadWastes = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);

      let query = supabase
        .from('wastes')
        .select('*, waste_types(*)')
        .order('created_at', { ascending: false });

      if (profile?.role === 'vendeur') {
        query = query.eq('seller_id', profile.id);
      } else if (profile?.role === 'collecteur' || profile?.role === 'agent_collecteur') {
        query = query.eq('collector_id', profile.id);
      }

      const { data } = await query;
      setWastes((data as Waste[]) || []);
    } catch (err) {
      console.error("loadWastes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const title = profile?.role === 'vendeur' ? 'Mes Publications' : 'Mes Collectes';
  const emptyLabel = profile?.role === 'vendeur' 
    ? 'Vous n\'avez pas encore publié de déchets'
    : 'Vous n\'avez pas encore effectué de collecte';

  const isLoad = profileLoading || loading;

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }]}>
        <TouchableOpacity onPress={() => navigateSafe(router, ROUTES.ESPACE)} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={loadWastes} style={styles.iconBtn}>
          <RefreshCw size={18} color="#020617" />
        </TouchableOpacity>
      </View>

      {isLoad ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#2aa275" />
        </View>
      ) : wastes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Package size={32} color="#cbd5e1" />
          </View>
          <Text style={styles.emptyText}>{emptyLabel}</Text>
          {profile?.role === 'vendeur' && (
            <TouchableOpacity
              onPress={() => navigateSafe(router, '/marketplace/publish')}
              style={styles.actionBtn}
            >
              <Text style={styles.actionBtnText}>Publier un lot</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        >
          {/* Stats rapides */}
          <View style={styles.statsRow}>
            <View style={styles.statBoxDark}>
              <Text style={styles.statLabelPrimary}>Total</Text>
              <Text style={styles.statValueWhite}>{wastes.length}</Text>
            </View>
            <View style={styles.statBoxLight}>
              <Text style={styles.statLabelMuted}>Actifs</Text>
              <Text style={styles.statValueDark}>
                {wastes.filter((w: any) => w.status === 'published' || w.status === 'reserved').length}
              </Text>
            </View>
            <View style={styles.statBoxGreen}>
              <Text style={styles.statLabelPrimary}>Collectés</Text>
              <Text style={styles.statValuePrimary}>
                {wastes.filter((w: any) => w.status === 'collected').length}
              </Text>
            </View>
          </View>

          <Text style={styles.historyTitle}>Historique</Text>

          <View style={styles.listContainer}>
            {wastes.map((waste: any, i: number) => {
              const statusCfg = STATUS_CONFIG[waste.status] || STATUS_CONFIG.published;
              const wasteType = waste.waste_types;
              return (
                <View key={waste.id}>
                  <TouchableOpacity style={styles.cardItem}>
                    <View style={styles.cardIconBg}>
                      <Text style={styles.cardEmoji}>{wasteType?.emoji || '♻️'}</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>
                        {wasteType?.name || 'Déchets recyclables'}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {waste.estimated_weight} kg · {waste.location || 'Localisation non définie'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  iconBtn: { width: 48, height: 48, backgroundColor: '#f8fafc', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconBg: { width: 80, height: 80, backgroundColor: '#f8fafc', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyText: { color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, textAlign: 'center' },
  actionBtn: { marginTop: 32, backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  actionBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 },
  scrollView: { flex: 1, paddingHorizontal: 32 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statBoxDark: { flex: 1, backgroundColor: '#0f172a', padding: 16, borderRadius: 24, alignItems: 'center' },
  statBoxLight: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', padding: 16, borderRadius: 24, alignItems: 'center' },
  statBoxGreen: { flex: 1, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', padding: 16, borderRadius: 24, alignItems: 'center' },
  statLabelPrimary: { color: '#10b981', fontWeight: '900', fontSize: 8, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  statLabelMuted: { color: '#94a3b8', fontWeight: '900', fontSize: 8, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  statValueWhite: { color: 'white', fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  statValueDark: { color: '#020617', fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  statValuePrimary: { color: '#10b981', fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  historyTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 24 },
  listContainer: { flexDirection: 'column', gap: 16 },
  cardItem: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', padding: 20, borderRadius: 32, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIconBg: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, marginRight: 16 },
  cardEmoji: { fontSize: 22 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 11, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  cardSubtitle: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 },
  statusBadgeText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 }
});
