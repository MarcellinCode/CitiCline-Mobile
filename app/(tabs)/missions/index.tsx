import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Target, MapPin, Clock, ShieldCheck, Box, RefreshCw } from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Waste } from '@/lib/types';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { MotiView } from 'moti';

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [missions, setMissions] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadMissions();
  }, [profile]);

  const loadMissions = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);

      // Charger les wastes réservées assignées à cet agent/collecteur
      const { data } = await supabase
        .from('wastes')
        .select('*, waste_types(*), profiles!wastes_seller_id_fkey(*)')
        .eq('collector_id', profile.id)
        .in('status', ['reserved', 'published'])
        .order('created_at', { ascending: true });

      setMissions((data as Waste[]) || []);
    } catch (err) {
      console.error("loadMissions error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!profileLoading && profile?.role === 'vendeur') {
    return (
      <View style={[styles.guardContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.guardIconBg}>
          <ShieldCheck size={32} color="#cbd5e1" />
        </View>
        <Text style={styles.guardText}>
          Cet espace est réservé aux agents de collecte officiels.
        </Text>
      </View>
    );
  }

  const doneCount = missions.filter(m => m.status === 'collected').length;
  const remaining = missions.filter(m => m.status === 'reserved' || m.status === 'published').length;

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }]}>
        <TouchableOpacity onPress={() => navigateSafe(router, ROUTES.ESPACE)} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma Feuille de Route</Text>
        <TouchableOpacity onPress={loadMissions} style={styles.iconBtn}>
          <RefreshCw size={18} color="#020617" />
        </TouchableOpacity>
      </View>

      {(profileLoading || loading) ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#2aa275" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
        >
          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statBoxDark}>
              <Text style={styles.statLabelDark}>Total</Text>
              <Text style={styles.statValueDark}>
                {missions.length} <Text style={styles.statUnitDark}>missions</Text>
              </Text>
            </View>
            <View style={styles.statBoxLight}>
              <Text style={styles.statLabelLight}>Restant</Text>
              <Text style={styles.statValueLight}>{remaining}</Text>
            </View>
          </View>

          {missions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Target size={32} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyText}>
                Aucune mission assignée pour le moment
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                Missions Actives ({remaining})
              </Text>
              
              <View style={styles.listContainer}>
                {missions.map((mission, i) => (
                  <MotiView
                    key={mission.id}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 50 * i }}
                  >
                    <TouchableOpacity 
                      onPress={() => navigateSafe(router, ROUTES.MISSION_DETAILS(mission.id), { 
                        id: mission.id, 
                        name: (mission.profiles as any)?.full_name || 'Client', 
                        type: mission.waste_types?.name || 'Recyclables', 
                        color: '#2aa275' 
                      })}
                      style={styles.missionCard}
                    >
                      <View style={styles.missionLeft}>
                        <View style={styles.missionIconBg}>
                          <Text style={{ fontSize: 20 }}>{mission.waste_types?.emoji || '♻️'}</Text>
                        </View>
                        <View style={styles.missionInfo}>
                          <Text style={styles.missionName} numberOfLines={1}>
                            {(mission.profiles as any)?.full_name || 'Client'}
                          </Text>
                          <Text style={styles.missionType} numberOfLines={1}>
                            {mission.waste_types?.name || 'Recyclables'} · {mission.estimated_weight} kg
                          </Text>
                          {mission.location ? (
                            <Text style={styles.missionLocation} numberOfLines={1}>
                              📍 {mission.location}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View style={styles.scanBadge}>
                        <Text style={styles.scanBadgeText}>Scanner</Text>
                      </View>
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Action Bar */}
      <View style={[styles.actionBar, { bottom: insets.bottom + 110 }]}>
        <View style={styles.gpsContainer}>
          <View style={styles.gpsDot} />
          <Text style={styles.gpsText}>GPS Actif</Text>
        </View>
        <TouchableOpacity 
          onPress={loadMissions}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshBtnText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  iconBtn: { width: 48, height: 48, backgroundColor: '#f8fafc', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 32 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  statBoxDark: { flex: 1, backgroundColor: '#0f172a', padding: 24, borderRadius: 32 },
  statLabelDark: { color: '#2aa275', fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  statValueDark: { color: 'white', fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  statUnitDark: { color: '#94a3b8', fontSize: 14, fontStyle: 'normal' },
  statBoxLight: { flex: 1, backgroundColor: '#f8fafc', borderStyle: 'solid', borderWidth: 1, borderColor: '#f1f5f9', padding: 24, borderRadius: 32 },
  statLabelLight: { color: '#94a3b8', fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  statValueLight: { color: '#020617', fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyIconBg: { width: 80, height: 80, backgroundColor: '#f8fafc', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyText: { color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, textAlign: 'center' },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 24 },
  listContainer: { flexDirection: 'column', gap: 16, marginBottom: 40 },
  missionCard: { backgroundColor: '#f8fafc', padding: 24, borderRadius: 40, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  missionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  missionIconBg: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  missionInfo: { marginLeft: 16, flex: 1 },
  missionName: { fontSize: 12, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1 },
  missionType: { fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  missionLocation: { fontSize: 8, fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', marginTop: 2 },
  scanBadge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(42, 162, 117, 0.1)', borderRadius: 9999, marginLeft: 8 },
  scanBadgeText: { color: '#2aa275', fontWeight: '900', fontSize: 8, textTransform: 'uppercase' },
  actionBar: { position: 'absolute', bottom: 40, left: 32, right: 32, backgroundColor: '#020617', padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  gpsContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  gpsDot: { width: 8, height: 8, backgroundColor: '#2aa275', borderRadius: 4, marginRight: 8 },
  gpsText: { color: 'white', fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 },
  refreshBtn: { backgroundColor: '#2aa275', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 16 },
  refreshBtnText: { color: 'white', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 },
  guardContainer: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  guardIconBg: { width: 80, height: 80, backgroundColor: '#f8fafc', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  guardText: { textAlign: 'center', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }
});
