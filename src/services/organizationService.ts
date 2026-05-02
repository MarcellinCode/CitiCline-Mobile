import { supabase } from '@/lib/supabase';
import { safeFetch } from '../utils/safeFetch';

/**
 * RÉCUPÉRATION DES GESTIONNAIRES (Mairies/Zones)
 * On récupère les concessions actives et leurs profils associés
 */
export const getOrganizationsNearby = async (city?: string) => {
  try {
    // 1. Récupérer les IDs des organisations ayant des concessions actives
    let concessionsQuery = supabase
      .from('concessions')
      .select('organization_id')
      .eq('status', 'active');
    
    if (city) {
      concessionsQuery = concessionsQuery.ilike('city', `%${city}%`);
    }
    
    const { data: concessions, error: cError } = await concessionsQuery;
    if (cError) throw cError;

    if (!concessions || concessions.length === 0) {
      return [];
    }

    // 2. Extraire les IDs uniques
    const uniqueOrgIds = [...new Set(concessions.map(c => c.organization_id).filter(Boolean))];

    if (uniqueOrgIds.length === 0) return [];

    // 3. Récupérer les profils complets pour ces IDs
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', uniqueOrgIds);

    if (pError) throw pError;
      
    return profiles || [];
  } catch (err: any) {
    console.error('getOrganizationsNearby error:', err?.message);
    throw err;
  }
};

/**
 * RÉCUPÉRATION DES PLANS D'ABONNEMENT POUR UNE ORGANISATION
 */
export const getOrganizationPlans = async (organizationId: string) => {
  try {
    const result = await safeFetch<any[]>(() => 
      supabase
        .from('subscription_plans')
        .select('*')
        .eq('organization_id', organizationId)
    );
    
    if (result.error) throw result.error;
    return result.data || [];
  } catch (err: any) {
    console.error('getOrganizationPlans error:', err?.message);
    throw err;
  }
};

/**
 * PROCESSUS DE PAIEMENT D'ABONNEMENT
 * Débite le citoyen et crédite l'organisation
 */
export const processSubscriptionPayment = async (userId: string, orgId: string, amount: number, orgName: string, userName: string) => {
  try {
    // 1. Débiter le citoyen
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (pError) throw pError;
    if ((profile?.wallet_balance || 0) < amount) {
      throw new Error("Solde insuffisant");
    }

    const citizenNewBalance = profile.wallet_balance - amount;

    // 2. Créditer l'organisation (Lucas)
    const { data: orgProfile, error: oError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', orgId)
      .single();

    if (oError) throw oError;
    const orgNewBalance = (orgProfile?.wallet_balance || 0) + amount;

    // 3. Transactions & Updates (Transaction atomique simulée par exécution séquentielle)
    
    // Update Citizen
    await supabase.from('profiles').update({ wallet_balance: citizenNewBalance }).eq('id', userId);
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'outcome',
      amount: -amount,
      description: `Abonnement Service - ${orgName}`
    });

    // Update Organization
    await supabase.from('profiles').update({ wallet_balance: orgNewBalance }).eq('id', orgId);
    await supabase.from('transactions').insert({
      user_id: orgId,
      type: 'income',
      amount: amount,
      description: `Revenu Abonnement - ${userName}`
    });

    return { success: true, balance: citizenNewBalance };
  } catch (err: any) {
    console.error('processSubscriptionPayment error:', err?.message);
    throw err;
  }
};

/**
 * CRÉATION D'UNE SOUSCRIPTION RÉELLE
 */
export const createSubscription = async (userId: string, plan: any) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        plan_id: plan.id,
        zone_name: plan.zone_name || 'Zone Locale',
        company_name: plan.company_name || 'Organisation Partenaire',
        pickup_days: plan.pickup_days,
        pickup_time: plan.pickup_time,
        price: plan.price,
        status: 'active',
        tier: 'standard'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error('createSubscription error:', err?.message);
    throw err;
  }
};

/**
 * SIGNALEMENT URGENT
 */
export const signalEmergency = async (subscriptionId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        profile_id: userId,
        title: 'URGENCE : Barque Pleine',
        content: `Le vendeur signale une barque pleine pour son abonnement.`,
        type: 'collection'
      }]);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('signalEmergency error:', err?.message);
    throw err;
  }
};
