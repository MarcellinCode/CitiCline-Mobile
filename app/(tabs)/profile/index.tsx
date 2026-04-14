import React, { useMemo, useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Platform, Image as RNImage } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { User, Mail, Shield, Bell, ChevronRight, LogOut, Camera, Crown, Settings, Leaf, Wallet, ArrowUpRight } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { 
    LOCATION_TASK_NAME, 
    startBackgroundTracking, 
    stopBackgroundTracking 
} from '../../src/utils/backgroundLocationTask';

const ROLE_LABELS: Record<string, string> = {
  vendeur: 'Citoyen Éco',
  collecteur: 'Collecteur Pro',
  entreprise: 'Entreprise Hub',
  organisation_admin: 'Admin Org',
  agent_collecteur: 'Agent Terrain',
  mairie: 'Mairie Vision',
  super_admin: 'Super Admin',
};

const ROLE_COLORS: Record<string, string> = {
  vendeur: 'text-emerald-500 bg-emerald-50',
  collecteur: 'text-primary bg-primary/10',
  entreprise: 'text-indigo-500 bg-indigo-50',
  organisation_admin: 'text-violet-500 bg-violet-50',
  agent_collecteur: 'text-amber-500 bg-amber-50',
  mairie: 'text-zinc-900 bg-zinc-50',
  super_admin: 'text-red-500 bg-red-50',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading, refreshProfile } = useProfile();
  const { unreadCount } = useUnreadNotifications();

  const [isTracking, setIsTracking] = useState(false);
  const [impactTotal, setImpactTotal] = useState(0);

  const isAgent = profile?.role === 'agent_collecteur' || profile?.role === 'collecteur';

  useEffect(() => {
    if (isAgent) {
        checkTrackingStatus();
    }
  }, [isAgent]);

  const checkTrackingStatus = async () => {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(started);
  };

  const toggleTracking = async () => {
    try {
        if (isTracking) {
            await stopBackgroundTracking();
            setIsTracking(false);
            Alert.alert('Suivi Terminé', 'Votre position n\'est plus partagée.');
        } else {
            const { status: foreground } = await Location.requestForegroundPermissionsAsync();
            if (foreground !== 'granted') {
                Alert.alert('Permission requise', 'Le suivi nécessite l\'accès à la position.');
                return;
            }
            const { status: background } = await Location.requestBackgroundPermissionsAsync();
            if (background !== 'granted') {
                Alert.alert('Accès en arrière-plan requis', 'Pour un suivi optimal, activez "Toujours autoriser" dans les réglages.');
                return;
            }

            await startBackgroundTracking();
            setIsTracking(true);
            Alert.alert('Suivi Actif', 'Votre position est maintenant partagée avec votre organisation.');
        }
    } catch (err) {
        console.error('Toggle tracking error:', err);
        Alert.alert('Erreur', 'Impossible de modifier le statut du suivi.');
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchImpact();
    }
  }, [profile]);

  const fetchImpact = async () => {
    try {
      const field = profile?.role === 'collecteur' ? 'collector_id' : 'seller_id';
      const { data, error } = await supabase
        .from('wastes')
        .select('final_weight, estimated_weight')
        .eq(field, profile?.id)
        .eq('status', 'collected');
      
      if (error) throw error;
      if (data) {
        const total = data.reduce((acc: number, w: any) => acc + (Number(w.final_weight) || Number(w.estimated_weight) || 0), 0);
        setImpactTotal(total);
      }
    } catch (err) {
      console.error("fetchImpact error:", err);
    }
  };

  const joinDate = useMemo(() => {
    if (!profile?.created_at) return "Récemment";
    const date = new Date(profile.created_at);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, [profile]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleUpdateAvatar(result.assets[0].uri);
    }
  };

  const handleUpdateAvatar = async (uri: string) => {
    try {
      // Pour une démo, on simule l'upload ou on met l'URI directe si c'est du local (pas idéal pour Supabase mais ok pour démo UI)
      // En prod, il faudrait uploader vers Supabase Storage d'abord.
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: uri })
        .eq('id', profile?.id);

      if (error) throw error;
      refreshProfile();
      Alert.alert('Succès', 'Photo de profil mise à jour !');
    } catch (err) {
      console.error('handleUpdateAvatar error:', err);
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#2A9D8F" size="large" />
      </View>
    );
  }

  const roleStyle = ROLE_COLORS[profile?.role || 'vendeur'] || 'text-emerald-500 bg-emerald-50';
  const roleLabel = ROLE_LABELS[profile?.role || 'vendeur'] || 'Membre Hub';

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View 
        className="px-8 flex-row items-center justify-between mb-8"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }}
      >
        <HubText variant="label" className="text-zinc-900 italic">Mon Compte</HubText>
            onPress={() => router.push(ROUTES.NOTIFICATIONS as any)}
            className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-xl shadow-zinc-200/50 border border-zinc-50 relative"
        >
          <Bell size={20} color="#020617" strokeWidth={2.5} />
          {unreadCount > 0 && (
              <View className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >

        {/* Profile Card Emphasis */}
        <View className="mb-10">
            <HubCard className="p-8 border-0 bg-zinc-900 overflow-hidden">
                <View className="flex-row items-center gap-6">
                    <View className="relative">
                        <View className="w-24 h-24 rounded-[2rem] bg-zinc-800 items-center justify-center border-2 border-zinc-700 overflow-hidden">
                             {profile?.avatar_url ? (
                                <RNImage source={{ uri: profile.avatar_url }} className="w-full h-full" />
                             ) : (
                                <User size={40} color="#475569" />
                             )}
                        </View>
                        <TouchableOpacity 
                            onPress={pickImage}
                            className="absolute bottom-[-5] right-[-5] w-10 h-10 bg-primary rounded-full items-center justify-center border-4 border-zinc-900"
                        >
                            <Camera size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1">
                        <HubText variant="h2" className="text-white leading-tight mb-2">
                            {profile?.full_name?.split(' ')[0] || 'Utilisateur'}{'\n'}
                            <HubText variant="h2" className="text-primary italic">{profile?.full_name?.split(' ')[1] || 'HUB'}</HubText>
                        </HubText>
                        <View className={cn("self-start px-3 py-1.5 rounded-full", roleStyle.split(' ')[1])}>
                            <HubText variant="label" className={cn("text-[8px] tracking-[0.2em] mb-0", roleStyle.split(' ')[0])}>
                                {roleLabel}
                            </HubText>
                        </View>
                    </View>
                </View>

                {/* Optional Impact Stat Bar inside card */}
                <View className="mt-8 pt-8 border-t border-zinc-800 flex-row justify-between">
                    <View>
                        <HubText variant="label" className="text-zinc-500 mb-1">Impact Total</HubText>
                        <HubText variant="h3" className="text-white">{impactTotal.toLocaleString()} KG</HubText>
                    </View>
                    <View className="items-end">
                        <HubText variant="label" className="text-zinc-500 mb-1">Depuis</HubText>
                        <HubText variant="h3" className="text-white capitalize">{joinDate}</HubText>
                    </View>
                </View>
            </HubCard>
        </View>

        {/* Quick Balance Bento */}
        <View className="flex-row gap-4 mb-10">
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => router.push(ROUTES.WALLET as any)}
                className="flex-1"
            >
                <HubCard className="p-6 bg-white border-2 border-zinc-50 items-center">
                    <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center mb-4">
                        <Wallet size={18} color="#10b981" />
                    </View>
                    <HubText variant="h3" className="text-zinc-900">{formatCurrency(profile?.wallet_balance)} <HubText className="text-[8px] italic normal-case text-zinc-400">FCFA</HubText></HubText>
                    <HubText variant="label" className="text-zinc-400 text-[8px] mt-1">WALLET</HubText>
                </HubCard>
            </TouchableOpacity>
            
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => router.push(ROUTES.ABONNEMENTS as any)}
                className="flex-1"
            >
                <HubCard className="p-6 bg-white border-2 border-zinc-50 items-center">
                    <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center mb-4">
                        <Crown size={18} color="#F59E0B" />
                    </View>
                    <HubText variant="h3" className="text-zinc-900">{profile?.subscription_tier || 'STARTER'}</HubText>
                    <HubText variant="label" className="text-zinc-400 text-[8px] mt-1">PLAN ACTUEL</HubText>
                </HubCard>
            </TouchableOpacity>
        </View>

        {/* Agent Operational Status */}
        {isAgent && (
            <View className="mb-10">
                <HubText variant="label" className="mb-6 ml-1 text-primary">Statut Opérationnel</HubText>
                <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={toggleTracking}
                >
                    <HubCard className={cn(
                        "p-8 border-2 items-center flex-row justify-between",
                        isTracking ? "bg-emerald-50 border-emerald-100" : "bg-white border-zinc-50"
                    )}>
                        <View className="flex-row items-center gap-4">
                            <View className={cn(
                                "w-12 h-12 rounded-2xl items-center justify-center",
                                isTracking ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-zinc-100"
                            )}>
                                <Navigation size={20} color={isTracking ? "white" : "#94a3b8"} />
                            </View>
                            <View>
                                <HubText variant="h3" className={cn("text-[12px] mb-0", isTracking ? "text-emerald-700" : "text-zinc-900")}>
                                    {isTracking ? "SUIVI EN DIRECT ACTIF" : "SUIVI GPS DÉSACTIVÉ"}
                                </HubText>
                                <HubText variant="caption" className="text-[8px] text-zinc-400">
                                    {isTracking ? "Position partagée avec l'organisation" : "Appuyez pour activer le suivi de mission"}
                                </HubText>
                            </View>
                        </View>
                        <View className={cn(
                            "w-14 h-7 rounded-full px-1 justify-center",
                            isTracking ? "bg-emerald-500" : "bg-zinc-200"
                        )}>
                            <View className={cn(
                                "w-5 h-5 rounded-full bg-white shadow-sm",
                                isTracking ? "self-end" : "self-start"
                            )} />
                        </View>
                    </HubCard>
                </TouchableOpacity>
            </View>
        )}

        {/* Settings Menu */}
        <HubText variant="label" className="mb-6 ml-1">Paramètres du Compte</HubText>
        <HubCard className="p-0 border-2 border-zinc-50 overflow-hidden mb-10">
            {[
                { icon: User, label: 'Éditer mon Profil', desc: 'Infos persos & photo', route: '/profile/edit' },
                { icon: Shield, label: 'Sécurité & Accès', desc: 'Mot de passe & 2FA', route: ROUTES.SETTINGS },
                { icon: Bell, label: 'Notifications', desc: 'Alertes & Préférences', route: ROUTES.NOTIFICATIONS },
                { icon: Crown, label: 'Abonnement Hub', desc: 'Gérer mon forfait', route: ROUTES.ABONNEMENTS, value: 'PRO' },
            ].map((item, idx) => (
                <TouchableOpacity 
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => item.route && router.push(item.route as any)}
                    className={cn(
                        "flex-row items-center justify-between p-6",
                        idx < 3 && "border-b border-zinc-50"
                    )}
                >
                    <View className="flex-row items-center gap-4">
                        <View className="w-10 h-10 rounded-xl bg-zinc-50 items-center justify-center border border-zinc-100">
                            <item.icon size={18} color="#475569" strokeWidth={2.5} />
                        </View>
                        <View>
                            <HubText variant="h3" className="text-zinc-900 text-[11px] mb-[-2]">{item.label}</HubText>
                            <HubText variant="caption" className="text-zinc-400 text-[8px]">{item.desc}</HubText>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-2">
                        {item.value && (
                            <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                                <HubText variant="label" className="text-primary text-[7px] tracking-[0.1em] mb-0">{item.value}</HubText>
                            </View>
                        )}
                        <ChevronRight size={14} color="#cbd5e1" strokeWidth={3} />
                    </View>
                </TouchableOpacity>
            ))}
        </HubCard>

        {/* Danger Zone */}
        <TouchableOpacity 
          onPress={handleLogout}
          activeOpacity={0.8}
          className="bg-red-50 border border-red-100 rounded-[2rem] p-6 flex-row items-center justify-center gap-3"
        >
          <LogOut size={18} color="#ef4444" strokeWidth={2.5} />
          <HubText variant="label" className="text-red-500 italic mb-0">SE DÉCONNECTER DU HUB</HubText>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
