import * as React from 'react';
import { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform, Image } from 'react-native';
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
  Globe,
  ArrowUpRight,
  Users,
  Calendar,
  MapPin,
  Package,
  Building2,
  Truck
} from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { useProfile } from '@/hooks/useProfile';
import { HubCard } from '@/components/ui/HubCard';
import { HubText } from '@/components/ui/HubText';
import { HubButton } from '@/components/ui/HubButton';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

const { width } = Dimensions.get('window');

export default function EspaceDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading } = useProfile();

  const gridItems = useMemo(() => {
    if (!profile) return [];

    switch (profile.role) {
      case 'super_admin':
      case 'vendeur':
        return [
          {
            id: 'wallet',
            title: 'Portefeuille',
            subtitle: 'Consultez vos gains',
            value: `${(profile.wallet_balance || 0).toLocaleString()} FCFA`,
            icon: Wallet,
            color: 'bg-emerald-500',
            route: ROUTES.WALLET
          },
          {
            id: 'membership',
            title: 'Abonnement',
            subtitle: 'Gestion & Alertes',
            icon: ShieldCheck,
            color: 'bg-primary',
            route: ROUTES.ABONNEMENTS
          },
          {
            id: 'history',
            title: 'Mes Déchets',
            subtitle: 'Gérer vos publications',
            icon: History,
            color: 'bg-amber-500',
            route: ROUTES.MES_DECHETS
          },
          {
            id: 'map',
            title: 'Carte Live',
            subtitle: 'Points de collecte',
            icon: MapIcon,
            color: 'bg-blue-500',
            route: ROUTES.MAP
          }
        ];
      case 'collecteur':
        return [
          {
            id: 'wallet',
            title: 'Mes Gains',
            subtitle: 'Revenus générés',
            value: `${formatCurrency(profile.wallet_balance)} FCFA`,
            icon: TrendingUp,
            color: 'bg-emerald-500',
            route: ROUTES.WALLET
          },
          {
            id: 'reservations',
            title: 'Mes Réservations',
            subtitle: 'Suivez vos lots bloqués',
            icon: History,
            color: 'bg-primary',
            route: ROUTES.MES_DECHETS
          },
          {
            id: 'bourse',
            title: 'Appels d\'Offres',
            subtitle: 'Espace B2B & Entreprises',
            icon: ShieldCheck,
            color: 'bg-indigo-500',
            route: ROUTES.ESPACE_OFFRES
          },
          {
            id: 'map',
            title: 'Carte Live',
            subtitle: 'Points de collecte',
            icon: MapIcon,
            color: 'bg-blue-500',
            route: ROUTES.MAP
          }
        ];
      case 'agent_collecteur':
        return [
          {
            id: 'missions',
            title: 'Ma Mission',
            subtitle: 'Feuille de route du jour',
            icon: Target,
            color: 'bg-primary',
            route: ROUTES.MISSIONS
          },
          {
            id: 'map',
            title: 'Carte Live',
            subtitle: 'Bac à proximité',
            icon: MapIcon,
            color: 'bg-emerald-500',
            route: ROUTES.MAP
          },
          {
            id: 'history',
            title: 'Mon Historique',
            subtitle: 'Collectes terminées',
            icon: History,
            color: 'bg-amber-500',
            route: ROUTES.MES_DECHETS
          },
          {
            id: 'profile',
            title: 'Mon Profil',
            subtitle: 'Paramètres du compte',
            icon: Settings,
            color: 'bg-zinc-800',
            route: ROUTES.SETTINGS
          }
        ];
      case 'organisation_admin':
      case 'entreprise':
        return [
          {
            id: 'reservations',
            title: 'Réservations',
            subtitle: 'Suivez vos lots réservés',
            icon: Calendar,
            color: 'bg-blue-500',
            route: ROUTES.MES_DECHETS
          },
          {
            id: 'map',
            title: 'Carte Live',
            subtitle: 'Explorer les déchets autour',
            icon: MapPin,
            color: 'bg-emerald-500',
            route: ROUTES.MAP
          },
          {
            id: 'history',
            title: 'Mes Déchets',
            subtitle: 'Gérer vos publications',
            icon: Package,
            color: 'bg-orange-500',
            route: ROUTES.MES_DECHETS
          },
          {
            id: 'wallet',
            title: 'Mon Portefeuille',
            subtitle: 'Consultez vos gains',
            value: `${formatCurrency(profile.wallet_balance)} FCFA`,
            icon: Wallet,
            color: 'bg-purple-500',
            route: ROUTES.WALLET
          },
          {
            id: 'bourse',
            title: 'Appels d\'Offres',
            subtitle: 'Espace B2B & Marchés',
            icon: Building2,
            color: 'bg-indigo-500',
            route: ROUTES.ESPACE_OFFRES
          },
          {
            id: 'mission-control',
            title: 'Mission Control',
            subtitle: 'Gestion agents & concessions',
            icon: BarChart3,
            color: 'bg-zinc-900',
            route: ROUTES.ESPACE_AGENTS
          },
          {
            id: 'fleet',
            title: 'Carnet d\'Entretien',
            subtitle: 'Suivi technique & vidange',
            icon: Truck,
            color: 'bg-emerald-600',
            route: ROUTES.FLEET
          },
          {
            id: 'analytics',
            title: 'Impact RSE',
            subtitle: 'Bilan Écologique',
            icon: Leaf,
            color: 'bg-emerald-500',
            route: ROUTES.ESPACE_ANALYTICS
          }
        ];
      default:
        return [
           {
            id: 'wallet',
            title: 'Portefeuille',
            subtitle: 'Consultez vos gains',
            value: `${(profile.wallet_balance || 0).toLocaleString()} FCFA`,
            icon: Wallet,
            color: 'bg-emerald-500',
            route: ROUTES.WALLET
          },
          {
            id: 'history',
            title: 'Mes Déchets',
            subtitle: 'Gérer vos publications',
            icon: History,
            color: 'bg-amber-500',
            route: ROUTES.MES_DECHETS
          }
        ];
    }
  }, [profile]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#2A9D8F" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 140
        }}
      >

        {/* Header section with User emphasis */}
        <View className="mb-10">
            <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-[2px] bg-primary" />
                <HubText variant="label" className="text-primary italic">CITICLINE CENTRAL HUB</HubText>
            </View>
            <View className="flex-row items-end justify-between">
                <View>
                    <HubText variant="h1" className="text-zinc-900">
                        Bonjour, <HubText variant="h1" className="text-primary">{profile?.full_name?.split(' ')[0] || "Eco-Guerrier"}</HubText>
                    </HubText>
                    <HubText variant="body" className="text-zinc-400 mt-1">Prêt pour votre prochaine action ?</HubText>
                </View>
            </View>
        </View>

        {/* Quick Wallet Summary Card */}
        <View className="mb-10">
            <HubCard className="bg-zinc-900 border-0 flex-row items-center justify-between p-8">
                <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                        <Wallet size={24} color="white" />
                    </View>
                    <View>
                        <HubText variant="label" className="text-zinc-400">Solde Actuel</HubText>
                        <HubText variant="h2" className="text-white">{formatCurrency(profile?.wallet_balance)} FCFA</HubText>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={() => router.push(ROUTES.WALLET as any)}
                    className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center border border-zinc-700"
                >
                    <ArrowUpRight size={20} color="white" />
                </TouchableOpacity>
            </HubCard>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row gap-4 mb-10">
            <MiniStat 
                label="Recyclé" 
                value="128kg" 
                icon={Leaf} 
                delay={300}
            />
            <MiniStat 
                label="Points" 
                value={profile?.eco_points || "450"} 
                icon={Crown} 
                delay={400}
            />
        </View>

        {/* Main Hub Navigation */}
        <HubText variant="label" className="mb-6 ml-1">Menu Principal</HubText>
        <View className="flex-row flex-wrap justify-between">
            {gridItems.map((item, idx) => (
                <View key={item.id} className="w-[48%] mb-6">
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={() => item.route && router.push(item.route as any)}
                    >
                        <HubCard 
                            className="p-6 h-48 justify-between border-2 border-zinc-50"
                            variant="default"
                        >
                            <View className={cn("w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-zinc-200/50", item.color)}>
                                <item.icon size={24} color="white" />
                            </View>
                            
                            <View>
                                <HubText variant="h3" className="text-zinc-900 mb-1 text-sm">{item.title}</HubText>
                                <HubText variant="caption" className="text-zinc-500 text-[9px]" numberOfLines={1}>{item.subtitle}</HubText>
                            </View>

                            <View className="flex-row items-center gap-1">
                                <HubText variant="label" className="text-primary text-[8px] tracking-[0.2em]">EXPLORER</HubText>
                                <ArrowUpRight size={10} color="#2A9D8F" />
                            </View>
                        </HubCard>
                    </TouchableOpacity>
                </View>
            ))}
        </View>

        {/* Premium Promotional Card */}
        {profile?.role === 'collecteur' && (
            <View className="mt-4 mb-10">
                <HubCard className="bg-primary/5 border-primary/10 border-2 p-8">
                    <HubText variant="h2" className="text-zinc-900 mb-2">
                        Devenez un <HubText variant="h2" className="text-primary">Partenaire Certifié</HubText>
                    </HubText>
                    <HubText variant="body" className="text-zinc-500 mb-6">
                        Boostez votre visibilité et accédez à des lots premium en passant au forfait Business.
                    </HubText>
                    <HubButton 
                        variant="accent" 
                        size="md"
                        onPress={() => router.push(ROUTES.ABONNEMENTS as any)}
                    >
                        En savoir plus
                    </HubButton>
                </HubCard>
            </View>
        )}

      </ScrollView>
    </View>
  );
}

function MiniStat({ label, value, icon: Icon, delay }: any) {
    return (
        <View className="flex-1 p-4 bg-zinc-50 rounded-3xl border border-zinc-100 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-white items-center justify-center shadow-sm">
                <Icon size={18} color="#2A9D8F" />
            </View>
            <View>
                <HubText variant="label" className="text-[8px] mb-0">{label}</HubText>
                <HubText variant="h3" className="text-sm mt-[-2]">{value}</HubText>
            </View>
        </View>
    );
}
