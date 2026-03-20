import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Search, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  MoreVertical
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { MotiView } from 'moti';

interface Agent {
  id: string;
  full_name: string;
  phone: string;
  eco_points: number;
  wallet_balance: number;
  status?: 'active' | 'offline';
}

export default function AgentsManagement() {
  const router = useRouter();
  const { profile } = useProfile();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      if (!profile?.id) return;
      
      // Simulation pour l'instant ou requête réelle si organization_id existe
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent_collecteur'); // A affiner avec organization_id plus tard
      
      if (data) {
        setAgents(data as Agent[]);
      }
      setLoading(false);
    }

    fetchAgents();
  }, [profile]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        headerTitle: "NOS AGENTS",
        headerTitleStyle: { fontWeight: '900' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        ),
        headerShadowVisible: false
      }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBoxBlue}>
            <Text style={styles.statLabelBlue}>Effectif</Text>
            <Text style={styles.statValueBlue}>{agents.length}</Text>
          </View>
          <View style={styles.statBoxGreen}>
            <Text style={styles.statLabelGreen}>Performance</Text>
            <Text style={styles.statValueGreen}>+12%</Text>
          </View>
        </View>

        {/* Search & Actions */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <Text style={styles.searchPlaceholder}>Chercher un agent...</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => alert("Pour des raisons de sécurité, l'ajout et la gestion de vos agents se fait directement sur le Portail Web B2B (Mairie/Entreprise).")}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Agents List */}
        <Text style={styles.sectionTitle}>Liste des Collaborateurs</Text>
        
        {loading ? (
          <ActivityIndicator color="#6366f1" style={{ marginTop: 80 }} />
        ) : agents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User size={48} color="#f1f5f9" />
            <Text style={styles.emptyText}>Aucun agent trouvé</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {agents.map((agent, index) => (
              <MotiView
                key={agent.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 100 * index }}
                style={styles.agentCard}
              >
                <View style={styles.agentAvatarBg}>
                  <User size={24} color="#64748b" />
                </View>
                
                <View style={styles.agentInfo}>
                  <View style={styles.agentNameRow}>
                    <Text style={styles.agentName}>{agent.full_name}</Text>
                    <View style={styles.statusDot} />
                  </View>
                  <Text style={styles.agentPhone}>{agent.phone}</Text>
                </View>

                <View style={styles.agentRight}>
                   <Text style={styles.agentBalance}>{agent.wallet_balance?.toLocaleString() || '0'} $</Text>
                   <TouchableOpacity style={styles.moreBtn}>
                      <MoreVertical size={16} color="#94a3b8" />
                   </TouchableOpacity>
                </View>
              </MotiView>
            ))}
          </View>
        )}

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
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statBoxBlue: { flex: 1, backgroundColor: '#eef2ff', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#e0e7ff' },
  statLabelBlue: { color: '#4f46e5', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  statValueBlue: { fontSize: 24, fontWeight: '900', color: '#1e1b4b' },
  statBoxGreen: { flex: 1, backgroundColor: '#ecfdf5', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#d1fae5' },
  statLabelGreen: { color: '#059669', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  statValueGreen: { fontSize: 24, fontWeight: '900', color: '#022c22' },
  searchSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  searchPlaceholder: { marginLeft: 12, color: '#94a3b8', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: -0.5 },
  addBtn: { width: 56, height: 56, backgroundColor: '#0f172a', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(15, 23, 42, 0.2)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 15, elevation: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
  emptyContainer: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: -0.5, marginTop: 16 },
  listContainer: { flexDirection: 'column', gap: 16 },
  agentCard: { backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9', padding: 20, borderRadius: 32, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  agentAvatarBg: { width: 56, height: 56, backgroundColor: '#f8fafc', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  agentInfo: { flex: 1, marginLeft: 16 },
  agentNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  agentName: { fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  agentPhone: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: -0.5, marginTop: 2 },
  agentRight: { alignItems: 'flex-end' },
  agentBalance: { fontSize: 10, fontWeight: '900', color: '#059669', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 4 },
  moreBtn: { padding: 8, backgroundColor: '#f8fafc', borderRadius: 8 }
});
