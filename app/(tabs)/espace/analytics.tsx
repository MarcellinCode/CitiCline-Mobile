import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, BarChart3, TrendingUp, Package, Users, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';

export default function AnalyticsScreen() {
  const router = useRouter();

  const stats = [
    { label: "Poids Total", value: "1,280 kg", icon: Package, color: "#2aa275" },
    { label: "Croissance", value: "+12.5%", icon: TrendingUp, color: "#6366f1" },
    { label: "Agents Actifs", value: "8", icon: Users, color: "#f59e0b" },
    { label: "Énergie Économisée", value: "450 kWh", icon: Zap, color: "#ef4444" },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        headerTitle: "ANALYTIQUE",
        headerTitleStyle: { fontWeight: '900' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        ),
        headerShadowVisible: false
      }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <MotiView 
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.headerMoti}
        >
          <Text style={styles.reportSubtitle}>Rapport de Performance</Text>
          <Text style={styles.reportTitle}>Impact Zone</Text>
        </MotiView>

        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View 
              key={i} 
              style={styles.statCard}
            >
              <View style={[styles.statIconBg, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.noteContainer}>
             <Text style={styles.noteTitle}>Note B2B</Text>
             <Text style={styles.noteText}>
               "Les rapports détaillés par concession et les exports CSV sont disponibles uniquement sur le tableau de bord Web CITICLINE."
             </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  headerBackBtn: { marginLeft: 16, padding: 8, backgroundColor: '#f8fafc', borderRadius: 12 },
  scrollView: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  headerMoti: { marginBottom: 32 },
  reportSubtitle: { color: '#94a3b8', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  reportTitle: { fontSize: 32, fontWeight: '900', color: '#020617', fontStyle: 'italic', letterSpacing: -1, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  statCard: { width: '47%', backgroundColor: '#f8fafc', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', marginBottom: 16 },
  statIconBg: { marginBottom: 16, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#020617', textAlign: 'center' },
  noteContainer: { marginTop: 32, padding: 32, backgroundColor: '#0f172a', borderRadius: 40, overflow: 'hidden' },
  noteTitle: { color: '#2aa275', fontWeight: '900', textTransform: 'uppercase', fontSize: 10, letterSpacing: 2, marginBottom: 8 },
  noteText: { color: 'white', fontWeight: 'bold', lineHeight: 20, fontStyle: 'italic' }
});
