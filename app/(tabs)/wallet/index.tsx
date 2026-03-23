import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Leaf, RefreshCw } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { MotiView } from 'moti';
import { useProfile } from '@/hooks/useProfile';
import { useWallet } from '@/hooks/useWallet';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { transactions, loading, refresh } = useWallet(profile?.id);

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }]}>
        <TouchableOpacity onPress={() => navigateSafe(router, ROUTES.ESPACE)} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portefeuille</Text>
        <TouchableOpacity onPress={refresh} style={styles.iconBtn}>
          <RefreshCw size={18} color="#020617" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        {/* Solde Principal */}
        <View style={styles.balanceSection}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.balanceContainer}
          >
            <View style={styles.walletIconBg}>
              <WalletIcon size={32} color="#2aa275" />
            </View>
            <Text style={styles.balanceLabel}>Solde Disponible</Text>
            {profileLoading ? (
              <ActivityIndicator color="#2aa275" />
            ) : (
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>
                  {(profile?.wallet_balance || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                </Text>
                <Text style={styles.balanceCurrency}>FCFA</Text>
              </View>
            )}

            {/* Eco-Points */}
            <View style={styles.ecoPointsBadge}>
              <Leaf size={14} color="#2aa275" />
              <Text style={styles.ecoPointsText}>
                {profile?.eco_points || 0} ECO-POINTS
              </Text>
            </View>
          </MotiView>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.primaryActionBtn}>
              <Text style={styles.primaryActionText}>Retirer Fonds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryActionBtn}>
              <ArrowUpRight size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Historique des transactions */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Historique</Text>
            <TouchableOpacity>
              <Text style={styles.historyViewAll}>Voir Tout</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.centerPad}>
              <ActivityIndicator color="#2aa275" />
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.centerPad}>
              <Text style={styles.emptyText}>
                Aucune transaction
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {transactions.map((tx: any, i: number) => {
                const isIncome = !!tx.seller_id && tx.status === 'collected';
                const amount = (tx.final_weight || tx.estimated_weight) * (tx.waste_types?.price_per_kg || 0);
                return (
                  <MotiView
                    key={tx.id}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 100 * i }}
                    style={styles.txCard}
                  >
                    <View style={styles.txIconBg}>
                      <ArrowDownLeft size={20} color={isIncome ? '#2aa275' : '#ef4444'} />
                    </View>
                    <View style={styles.txContent}>
                      <Text style={styles.txTitle}>
                        {tx.waste_types?.name || 'Recyclage'}
                      </Text>
                      <Text style={styles.txSubtitle}>
                        {tx.final_weight || tx.estimated_weight} kg · {tx.created_at ? new Date(tx.created_at).toISOString().split('T')[0].split('-').reverse().join('/') : 'Date inconnue'}
                      </Text>
                    </View>
                    <Text style={[styles.txAmount, { color: isIncome ? '#2aa275' : '#ef4444' }]}>
                      {isIncome ? '+' : '-'}{amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA
                    </Text>
                  </MotiView>
                );
              })}
            </View>
          )}
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
  scrollView: { flex: 1 },
  balanceSection: { paddingHorizontal: 32, marginBottom: 48, alignItems: 'center' },
  balanceContainer: { alignItems: 'center' },
  walletIconBg: { width: 64, height: 64, backgroundColor: 'rgba(42, 162, 117, 0.1)', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  balanceLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline' },
  balanceAmount: { fontSize: 60, fontWeight: '900', color: '#020617', fontStyle: 'italic', letterSpacing: -2 },
  balanceCurrency: { fontSize: 20, fontWeight: 'bold', color: '#10b981', marginLeft: 8, textTransform: 'uppercase', fontStyle: 'italic' },
  ecoPointsBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: '#ecfdf5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, borderColor: '#d1fae5' },
  ecoPointsText: { marginLeft: 8, fontSize: 10, fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: 2 },
  actionsRow: { flexDirection: 'row', gap: 16, marginTop: 40, width: '100%' },
  primaryActionBtn: { flex: 1, backgroundColor: '#020617', paddingVertical: 20, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  primaryActionText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 },
  secondaryActionBtn: { width: 64, height: 64, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  historySection: { backgroundColor: 'rgba(248, 250, 252, 0.5)', borderTopLeftRadius: 48, borderTopRightRadius: 48, paddingHorizontal: 32, paddingTop: 40, paddingBottom: 80, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  historyTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3 },
  historyViewAll: { fontSize: 10, fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: 2 },
  centerPad: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 },
  listContainer: { flexDirection: 'column', gap: 16 },
  txCard: { backgroundColor: 'white', padding: 20, borderRadius: 32, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, borderWidth: 1, borderColor: '#f8fafc', marginBottom: 16 },
  txIconBg: { width: 48, height: 48, backgroundColor: '#f8fafc', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  txContent: { flex: 1 },
  txTitle: { fontSize: 11, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  txSubtitle: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  txAmount: { fontSize: 14, fontWeight: '900' }
});
