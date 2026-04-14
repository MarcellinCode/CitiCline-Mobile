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
import { creditWallet } from '@/services/walletService';

// On simule l'intégration PawaPay pour le moment
// En production, cela ouvrirait une URL de paiement ou un WebView.
const PAY_METHODS = [
    { id: 'mobile_money', label: 'Mobile Money', desc: 'Wave, Orange, MTN, Moov', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'card', label: 'Carte Bancaire', desc: 'Visa, Mastercard', color: 'bg-blue-50 text-blue-600' }
];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { transactions, loading, refresh } = useWallet(profile?.id);

  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [isCashedIn, setIsCashedIn] = useState(false);

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

  const handleTopUp = async () => {
    if (!amount || parseInt(amount) < 100) {
        Alert.alert("Erreur", "Le montant minimum est de 100 FCFA.");
        return;
    }
    
    setLoading(true);
    // Simulation du flux PawaPay
    setTimeout(async () => {
        try {
            const result = await creditWallet(profile?.id as string, parseInt(amount));
            if (result.success) {
                setIsCashedIn(true);
                setAmount('');
                setTimeout(() => {
                    setIsCashedIn(false);
                    setShowTopUp(false);
                    refresh();
                }, 2000);
            }
        } catch (err) {
            Alert.alert("Erreur", "La transaction n'a pas pu être validée.");
        } finally {
            setLoading(false);
        }
    }, 1500);
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
                className="flex-1 h-16 rounded-[2.5rem]" 
                onPress={() => setShowTopUp(true)}
                icon={<ArrowUpRight size={18} color="white" />}
            >
                RECHARGER
            </HubButton>
            <TouchableOpacity 
                onPress={handleWithdraw}
                disabled={(profile?.wallet_balance || 0) < 500}
                className={cn(
                    "w-16 h-16 rounded-[1.5rem] items-center justify-center border",
                    (profile?.wallet_balance || 0) < 500 ? "bg-zinc-50 border-zinc-100" : "bg-white border-primary/20"
                )}
            >
                <ArrowDownLeft size={24} color={(profile?.wallet_balance || 0) < 500 ? "#94a3b8" : "#2A9D8F"} strokeWidth={2.5} />
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
                const isIncome = tx.type === 'income' || tx.type === 'deposit';
                const amount = Math.abs(tx.amount);
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
                                {tx.description || 'Transaction'}
                            </HubText>
                            <HubText variant="caption" className="text-zinc-400 text-[8px] uppercase tracking-widest">
                                {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'DATE ?'}
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

      {/* Top-up Modal */}
      {showTopUp && (
          <View className="absolute inset-0 bg-zinc-900/60 items-center justify-end">
              <TouchableOpacity className="absolute inset-0" onPress={() => !loading && setShowTopUp(false)} />
              <HubCard className="w-full bg-white rounded-t-[3rem] p-10 pb-16">
                  {isCashedIn ? (
                      <View className="items-center py-10">
                          <View className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center mb-6">
                              <RefreshCw size={32} color="#10b981" />
                          </View>
                          <HubText variant="h2" className="text-zinc-900 mb-2">Paiement Validé</HubText>
                          <HubText variant="body" className="text-zinc-400">Votre solde a été mis à jour.</HubText>
                      </View>
                  ) : (
                      <>
                        <View className="flex-row justify-between items-center mb-10">
                            <HubText variant="h2" className="text-zinc-900">Recharger</HubText>
                            <TouchableOpacity onPress={() => setShowTopUp(false)}>
                                <HubText className="text-zinc-400 text-[10px] uppercase tracking-widest font-black">Fermer</HubText>
                            </TouchableOpacity>
                        </View>

                        <HubText variant="label" className="mb-4 text-zinc-400 italic">MONTANT (FCFA)</HubText>
                        <View className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex-row items-baseline gap-2 mb-10">
                            <HubText variant="h1" className="text-4xl text-zinc-900 italic mb-[-4]">{amount || '0'}</HubText>
                            <HubText variant="h3" className="text-primary italic">FCFA</HubText>
                        </View>

                        {/* Quick Num Pad Simulation */}
                        <View className="flex-row flex-wrap justify-between gap-4 mb-10">
                            {['1', '2', '3', '500', '1000', '2000', '5000', '⌫', '0'].map(k => (
                                <TouchableOpacity 
                                    key={k} 
                                    onPress={() => {
                                        if (k === '⌫') setAmount(prev => prev.slice(0, -1));
                                        else if (k === '0' || k === '1' || k === '2' || k === '3') setAmount(prev => prev + k);
                                        else setAmount(k);
                                    }}
                                    className="w-[30%] h-14 bg-zinc-50 rounded-2xl items-center justify-center border border-zinc-100"
                                >
                                    <HubText className="text-zinc-900 font-bold">{k}</HubText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <HubButton 
                            variant="primary" 
                            size="xl" 
                            loading={loading}
                            onPress={handleTopUp}
                        >
                            PAYER VIA MOBILE MONEY
                        </HubButton>
                        <HubText variant="caption" className="text-center mt-6 text-zinc-400 italic">
                            Sécurisé par PawaPay · Wave/Orange/MTN/Moov
                        </HubText>
                      </>
                  )}
              </HubCard>
          </View>
      )}
    </View>
  );
}
