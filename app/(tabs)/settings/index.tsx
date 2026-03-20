import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Settings, Bell, Lock, Shield, CircleHelp } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.listContainer}>
          {[
            { icon: Bell, title: "Notifications", route: '/notifications' },
            { icon: Lock, title: "Sécurité" },
            { icon: Shield, title: "Confidentialité" },
            { icon: CircleHelp, title: "Aide & Support" },
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.listItem}
              onPress={() => item.route ? router.push(item.route as any) : null}
            >
              <View style={styles.listItemLeft}>
                <item.icon size={20} color="#64748b" />
                <Text style={styles.listItemText}>{item.title}</Text>
              </View>
              <ChevronLeft size={16} color="#cbd5e1" style={styles.chevronIcon} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 32, paddingTop: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  iconBtn: { width: 48, height: 48, backgroundColor: '#f8fafc', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  scrollView: { flex: 1, paddingHorizontal: 32, paddingBottom: 80 },
  listContainer: { flexDirection: 'column', gap: 24 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  listItemLeft: { flexDirection: 'row', alignItems: 'center' },
  listItemText: { marginLeft: 16, fontSize: 14, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', letterSpacing: 2 },
  chevronIcon: { transform: [{ rotate: '180deg' }] }
});
