import { supabase } from '@/lib/supabase';
import { safeFetch } from '../utils/safeFetch';

/**
 * RÉCUPÉRATION DES GESTIONNAIRES (Mairies/Zones)
 * On récupère les concessions actives et leurs profils associés
 */
export const getOrganizationsNearby = async (city?: string) => {
  try {
    // 1. Récupérer toutes les concessions actives
    const { data: concessions, error: cError } = await supabase
      .from('concessions')
      .select('organization_id, zone_id')
      .eq('status', 'active');
    
    if (cError) throw cError;

    if (!concessions || concessions.length === 0) {
      return [];
    }

    let filteredConcessions = concessions;

    // 2. Si une ville/commune est spécifiée, on filtre les concessions en fonction de leur zone (name ou description)
    if (city) {
      const { data: zones, error: zError } = await supabase
        .from('zones')
        .select('id, name, description');
      
      if (zError) throw zError;

      if (zones) {
        const cleanCity = city.replace(/Mairie de |Commune de |Ville de /gi, "").trim().toLowerCase();
        const matchingZoneIds = zones
          .filter(z => 
            (z.name && z.name.toLowerCase().includes(cleanCity)) || 
            (z.description && z.description.toLowerCase().includes(cleanCity))
          )
          .map(z => z.id);
        
        filteredConcessions = concessions.filter(c => matchingZoneIds.includes(c.zone_id));
      }
    }

    // 3. Extraire les IDs uniques
    const uniqueOrgIds = [...new Set(filteredConcessions.map(c => c.organization_id).filter(Boolean))];

    if (uniqueOrgIds.length === 0) return [];

    // 4. Récupérer les profils complets pour ces IDs
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
    // 1. Récupérer les concessions actives de l'organisation
    const { data: concessions, error: cError } = await supabase
      .from('concessions')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');
    
    if (cError) throw cError;

    if (!concessions || concessions.length === 0) {
      return [
        { id: '1', name: 'Foyer', price: 1000, pickup_days: ['Lundi', 'Jeudi'] },
        { id: '2', name: 'Entreprise', price: 6000, pickup_days: ['Mardi', 'Vendredi'] },
        { id: '3', name: 'Usine / Industrie', price: 20000, pickup_days: ['Lundi', 'Mercredi', 'Vendredi'] },
      ];
    }

    // 2. Récupérer les plans d'abonnements pour ces concessions
    const concessionIds = concessions.map(c => c.id);
    const { data: plans, error: pError } = await supabase
      .from('subscription_plans')
      .select('*')
      .in('concession_id', concessionIds);
    
    if (pError) throw pError;
    
    // Simulate plans for demo if DB is empty
    if (!plans || plans.length === 0) {
      return [
        { id: '1', name: 'Foyer', price: 1000, pickup_days: ['Lundi', 'Jeudi'] },
        { id: '2', name: 'Entreprise', price: 6000, pickup_days: ['Mardi', 'Vendredi'] },
        { id: '3', name: 'Usine / Industrie', price: 20000, pickup_days: ['Lundi', 'Mercredi', 'Vendredi'] },
      ];
    }
    
    // Adapter le modèle de données (price_cfa -> price)
    return plans.map(p => ({
      ...p,
      price: p.price_cfa || p.price || 0
    }));
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
