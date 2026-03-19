import React, { useMemo } from 'react';
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
      case 'entreprise':
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
            route: '/(tabs)/marketplace' // A affiner si une route bourse existe
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
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#2aa275" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1 pt-16 px-8" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <MotiView 
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-12"
        >
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Bienvenue sur votre</Text>
          <Text className="text-4xl font-black text-[#020617] uppercase italic tracking-tighter">ESPACE</Text>
        </MotiView>

        {/* Dashboard Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {gridItems.map((item, index) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 200 + (index * 50) }}
            >
              <TouchableOpacity 
                onPress={() => item.route && router.push(item.route as any)}
                style={{ width: CARD_WIDTH, height: 180 }}
                className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] shadow-sm justify-between"
              >
                <View 
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}20`, borderWidth: 1 }}
                >
                  <item.icon size={28} color={item.color} />
                </View>
                <View>
                  <Text 
                    className="text-[11px] font-black text-[#020617] uppercase tracking-wider mb-2"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-4" numberOfLines={2}>
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
          className="mt-12 w-full bg-slate-900 p-8 rounded-[3rem] relative overflow-hidden shadow-2xl shadow-slate-900/20"
        >
          <View className="absolute top-0 right-0 p-4">
            <Leaf size={40} color="#2aa275" opacity={0.2} />
          </View>
          <Text className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">Impact Écologique</Text>
          <Text className="text-white text-3xl font-black italic tracking-tighter">128 kg <Text className="text-slate-400 text-lg not-italic">recyclés</Text></Text>
        </MotiView>
        
        <View className="h-40" />
      </ScrollView>
    </View>
  );
}
