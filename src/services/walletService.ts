import { supabase } from '@/lib/supabase';
import { safeFetch } from '../utils/safeFetch';
import { logError } from '../utils/logger';

// 1. Récupération des transactions (historique des collectes/ventes liés au wallet)
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

  return result.data;
};

// 2. Créditer le compte
export const creditWallet = async (userId: string, amount: number) => {
  // 1. Créer la transaction de traçabilité
  const { error: txError } = await supabase.from('transactions').insert({
    user_id: userId,
    type: 'credit',
    amount,
    status: 'success',
    description: 'Crédit wallet'
  });

  if (txError) {
    logError('transaction error', txError);
    return false;
  }

  // 2. Update secure du wallet (via fonction RPC)
  const { error: walletError } = await supabase.rpc('increment_wallet', {
    user_id_input: userId,
    amount_input: amount
  });

  if (walletError) {
    logError('wallet update error', walletError);
    return false;
  }

  return true;
};

// 3. Débiter le compte
export const debitWallet = async (userId: string, amount: number) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();

  if (!profile || (profile.wallet_balance || 0) < amount) {
    logError('Solde insuffisant pour le débit');
    return false;
  }

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'debit',
    amount,
    status: 'success',
    description: 'Retrait'
  });

  // Appel RPC pour décrémenter
  const { error } = await supabase.rpc('increment_wallet', {
    user_id_input: userId,
    amount_input: -amount
  });

  if (error) {
    logError('wallet debit error', error);
    return false;
  }

  return true;
};
