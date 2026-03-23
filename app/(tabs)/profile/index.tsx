import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  super_admin: 'Super Admin',
};

const ROLE_COLORS: Record<string, string> = {
  vendeur: '#2aa275',
  collecteur: '#3b82f6',
  entreprise: '#6366f1',
  organisation_admin: '#8b5cf6',
  agent_collecteur: '#f59e0b',
  mairie: '#020617',
  super_admin: '#ef4444',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading } = useProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#2aa275" />
      </View>
    );
  }

  const roleColor = ROLE_COLORS[profile?.role || 'vendeur'] || '#2aa275';
  const roleLabel = ROLE_LABELS[profile?.role || 'vendeur'] || 'Membre';

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }]}>
        <Text style={styles.headerTitle}>Mon Compte</Text>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
          <Bell size={20} color="#020617" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >

        {/* Avatar & Identité */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.avatarSection}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <User size={50} color="#cbd5e1" />
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Camera size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {profile?.full_name || 'Utilisateur CITICLINE'}
          </Text>
          
          {/* Badge rôle */}
          <View style={[styles.roleBadge, { backgroundColor: `${roleColor}15` }]}>
            <Text style={[styles.roleBadgeText, { color: roleColor }]}>
              {roleLabel}
            </Text>
          </View>
        </MotiView>

        {/* Stats rapides */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100 }}
          style={styles.statsRow}
        >
          <View style={styles.statBoxDark}>
            <Wallet size={20} color="#2aa275" />
            <Text style={styles.statValueWhite}>
              {profile?.wallet_balance?.toLocaleString('fr-FR') || '0'}
            </Text>
            <Text style={styles.statLabelMuted}>FCFA</Text>
          </View>
          <View style={styles.statBoxGreen}>
            <Leaf size={20} color="#2aa275" />
            <Text style={styles.statValueDark}>
              {profile?.eco_points || 0}
            </Text>
            <Text style={styles.statLabelMuted}>ECO-PTS</Text>
          </View>
          <View style={styles.statBoxLight}>
            <Crown size={20} color="#eab308" />
            <Text style={styles.statValueSmallDark}>
              {profile?.subscription_tier || 'Starter'}
            </Text>
            <Text style={styles.statLabelMuted}>Plan</Text>
          </View>
        </MotiView>

        {/* Info Ville */}
        {profile?.city && (
          <View style={styles.cityInfo}>
            <View style={styles.cityDot} />
            <Text style={styles.cityLabel}>Zone : </Text>
            <Text style={styles.cityValue}>{profile.city}</Text>
          </View>
        )}

        {/* Menu paramètres */}
        <Text style={styles.menuSectionTitle}>Paramètres</Text>
        <View style={styles.menuContainer}>
          {profile?.role === 'super_admin' && (
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://recycla-admin.vercel.app/admin')}
              style={styles.adminBtn}
            >
              <View style={styles.adminBtnLeft}>
                <Shield size={20} color="#ef4444" />
                <View style={styles.adminBtnTexts}>
                  <Text style={styles.adminBtnTitle}>Dashboard Super Admin</Text>
                  <Text style={styles.adminBtnSubtitle}>Contrôle Total Plateforme</Text>
                </View>
              </View>
              <ChevronRight size={16} color="white" />
            </TouchableOpacity>
          )}

          {[
            { icon: Crown, label: 'Abonnement', value: profile?.subscription_tier || 'Starter', route: '/(tabs)/abonnements', color: '#eab308' },
            { icon: Settings, label: 'Paramètres', route: '/(tabs)/settings', color: '#64748b' },
            { icon: Shield, label: 'Sécurité', color: '#64748b' },
            { icon: Mail, label: 'Support CITICLINE', color: '#64748b' }
          ].map((item, i) => (
            <TouchableOpacity 
              key={i}
              onPress={() => item.route && router.push(item.route as any)}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={18} color={item.color} />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
                <ChevronRight size={14} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <LogOut size={16} color="#ef4444" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  safeArea: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  notificationBtn: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  scrollView: { flex: 1, paddingHorizontal: 32, paddingBottom: 80 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 112, height: 112, backgroundColor: '#f8fafc', borderRadius: 56, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden', marginBottom: 16 },
  cameraBtn: { position: 'absolute', bottom: 8, right: 0, width: 36, height: 36, backgroundColor: '#020617', borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  userName: { fontSize: 20, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, marginBottom: 4 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 9999, marginTop: 4 },
  roleBadgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  statBoxDark: { flex: 1, backgroundColor: '#0f172a', padding: 20, borderRadius: 32, alignItems: 'center' },
  statBoxGreen: { flex: 1, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', padding: 20, borderRadius: 32, alignItems: 'center' },
  statBoxLight: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', padding: 20, borderRadius: 32, alignItems: 'center' },
  statValueWhite: { color: 'white', fontSize: 18, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1, marginTop: 8 },
  statValueDark: { color: '#020617', fontSize: 18, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1, marginTop: 8 },
  statValueSmallDark: { color: '#020617', fontSize: 10, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1, marginTop: 8, textTransform: 'uppercase' },
  statLabelMuted: { color: '#94a3b8', fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  cityInfo: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  cityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 12 },
  cityLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 2 },
  cityValue: { fontSize: 10, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  menuSectionTitle: { fontSize: 10, fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 },
  menuContainer: { marginBottom: 32 },
  adminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 24, backgroundColor: '#0f172a', paddingHorizontal: 24, borderRadius: 24, marginBottom: 16, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  adminBtnLeft: { flexDirection: 'row', alignItems: 'center' },
  adminBtnTexts: { marginLeft: 16 },
  adminBtnTitle: { fontSize: 11, fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: 2 },
  adminBtnSubtitle: { fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4, fontStyle: 'italic' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemLabel: { marginLeft: 16, fontSize: 11, fontWeight: 'bold', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  menuItemValue: { fontSize: 9, fontWeight: '900', color: '#d97706', marginRight: 8, textTransform: 'uppercase' },
  logoutBtn: { width: '100%', paddingVertical: 24, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', borderRadius: 16 },
  logoutText: { color: '#ef4444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginLeft: 8 }
});
