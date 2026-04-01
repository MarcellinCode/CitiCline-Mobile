import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StyleSheet, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { 
  Bell, 
  Lock, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Info,
  CircleHelp,
  Globe,
  FileText
} from 'lucide-react-native';
import { Header } from '@/components/Header';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: () => router.replace('/(auth)/login' as any) 
        }
      ]
    );
  };

  const settingsGroups = [
    {
      title: "Préférences",
      items: [
        { icon: Bell, title: "Notifications", subtitle: "Gérer les alertes", route: ROUTES.NOTIFICATIONS, color: "#6366f1" },
        { icon: Globe, title: "Langue", subtitle: "Français (Standard)", color: "#0ea5e9" },
      ]
    },
    {
      title: "Sécurité",
      items: [
        { icon: Lock, title: "Mot de passe", subtitle: "Modifier votre accès", route: ROUTES.SETTINGS_SECURITY, color: "#f59e0b" },
        { icon: Shield, title: "Confidentialité", subtitle: "Données personnelles", route: ROUTES.SETTINGS_PRIVACY, color: "#10b981" },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: CircleHelp, title: "Centre d'aide", subtitle: "FAQ et guides", route: ROUTES.SETTINGS_HELP, color: "#8b5cf6" },
        { icon: FileText, title: "Conditions", subtitle: "Mentions légales", route: ROUTES.SETTINGS_TERMS, color: "#64748b" },
        { icon: Info, title: "À propos", subtitle: "Version 1.0.4 (Bêta)", route: ROUTES.SETTINGS_HELP, color: "#94a3b8" },
      ]
    }
  ];

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title="Paramètres" 
        subtitle="CONFIGURATION & SÉCURITÉ"
        onBack={() => navigateSafe(router, ROUTES.ESPACE)}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        {settingsGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.groupContainer}>
            <HubText variant="label" className="text-zinc-400 mb-4 ml-1 italic tracking-widest">
              {group.title}
            </HubText>
            <HubCard className="p-0 overflow-hidden mb-8 border-2 border-zinc-50">
              {group.items.map((item, iIdx) => (
                <TouchableOpacity 
                  key={iIdx} 
                  style={[
                    styles.listItem,
                    iIdx === group.items.length - 1 ? { borderBottomWidth: 0 } : {}
                  ]}
                  onPress={() => item.route 
                    ? router.push(item.route as any) 
                    : Alert.alert("Information", "Cette fonctionnalité est en cours de déploiement.") 
                  }
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.iconBg, { backgroundColor: `${item.color}10` }]}>
                      <item.icon size={20} color={item.color} />
                    </View>
                    <View>
                      <Text style={styles.listItemText}>{item.title}</Text>
                      <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </HubCard>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          RecyCla Mobile — Fièrement propulsé par Citicline
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  scrollView: { flex: 1, paddingHorizontal: 32 },
  groupContainer: { marginBottom: 8 },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 16 
  },
  listItemText: { fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1 },
  listItemSubtitle: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 24, 
    backgroundColor: '#fef2f2', 
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginTop: 20
  },
  logoutText: { marginLeft: 12, color: '#ef4444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 13 },
  footerText: { 
    textAlign: 'center', 
    color: '#cbd5e1', 
    fontSize: 10, 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    letterSpacing: 1,
    marginTop: 40,
    marginBottom: 20
  }
});
