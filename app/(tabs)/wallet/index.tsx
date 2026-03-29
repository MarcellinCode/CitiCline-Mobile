import * as React from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Leaf, RefreshCw } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { useProfile } from '@/hooks/useProfile';
import { useWallet } from '@/hooks/useWallet';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { HubButton } from '@/components/ui/HubButton';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';
import { Header } from '@/components/Header';
import { navigateSafe } from '@/utils/navigation';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { transactions, loading, refresh } = useWallet(profile?.id);

  const handleWithdraw = () => {
    Alert.alert(
      "Demande de Retrait",
      "Souhaitez-vous retirer vos gains vers votre compte Mobile Money (Wave/Orange/MTN) ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Retirer", 
          onPress: () => Alert.alert("Succès", "Votre demande de retrait a été transmise au HUB. Traitement en cours (est. 2h).") 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title="Portefeuille" 
        subtitle="SOLDE DISPONIBLE" 
        onBack={() => navigateSafe(router, ROUTES.ESPACE)}
        rightAction={
          <TouchableOpacity 
              onPress={refresh} 
              className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-xl shadow-zinc-200/50 border border-zinc-50"
          >
            <RefreshCw size={18} color="#020617" />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        {/* Main Balance Section */}
        <View className="px-8 mb-12 items-center">
            <View className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] items-center justify-center mb-8 shadow-sm">
              <WalletIcon size={32} color="#2A9D8F" strokeWidth={2.5} />
            </View>
            <HubText variant="label" className="text-zinc-400 italic mb-4">SOLDE DISPONIBLE</HubText>
            
            {profileLoading ? (
              <ActivityIndicator color="#2A9D8F" />
            ) : (
              <View className="flex-row items-baseline gap-2 mb-8">
                <HubText variant="h1" className="text-6xl text-zinc-900 italic">
                  {formatCurrency(profile?.wallet_balance)}
                </HubText>
                <HubText variant="h2" className="text-primary italic">FCFA</HubText>
              </View>
            )}

            {/* Eco-Points Bento */}
            <View className="bg-zinc-900 px-6 py-3 rounded-full flex-row items-center gap-3 shadow-xl shadow-zinc-900/40">
              <Leaf size={16} color="#E9C46A" strokeWidth={3} />
              <HubText variant="label" className="text-white mb-0 text-[9px] tracking-[0.2em]">
                {profile?.eco_points || 0} ECO-POINTS HUB
              </HubText>
            </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-4 px-8 mb-12">
            <HubButton 
                variant="primary" 
                className="flex-1 h-16 rounded-[1.5rem]" 
                onPress={handleWithdraw}
                disabled={(profile?.wallet_balance || 0) < 500}
                icon={<ArrowDownLeft size={18} color="white" />}
            >
                { (profile?.wallet_balance || 0) < 500 ? 'SOLDE BAS' : 'RETIRER' }
            </HubButton>
            <TouchableOpacity 
                onPress={refresh}
                className="w-16 h-16 bg-zinc-50 rounded-[1.5rem] items-center justify-center border border-zinc-100"
            >
                <ArrowUpRight size={24} color="#475569" strokeWidth={2.5} />
            </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View className="bg-zinc-50 rounded-t-[4rem] border-t border-zinc-100 px-8 pt-10 pb-20">
          <View className="flex-row justify-between items-center mb-10 mx-2">
            <HubText variant="label" className="text-zinc-400 italic">HISTORIQUE RÉCENT</HubText>
            <TouchableOpacity>
                <HubText variant="label" className="text-primary italic text-[8px]">VOIR TOUT</HubText>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator color="#2A9D8F" />
            </View>
          ) : transactions.length === 0 ? (
            <View className="py-20 items-center">
              <HubText variant="label" className="text-zinc-300">Aucune transaction</HubText>
            </View>
          ) : (
            <View className="gap-6">
              {transactions.map((tx: any, i: number) => {
                const isIncome = !!tx.seller_id && tx.status === 'collected';
                const amount = (tx.final_weight || tx.estimated_weight) * (tx.waste_types?.price_per_kg || 0);
                return (
                  <View key={tx.id}>
                    <HubCard className="p-5 border-0 bg-white shadow-sm flex-row items-center">
                        <View className={cn(
                            "w-12 h-12 rounded-2xl items-center justify-center mr-4",
                            isIncome ? "bg-emerald-50" : "bg-red-50"
                        )}>
                            <ArrowDownLeft 
                                size={20} 
                                color={isIncome ? '#10b981' : '#ef4444'} 
                                strokeWidth={3}
                                style={{ transform: [{ rotate: isIncome ? '0deg' : '180deg' }] }}
                            />
                        </View>
                        <View className="flex-1">
                            <HubText variant="h3" className="text-zinc-900 text-[11px] mb-[-2]">
                                {tx.waste_types?.name || 'Recyclage'}
                            </HubText>
                            <HubText variant="caption" className="text-zinc-400 text-[8px] uppercase tracking-widest">
                                {tx.final_weight || tx.estimated_weight} KG · {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'DATE ?'}
                            </HubText>
                        </View>
                        <HubText 
                            variant="h3" 
                            className={cn(
                                "text-sm",
                                isIncome ? "text-emerald-500" : "text-red-500"
                            )}
                        >
                            {isIncome ? '+' : '-'}{formatCurrency(amount)}
                        </HubText>
                    </HubCard>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
