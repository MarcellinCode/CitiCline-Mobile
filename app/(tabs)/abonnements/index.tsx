import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { 
  ChevronLeft, 
  Crown, 
  Check, 
  Zap, 
  Shield, 
  Star, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react-native';
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadSubscription();
  }, [profile]);

  const loadSubscription = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);

      // Chercher l'abonnement actif du citoyen
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      setSubscription(data as Subscription | null);
    } catch (err) {
      console.error("loadSubscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  const title = profile?.role === 'vendeur' ? 'Service de Collecte' : 'Abonnement';
  const isLoad = profileLoading || loading;

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }]}>
        <TouchableOpacity onPress={() => navigateSafe(router, ROUTES.ESPACE)} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 48 }} />
      </View>

      {isLoad ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#2aa275" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        >
          {profile?.role === 'vendeur' && subscription ? (
            /* ── ABONNÉ ACTIF ── */
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <View style={styles.activeSubCard}>
                <View style={styles.crownIconBg}>
                  <Crown size={40} color="#2aa275" />
                </View>
                <Text style={styles.zoneNameTitle}>
                  {subscription.zone_name || 'Zone Assignée'}
                </Text>
                <Text style={styles.partnerSubtitle}>
                  Géré par : {subscription.company_name || 'Partenaire CITICLINE'}
                </Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Service Actif</Text>
                </View>
              </View>

              <Text style={styles.sectionHeading}>Jours de Passage</Text>
              <View style={styles.daysContainer}>
                {(subscription.pickup_days || ['Lundi', 'Mercredi', 'Vendredi']).map((day: string, i: number) => (
                  <View key={i} style={styles.dayItem}>
                    <View style={styles.dayItemLeft}>
                      <Calendar size={18} color="#2aa275" />
                      <Text style={styles.dayItemText}>{day}</Text>
                    </View>
                    <Text style={styles.dayItemTime}>
                      {subscription.pickup_time || '08h - 10h'}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.reportBtn}>
                <AlertCircle size={16} color="white" />
                <Text style={styles.reportBtnText}>Signaler un Problème</Text>
              </TouchableOpacity>
            </MotiView>

          ) : profile?.role === 'vendeur' && !subscription ? (
            /* ── PAS D'ABONNEMENT ── */
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <View style={styles.noSubCard}>
                <View style={styles.emptyCrownIconBg}>
                  <Crown size={40} color="#cbd5e1" />
                </View>
                <Text style={styles.noSubTitle}>Pas d'Abonnement</Text>
                <Text style={styles.noSubDesc}>
                  Souscrivez à un service de collecte pour vos déchets ménagers.
                </Text>
              </View>

              <Text style={styles.sectionHeading}>Avantages</Text>
              <View style={styles.perksContainer}>
                {[
                  'Collecte régulière planifiée',
                  'Notification avant chaque passage',
                  'Historique de vos collectes',
                  'Support prioritaire 24/7',
                ].map((item, i) => (
                  <View key={i} style={styles.perkItem}>
                    <CheckCircle2 size={18} color="#2aa275" />
                    <Text style={styles.perkText}>{item}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.contactBtn}>
                <Text style={styles.contactBtnText}>Contacter un Collecteur</Text>
              </TouchableOpacity>
            </MotiView>

          ) : (
            /* ── COLLECTEUR / ENTREPRISE / AUTRES ── */
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <View style={styles.proSubCard}>
                <View style={styles.proCrownIconBg}>
                  <Crown size={40} color="#6366f1" />
                </View>
                <Text style={styles.proSubTitle}>
                  {profile?.subscription_tier === 'pro' ? 'Plan Pro' : 
                   profile?.subscription_tier === 'business' ? 'Plan Business' : 'Plan Starter'}
                </Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>Actif</Text>
                </View>
              </View>

              <Text style={styles.sectionHeading}>Avantages Premium</Text>
              <View style={styles.perksContainer}>
                {[
                  'Collectes prioritaires',
                  'Frais de service réduits',
                  'Support 24/7 dédié',
                  'Badge Partenaire Vérifié',
                  'Tableau de bord analytique',
                ].map((item, i) => (
                  <View key={i} style={styles.perkItem}>
                    <CheckCircle2 size={18} color="#6366f1" />
                    <Text style={styles.perkText}>{item}</Text>
                  </View>
                ))}
              </View>
            </MotiView>
          )}
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
  scrollView: { flex: 1, paddingHorizontal: 32 },
  activeSubCard: { backgroundColor: 'rgba(42, 162, 117, 0.1)', borderColor: 'rgba(42, 162, 117, 0.2)', borderWidth: 1, padding: 32, borderRadius: 48, alignItems: 'center', marginBottom: 40 },
  crownIconBg: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  zoneNameTitle: { fontSize: 24, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, marginBottom: 4 },
  partnerSubtitle: { color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 10, letterSpacing: 2, marginBottom: 16 },
  activeBadge: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#2aa275', borderRadius: 9999 },
  activeBadgeText: { color: 'white', fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 },
  sectionHeading: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 24 },
  daysContainer: { flexDirection: 'column', gap: 16, marginBottom: 40 },
  dayItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  dayItemLeft: { flexDirection: 'row', alignItems: 'center' },
  dayItemText: { marginLeft: 12, fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  dayItemTime: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  reportBtn: { width: '100%', backgroundColor: '#ef4444', height: 64, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(239, 68, 68, 0.2)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 20, elevation: 10 },
  reportBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, marginLeft: 8 },
  noSubCard: { backgroundColor: '#f8fafc', borderColor: '#f1f5f9', borderWidth: 1, padding: 32, borderRadius: 48, alignItems: 'center', marginBottom: 40 },
  emptyCrownIconBg: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  noSubTitle: { fontSize: 24, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, marginBottom: 8 },
  noSubDesc: { color: '#94a3b8', fontWeight: '500', textAlign: 'center', fontSize: 14 },
  perksContainer: { flexDirection: 'column', gap: 12, marginBottom: 40 },
  perkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  perkText: { marginLeft: 12, fontSize: 14, fontWeight: 'bold', color: '#475569' },
  contactBtn: { width: '100%', backgroundColor: '#020617', height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  contactBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12 },
  proSubCard: { backgroundColor: '#eef2ff', borderColor: '#e0e7ff', borderWidth: 1, padding: 32, borderRadius: 48, alignItems: 'center', marginBottom: 32 },
  proCrownIconBg: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  proSubTitle: { fontSize: 24, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, marginBottom: 8 },
  proBadge: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6366f1', borderRadius: 9999 },
  proBadgeText: { color: 'white', fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 }
});
