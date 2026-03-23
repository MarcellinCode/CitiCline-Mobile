import * as React from 'react';
import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  User, 
  Wallet, 
  History, 
  Settings, 
  Crown, 
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Leaf,
  Map as MapIcon,
  ShieldCheck,
  TrendingUp,
  Target,
  BarChart3,
  Globe
} from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64 - 16) / 2; // Fixed padding and gap

export default function EspaceDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading } = useProfile();

  const gridItems = useMemo(() => {
    if (!profile) return [];

    switch (profile.role) {
      case 'vendeur':
        return [
          {
            id: 'wallet',
            title: 'Portefeuille',
            subtitle: `${profile.wallet_balance?.toLocaleString() || '0'} FCFA`,
            icon: Wallet,
            color: '#2aa275',
            route: '/(tabs)/wallet'
          },
          {
            id: 'membership',
            title: 'Abonnement',
            subtitle: 'Service de ramassage',
            icon: Crown,
            color: '#8b5cf6',
            route: '/(tabs)/abonnements'
          },
          {
            id: 'history',
            title: 'Mes Ventes',
            subtitle: 'Suivi de vos recyclables',
            icon: History,
            color: '#f59e0b',
            route: '/(tabs)/mes-dechets'
          },
          {
            id: 'map',
            title: 'Carte',
            subtitle: 'Points de collecte',
            icon: MapIcon,
            color: '#0ea5e9',
            route: '/(tabs)/map'
          }
        ];
      case 'collecteur':
        return [
          {
            id: 'wallet',
            title: 'Mes Gains',
            subtitle: `${profile.wallet_balance?.toLocaleString() || '0'} FCFA`,
            icon: TrendingUp,
            color: '#2aa275',
            route: '/(tabs)/wallet'
          },
          {
            id: 'missions',
            title: 'Missions',
            subtitle: 'Feuille de route active',
            icon: Target,
            color: '#ef4444',
            route: '/(tabs)/missions'
          },
          {
            id: 'bourse',
            title: 'Appels d\'Offres',
            subtitle: 'Gros volumes (B2B)',
            icon: ShieldCheck,
            color: '#10b981',
            route: '/(tabs)/espace/offres'
          },
          {
            id: 'history',
            title: 'Collectes',
            subtitle: 'Historique des ramassages',
            icon: History,
            color: '#3b82f6',
            route: '/(tabs)/mes-dechets'
          }
        ];
      case 'organisation_admin':
        return [
          {
            id: 'wallet',
            title: 'Trésorerie',
            subtitle: `${profile.wallet_balance?.toLocaleString() || '0'} FCFA`,
            icon: Wallet,
            color: '#2aa275',
            route: '/(tabs)/wallet'
          },
          {
            id: 'bourse',
            title: 'Appels d\'Offres',
            subtitle: 'Marché B2B / Gros volumes',
            icon: ShieldCheck,
            color: '#10b981',
            route: '/(tabs)/espace/offres' // Redirection vers le nouvel écran dédié des Appels d'Offres
          },
          {
            id: 'agents',
            title: 'Nos Agents',
            subtitle: 'Gestion du personnel',
            icon: User,
            color: '#6366f1',
            route: '/(tabs)/espace/agents'
          },
          {
            id: 'analytics',
            title: 'Analytique',
            subtitle: 'Rapport d\'impact zone',
            icon: BarChart3,
            color: '#6366f1',
            route: '/(tabs)/espace/analytics'
          }
        ];
      case 'mairie':
        return [
          {
            id: 'web_portal',
            title: 'Portail Web',
            subtitle: 'Gestion via CITICLINE City OS',
            icon: Globe,
            color: '#2aa275',
            route: null // handled separately below
          },
          {
            id: 'stats',
            title: 'Aperçu Ville',
            subtitle: 'Statistiques de collecte',
            icon: BarChart3,
            color: '#0ea5e9',
            route: '/(tabs)/espace/analytics'
          }
        ];
      default:
        return [];
    }
  }, [profile]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#2aa275" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        style={[styles.scrollView, { marginTop: Platform.OS === 'android' ? 20 : 0 }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 140 // Clear the floating tab bar
        }}
      >

        {/* Profile Header */}
        <MotiView 
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.headerMoti}
        >
          <Text style={styles.welcomeText}>Tableau de bord de</Text>
          <Text style={styles.titleText}>{profile?.full_name || 'ESPACE'}</Text>
        </MotiView>

        {/* Dashboard Grid */}
        <View style={styles.gridContainer}>
          {gridItems.map((item, index) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, scale: 0.95, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 100 + (index * 50) }}
            >
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => item.route && router.push(item.route as any)}
                style={[styles.gridCard, { width: CARD_WIDTH }]}
              >
                <View 
                  style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}
                >
                  <item.icon size={26} color={item.color} />
                </View>
                <View>
                  <Text 
                    style={styles.cardTitle}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Info Banner */}
        {profile?.role !== 'agent_collecteur' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 400 }}
            style={styles.bannerContainer}
          >
            <View style={styles.bannerLeaf}>
              <Leaf size={60} color="#ffffff" opacity={0.15} />
            </View>
            <Text style={styles.bannerSubtitle}>Impact Écolo</Text>
            <Text style={styles.bannerTitle}>128 kg <Text style={styles.bannerTitleNormal}>gérés</Text></Text>
          </MotiView>
        )}

      </ScrollView>
    </View>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1, paddingHorizontal: 24 },
  headerMoti: { marginBottom: 32 },
  welcomeText: { fontSize: 13, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  titleText: { fontSize: 28, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  gridCard: { height: 180, backgroundColor: 'white', padding: 24, borderRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 3, justifyContent: 'space-between', marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  cardSubtitle: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 14 },
  bannerContainer: { marginTop: 32, width: '100%', backgroundColor: '#10b981', padding: 32, borderRadius: 32, overflow: 'hidden', shadowColor: '#10b981', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  bannerLeaf: { position: 'absolute', top: -10, right: -10, padding: 16 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.9)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginBottom: 8 },
  bannerTitle: { color: 'white', fontSize: 28, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  bannerTitleNormal: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontStyle: 'normal', fontWeight: 'bold' }
});
