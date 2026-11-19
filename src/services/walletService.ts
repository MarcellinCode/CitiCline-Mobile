import { supabase } from '@/lib/supabase';
import { ActionResult, ServiceResult, Transaction } from '@/lib/types';
import { getErrorMessage, safeFetch } from '../utils/safeFetch';

// 1. Récupération des transactions (compatible profile_id et user_id)
export const getTransactions = async (
  userId: string
): Promise<ServiceResult<Transaction[]>> => {
  if (!userId) {
    return { data: [], error: null };
  }

  return safeFetch<Transaction[]>(() =>
    supabase
      .from('transactions')
      .select('id, user_id, amount, type, description, status, reference, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
  );
};

// 2. Créditer le compte (Top-up sécurisé via RPC)
export const creditWallet = async (
  userId: string,
  amount: number
): Promise<ActionResult<{ balance: number }>> => {
  if (!userId) return { success: false, error: 'Utilisateur non identifié.' };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: 'Le montant doit être supérieur à 0.' };
  }

  try {
    const { data: newBalance, error } = await supabase.rpc('fn_adjust_wallet_balance', {
      p_user_id: userId,
      p_amount: amount,
      p_operation_type: 'credit',
    });

    if (error) throw error;

    const balance = Number(newBalance);
    return { success: true, balance, data: { balance } };
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Impossible de créditer le portefeuille.');
    console.error('creditWallet error:', message);
    return { success: false, error: message };
  }
};

// 3. Débiter le compte (pour abonnement ou retrait)
export const debitWallet = async (
  userId: string,
  amount: number
): Promise<ActionResult<{ balance: number }>> => {
  if (!userId) return { success: false, error: 'Utilisateur non identifié.' };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: 'Le montant doit être supérieur à 0.' };
  }

  try {
    const { data: newBalance, error } = await supabase.rpc('fn_adjust_wallet_balance', {
      p_user_id: userId,
      p_amount: -amount,
      p_operation_type: 'debit',
    });

    if (error) throw error;

    const balance = Number(newBalance);
    return { success: true, balance, data: { balance } };
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Impossible de débiter le portefeuille.');
    console.error('debitWallet error:', message);
    return { success: false, error: message };
  }
};

// 4. Retrait vers Mobile Money (débite le solde réel via RPC sécurisée)
export const withdrawToMobile = async (
  userId: string,
  amount: number,
  phone?: string
): Promise<ActionResult<{ balance: number }>> => {
  if (!Number.isFinite(amount) || amount < 500) {
    return { success: false, error: 'Le montant minimum de retrait est de 500 FCFA.' };
  }
  if (!phone || phone.replace(/\D/g, '').length < 8) {
    return { success: false, error: 'Numéro Mobile Money invalide.' };
  }
  if (!userId) return { success: false, error: 'Utilisateur non identifié.' };

  try {
    // Débit + demande « En attente » validée ensuite par l'administration
    const { data: newBalance, error } = await supabase.rpc('fn_request_withdrawal', {
      p_amount: amount,
      p_phone: phone,
    });
    if (error) throw error;
    const balance = Number(newBalance);
    return { success: true, balance, data: { balance } };
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Demande de retrait impossible.');
    console.error('withdrawToMobile error:', message);
    return { success: false, error: message };
  }
};
