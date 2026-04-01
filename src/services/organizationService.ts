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
