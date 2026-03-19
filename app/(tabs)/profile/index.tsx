import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { User, Mail, Shield, Bell, ChevronRight, LogOut, Camera, Crown, Settings, Leaf, Wallet } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { MotiView } from 'moti';

const ROLE_LABELS: Record<string, string> = {
  vendeur: 'Citoyen Éco',
  collecteur: 'Collecteur',
  entreprise: 'Entreprise',
  organisation_admin: 'Admin Organisation',
  agent_collecteur: 'Agent Collecteur',
  mairie: 'Mairie',
};

const ROLE_COLORS: Record<string, string> = {
  vendeur: '#2aa275',
  collecteur: '#3b82f6',
  entreprise: '#6366f1',
  organisation_admin: '#8b5cf6',
  agent_collecteur: '#f59e0b',
  mairie: '#020617',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#2aa275" />
      </View>
    );
  }

  const roleColor = ROLE_COLORS[profile?.role || 'vendeur'] || '#2aa275';
  const roleLabel = ROLE_LABELS[profile?.role || 'vendeur'] || 'Membre';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-8 pt-6 flex-row items-center justify-between mb-8">
        <Text className="text-sm font-black text-[#020617] uppercase tracking-widest">Mon Compte</Text>
        <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
          <Bell size={20} color="#020617" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-8 pb-20" showsVerticalScrollIndicator={false}>
        {/* Avatar & Identité */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="items-center mb-10"
        >
          <View className="relative">
            <View className="w-28 h-28 bg-slate-50 rounded-full items-center justify-center border border-slate-100 overflow-hidden mb-4">
              <User size={50} color="#cbd5e1" />
            </View>
            <TouchableOpacity className="absolute bottom-2 right-0 w-9 h-9 bg-[#020617] rounded-full items-center justify-center border-4 border-white shadow-sm">
              <Camera size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-black text-[#020617] uppercase italic tracking-tighter mb-1">
            {profile?.full_name || 'Utilisateur CITICLINE'}
          </Text>
          
          {/* Badge rôle */}
          <View className="px-4 py-1 rounded-full mt-1" style={{ backgroundColor: `${roleColor}15` }}>
            <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: roleColor }}>
              {roleLabel}
            </Text>
          </View>
        </MotiView>

        {/* Stats rapides */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100 }}
          className="flex-row gap-3 mb-10"
        >
          <View className="flex-1 bg-slate-900 p-5 rounded-[2rem] items-center">
            <Wallet size={20} color="#2aa275" />
            <Text className="text-white text-lg font-black italic tracking-tighter mt-2">
              {profile?.wallet_balance?.toLocaleString('fr-FR') || '0'}
            </Text>
            <Text className="text-slate-400 text-[8px] font-black uppercase tracking-widest">FCFA</Text>
          </View>
          <View className="flex-1 bg-emerald-50 border border-emerald-100 p-5 rounded-[2rem] items-center">
            <Leaf size={20} color="#2aa275" />
            <Text className="text-[#020617] text-lg font-black italic tracking-tighter mt-2">
              {profile?.eco_points || 0}
            </Text>
            <Text className="text-slate-400 text-[8px] font-black uppercase tracking-widest">ECO-PTS</Text>
          </View>
          <View className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-[2rem] items-center">
            <Crown size={20} color="#eab308" />
            <Text className="text-[#020617] text-[10px] font-black italic tracking-tighter mt-2 uppercase">
              {profile?.subscription_tier || 'Starter'}
            </Text>
            <Text className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Plan</Text>
          </View>
        </MotiView>

        {/* Info Ville */}
        {profile?.city && (
          <View className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-row items-center mb-8">
            <View className="w-2 h-2 rounded-full bg-primary mr-3" />
            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zone : </Text>
            <Text className="text-[10px] font-black text-[#020617] uppercase tracking-widest">{profile.city}</Text>
          </View>
        )}

        {/* Menu paramètres */}
        <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Paramètres</Text>
        <View className="mb-8">
          {[
            { icon: Crown, label: 'Abonnement', value: profile?.subscription_tier || 'Starter', route: '/(tabs)/abonnements', color: '#eab308' },
            { icon: Settings, label: 'Paramètres', route: '/(tabs)/settings', color: '#64748b' },
            { icon: Shield, label: 'Sécurité', color: '#64748b' },
            { icon: Mail, label: 'Support CITICLINE', color: '#64748b' }
          ].map((item, i) => (
            <TouchableOpacity 
              key={i}
              onPress={() => item.route && router.push(item.route as any)}
              className="flex-row items-center justify-between py-5 border-b border-slate-50"
            >
              <View className="flex-row items-center">
                <item.icon size={18} color={item.color} />
                <Text className="ml-4 text-[11px] font-bold text-[#020617] uppercase tracking-widest">{item.label}</Text>
              </View>
              <View className="flex-row items-center">
                {item.value && <Text className="text-[9px] font-black text-amber-600 mr-2 uppercase">{item.value}</Text>}
                <ChevronRight size={14} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="w-full py-6 mt-4 flex-row items-center justify-center bg-red-50 rounded-2xl"
        >
          <LogOut size={16} color="#ef4444" />
          <Text className="text-[#ef4444] font-black uppercase tracking-widest text-[10px] ml-2">Déconnexion</Text>
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
