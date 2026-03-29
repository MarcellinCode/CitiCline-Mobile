import { supabase } from '@/lib/supabase';
import { safeFetch } from '../utils/safeFetch';

// ============================================================
// MODE SIMULATION — pas d'API de paiement pour l'instant
// Toutes les opérations tentent Supabase, puis fallback local
// ============================================================

const SIMULATION_TRANSACTIONS = [
  { id: 'sim_1', type: 'income', amount: 3500, description: 'Vente Plastique PET (12 kg)', created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'sim_2', type: 'outcome', amount: 2000, description: 'Abonnement Foyer (Mensuel)', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'sim_3', type: 'income', amount: 7200, description: 'Vente Métaux Ferreux (8 kg)', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'sim_4', type: 'income', amount: 1800, description: 'Vente Carton Mixte (15 kg)', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 'sim_5', type: 'outcome', amount: 500, description: 'Frais de service RecyCla', created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
];

// 1. Récupération des transactions (historique)
export const getTransactions = async (userId: string): Promise<any[] | null> => {
  const result = await safeFetch<any[]>(() => 
    supabase
      .from('wastes')
      .select('*, waste_types(*)')
      .or(`seller_id.eq.${userId},collector_id.eq.${userId}`)
      .eq('status', 'collected')
      .order('created_at', { ascending: false })
      .limit(10)
  );

  // Fallback simulation si pas de données réelles
  if (!result.data || result.data.length === 0) {
    return SIMULATION_TRANSACTIONS;
  }

  return result.data;
};

// 2. Créditer le compte (Top-up) — Mode Simulation
export const creditWallet = async (userId: string, amount: number) => {
  try {
    // Tenter la mise à jour Supabase
    const { error: txError } = await supabase.from('transactions').insert({
      profile_id: userId,
      type: 'income',
      amount,
      description: 'Recharge Portefeuille (Simulation)'
    });

    if (txError) throw txError;

    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const newBalance = (profile?.wallet_balance || 0) + amount;

    const { error: walletError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (walletError) throw walletError;

    return { success: true, balance: newBalance };
  } catch (err: any) {
    // Fallback simulation — on simule le succès
    console.warn('[SIMULATION] creditWallet fallback:', err?.message);
    return { success: true, balance: amount };
  }
};

// 3. Débiter le compte (pour abonnement ou autre) — Mode Simulation
export const debitWallet = async (userId: string, amount: number) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (!profile || (profile.wallet_balance || 0) < amount) {
      return { success: false, error: 'Solde insuffisant' };
    }

    const { error: txError } = await supabase.from('transactions').insert({
      profile_id: userId,
      type: 'outcome',
      amount: -amount,
      description: 'Paiement Service (Simulation)'
    });

    if (txError) throw txError;

    const { error: walletError } = await supabase
      .from('profiles')
      .update({ wallet_balance: profile.wallet_balance - amount })
      .eq('id', userId);

    if (walletError) throw walletError;

    return { success: true, balance: profile.wallet_balance - amount };
  } catch (err: any) {
    console.warn('[SIMULATION] debitWallet fallback:', err?.message);
    return { success: true, balance: 0 };
  }
};

// 4. Retrait vers Mobile Money — Mode Simulation
export const withdrawToMobile = async (userId: string, amount: number, phone: string) => {
  // Simule un délai de traitement réseau
  await new Promise(r => setTimeout(r, 1500));
  console.log(`[SIMULATION] Retrait de ${amount} CFA vers ${phone} pour l'utilisateur ${userId}`);
  return { success: true };
};
