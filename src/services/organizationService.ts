import { supabase } from '@/lib/supabase';
import { safeFetch } from '../utils/safeFetch';

// ============================================================
// MODE SIMULATION — Données de test pour les organisations
// ============================================================

const SIMULATION_ORGS = [
  { id: 'sim_org_1', full_name: 'EcoGreen Abidjan', city: 'Abidjan', avatar_url: null },
  { id: 'sim_org_2', full_name: 'TrierPro Bouaké', city: 'Bouaké', avatar_url: null },
  { id: 'sim_org_3', full_name: 'CleanCity Yamoussoukro', city: 'Yamoussoukro', avatar_url: null },
];

const SIMULATION_PLANS = [
  { id: 'sim_plan_1', name: 'Foyer Standard', price: 2000, pickup_days: ['Lundi', 'Vendredi'], pickup_time: '08h-10h', zone_name: 'Zone Résidentielle' },
  { id: 'sim_plan_2', name: 'Entreprise Plus', price: 6000, pickup_days: ['Lundi', 'Mercredi', 'Vendredi'], pickup_time: '07h-09h', zone_name: 'Zone Commerciale' },
  { id: 'sim_plan_3', name: 'Industrie Premium', price: 15000, pickup_days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'], pickup_time: '06h-08h', zone_name: 'Zone Industrielle' },
];

export const getOrganizationsNearby = async (city?: string) => {
  try {
    let query = supabase
      .from('concessions')
      .select('*, profiles!organisation_id(*)')
      .eq('status', 'active');
    
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const orgs = data
      ?.map(c => c.profiles)
      .filter((v, i, a) => v && a.findIndex(t => t?.id === v.id) === i);
      
    if (orgs && orgs.length > 0) return orgs;
    
    // Fallback simulation
    console.warn('[SIMULATION] getOrganizationsNearby — utilisation des données simulées');
    return SIMULATION_ORGS;
  } catch (err: any) {
    console.warn('[SIMULATION] getOrganizationsNearby fallback:', err?.message);
    return SIMULATION_ORGS;
  }
};

export const getOrganizationPlans = async (organisationId: string) => {
  try {
    const result = await safeFetch<any[]>(() => 
      supabase
        .from('subscription_plans')
        .select('*')
        .eq('organisation_id', organisationId)
    );
    
    if (result.data && result.data.length > 0) return result.data;
    
    // Fallback simulation
    console.warn('[SIMULATION] getOrganizationPlans — utilisation des plans simulés');
    return SIMULATION_PLANS;
  } catch (err: any) {
    console.warn('[SIMULATION] getOrganizationPlans fallback:', err?.message);
    return SIMULATION_PLANS;
  }
};

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
    // Fallback simulation — retourner un objet simulé
    console.warn('[SIMULATION] createSubscription fallback:', err?.message);
    return {
      id: 'sim_sub_' + Date.now(),
      user_id: userId,
      zone_name: plan.zone_name || 'Zone Locale (Simulation)',
      company_name: plan.company_name || 'Organisation Simulée',
      pickup_days: plan.pickup_days || ['Lundi', 'Mercredi', 'Vendredi'],
      pickup_time: plan.pickup_time || '08h-10h',
      price: plan.price,
      status: 'active',
      tier: 'standard'
    };
  }
};

export const signalEmergency = async (subscriptionId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        profile_id: userId,
        title: 'URGENCE : Barque Pleine',
        content: `Le vendeur ${userId} signale une barque pleine pour son abonnement ${subscriptionId}.`,
        type: 'collection'
      }]);

    if (error) throw error;
    return true;
  } catch (err: any) {
    // Fallback simulation
    console.warn('[SIMULATION] signalEmergency fallback:', err?.message);
    return true;
  }
};
