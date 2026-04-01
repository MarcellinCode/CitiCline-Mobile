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
    // 1. Récupérer le solde actuel pour un calcul précis
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (pError) throw pError;

    const currentBalance = Number(profile?.wallet_balance || 0);
    const newBalance = currentBalance + amount;

    // 2. Tenter d'enregistrer la transaction
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'income',
      amount,
      description: 'Recharge Portefeuille (Simulation)'
    });

    if (txError) {
      console.warn('[SIMULATION] Transaction log failed (RLS?):', txError.message);
      // On continue quand même la mise à jour du solde si possible
    }

    // 3. Mettre à jour le solde du profil
    const { error: walletError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (walletError) throw walletError;

    return { success: true, balance: newBalance };
  } catch (err: any) {
    console.error('creditWallet error:', err?.message);
    return { success: false, error: err?.message };
  }
};

// 3. Débiter le compte (pour abonnement ou autre) — Mode Simulation
export const debitWallet = async (userId: string, amount: number) => {
  try {
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (pError) throw pError;

    const currentBalance = Number(profile?.wallet_balance || 0);
    if (currentBalance < amount) {
      return { success: false, error: 'Solde insuffisant' };
    }

    const newBalance = currentBalance - amount;

    // 2. Tenter d'enregistrer la transaction
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'outcome',
      amount: -amount,
      description: 'Paiement Service (Simulation)'
    });

    if (txError) {
      console.warn('[SIMULATION] Debit log failed (RLS?):', txError.message);
    }

    // 3. Mettre à jour le solde du profil
    const { error: walletError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (walletError) throw walletError;

    return { success: true, balance: newBalance };
  } catch (err: any) {
    console.error('debitWallet error:', err?.message);
    return { success: false, error: err?.message };
  }
};

// 4. Retrait vers Mobile Money — Mode Simulation
export const withdrawToMobile = async (userId: string, amount: number, phone: string) => {
  // Simule un délai de traitement réseau
  await new Promise(r => setTimeout(r, 1500));
  console.log(`[SIMULATION] Retrait de ${amount} CFA vers ${phone} pour l'utilisateur ${userId}`);
  return { success: true };
};
