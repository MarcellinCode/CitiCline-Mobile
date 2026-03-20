import * as React from 'react';
import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
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
            id: 'history',
            title: 'Collectes',
            subtitle: 'Historique des ramassages',
            icon: History,
            color: '#3b82f6',
            route: '/(tabs)/mes-dechets'
          },
          {
            id: 'map',
            title: 'Navigation',
            subtitle: 'Carte des bacs pleins',
            icon: MapIcon,
            color: '#0ea5e9',
            route: '/(tabs)/map'
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <MotiView 
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.headerMoti}
        >
          <Text style={styles.welcomeText}>Bienvenue sur votre</Text>
          <Text style={styles.titleText}>ESPACE</Text>
        </MotiView>

        {/* Dashboard Grid */}
        <View style={styles.gridContainer}>
          {gridItems.map((item, index) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 200 + (index * 50) }}
            >
              <TouchableOpacity 
                onPress={() => item.route && router.push(item.route as any)}
                style={[styles.gridCard, { width: CARD_WIDTH }]}
              >
                <View 
                  style={[styles.iconContainer, { backgroundColor: `${item.color}10`, borderColor: `${item.color}20` }]}
                >
                  <item.icon size={28} color={item.color} />
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
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
          style={styles.bannerContainer}
        >
          <View style={styles.bannerLeaf}>
            <Leaf size={40} color="#2aa275" opacity={0.2} />
          </View>
          <Text style={styles.bannerSubtitle}>Impact Écologique</Text>
          <Text style={styles.bannerTitle}>128 kg <Text style={styles.bannerTitleNormal}>recyclés</Text></Text>
        </MotiView>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: 'white' },
  scrollView: { flex: 1, paddingTop: 64, paddingHorizontal: 32 },
  headerMoti: { marginBottom: 48 },
  welcomeText: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  titleText: { fontSize: 36, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  gridCard: { height: 180, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', padding: 24, borderRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, justifyContent: 'space-between', marginBottom: 16 },
  iconContainer: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardTitle: { fontSize: 11, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  cardSubtitle: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 16 },
  bannerContainer: { marginTop: 48, width: '100%', backgroundColor: '#0f172a', padding: 32, borderRadius: 48, overflow: 'hidden', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  bannerLeaf: { position: 'absolute', top: 0, right: 0, padding: 16 },
  bannerSubtitle: { color: '#10b981', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginBottom: 8 },
  bannerTitle: { color: 'white', fontSize: 30, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  bannerTitleNormal: { color: '#94a3b8', fontSize: 18, fontStyle: 'normal' },
  bottomSpace: { height: 160 }
});
