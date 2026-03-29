import { View, Text, TouchableOpacity, ScrollView, Platform, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { 
  Settings, 
  Bell, 
  Lock, 
  Shield, 
  Globe, 
  Smartphone, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Info,
  CircleHelp
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }]}>
        <TouchableOpacity onPress={() => navigateSafe(router, ROUTES.ESPACE)} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 48 }} />
      </View>



      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        <View style={styles.listContainer}>
          {[
            { icon: Bell, title: "Notifications", route: ROUTES.NOTIFICATIONS },
            { icon: Lock, title: "Sécurité" },
            { icon: Shield, title: "Confidentialité" },
            { icon: CircleHelp, title: "Aide & Support" },
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.listItem}
              onPress={() => item.route ? router.push(item.route as any) : Alert.alert("Bientôt disponible", "Cette section sera activée dans la prochaine mise à jour.") }
            >
              <View style={styles.listItemLeft}>
                <item.icon size={20} color="#64748b" />
                <Text style={styles.listItemText}>{item.title}</Text>
              </View>
              <ChevronRight size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  listContainer: { flexDirection: 'column', gap: 24 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  listItemLeft: { flexDirection: 'row', alignItems: 'center' },
  listItemText: { marginLeft: 16, fontSize: 14, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', letterSpacing: 2 },
  chevronIcon: { transform: [{ rotate: '180deg' }] }
});
