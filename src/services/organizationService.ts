import { supabase } from '@/lib/supabase';
import {
  ActionResult,
  HouseholdSubscription,
  Profile,
  SubscriptionPlan,
} from '@/lib/types';
import { getErrorMessage } from '../utils/safeFetch';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * RÉCUPÉRATION DES GESTIONNAIRES (Mairies/Zones)
 * On récupère les concessions actives et leurs profils associés en limitant les allers-retours réseau.
 */
export const getOrganizationsNearby = async (city?: string): Promise<Profile[]> => {
  try {
    const concessionsPromise = supabase
      .from('concessions')
      .select('organization_id, zone_id')
      .eq('status', 'active');

    const zonesPromise = city
      ? supabase.from('zones').select('id, name, description')
      : Promise.resolve({ data: null, error: null });

    const [
      { data: concessions, error: cError },
      { data: zones, error: zError },
    ] = await Promise.all([concessionsPromise, zonesPromise]);

    if (cError) throw cError;
    if (zError) throw zError;
    if (!concessions || concessions.length === 0) return [];

    let filteredConcessions = concessions;

    if (city && zones) {
      const cleanCity = city.replace(/Mairie de |Commune de |Ville de /gi, '').trim().toLowerCase();
      const matchingZoneIds = zones
        .filter(
          (z) =>
            (z.name && z.name.toLowerCase().includes(cleanCity)) ||
            (z.description && z.description.toLowerCase().includes(cleanCity))
        )
        .map((z) => z.id);

      filteredConcessions = concessions.filter((c) => matchingZoneIds.includes(c.zone_id));
    }

    const uniqueOrgIds = [...new Set(filteredConcessions.map((c) => c.organization_id).filter(Boolean))];
    if (uniqueOrgIds.length === 0) return [];

    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, full_name, city, avatar_url, phone, email, role, organization_id')
      .in('id', uniqueOrgIds);

    if (pError) throw pError;

    return (profiles as Profile[]) || [];
  } catch (err: unknown) {
    console.error('getOrganizationsNearby error:', getErrorMessage(err));
    throw err;
  }
};

/**
 * RÉCUPÉRATION DES PLANS D'ABONNEMENT POUR UNE ORGANISATION
 */
export const getOrganizationPlans = async (organizationId: string): Promise<SubscriptionPlan[]> => {
  try {
    if (!organizationId) return [];

    const { data: concessions, error: cError } = await supabase
      .from('concessions')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (cError) throw cError;

    const fallbackPlans: SubscriptionPlan[] = [
      { id: '1', name: 'Foyer', price: 1000, pickup_days: ['Lundi', 'Jeudi'], isMock: true },
      { id: '2', name: 'Entreprise', price: 6000, pickup_days: ['Mardi', 'Vendredi'], isMock: true },
      { id: '3', name: 'Usine / Industrie', price: 20000, pickup_days: ['Lundi', 'Mercredi', 'Vendredi'], isMock: true },
    ];

    if (!concessions || concessions.length === 0) {
      return fallbackPlans;
    }

    const concessionIds = concessions.map((c) => c.id);
    const { data: plans, error: pError } = await supabase
      .from('subscription_plans')
      .select('id, concession_id, name, price_cfa, pickup_days')
      .in('concession_id', concessionIds);

    if (pError) throw pError;

    if (!plans || plans.length === 0) {
      return fallbackPlans;
    }

    return plans.map((p: any) => ({
      ...p,
      price: p.price_cfa || p.price || 0,
      isMock: false,
    }));
  } catch (err: unknown) {
    console.error('getOrganizationPlans error:', getErrorMessage(err));
    throw err;
  }
};

/**
 * PROCESSUS DE PAIEMENT D'ABONNEMENT
 * Débite le citoyen et crédite l'organisation
 */
export const processSubscriptionPayment = async (
  userId: string,
  orgId: string,
  amount: number,
  orgName: string,
  userName: string
): Promise<ActionResult<{ balance: number }>> => {
  if (!userId || !orgId || !Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: 'Paramètres de paiement invalides.' };
  }

  try {
    const { data: newCitizenBalance, error } = await supabase.rpc('fn_pay_subscription', {
      p_citizen_id: userId,
      p_org_id: orgId,
      p_amount: amount,
      p_org_name: orgName,
      p_user_name: userName,
    });

    if (error) throw error;

    const balance = Number(newCitizenBalance);
    return { success: true, balance, data: { balance } };
  } catch (err: unknown) {
    console.error('processSubscriptionPayment error:', getErrorMessage(err));
    throw err;
  }
};

/**
 * CRÉATION D'UNE SOUSCRIPTION RÉELLE
 */
export const createSubscription = async (
  userId: string,
  plan: SubscriptionPlan & { company_name?: string; company_id?: string }
): Promise<HouseholdSubscription> => {
  if (!userId || !plan?.id || plan.isMock || !UUID_REGEX.test(plan.id)) {
    throw new Error("Ce plan n'est pas encore configuré en base de données par l'organisation.");
  }

  try {
    const { data, error } = await supabase
      .from('household_subscriptions')
      .insert([
        {
          profile_id: userId,
          plan_id: plan.id,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as HouseholdSubscription;
  } catch (err: unknown) {
    console.error('createSubscription error:', getErrorMessage(err));
    throw err;
  }
};

/**
 * SIGNALEMENT URGENT
 */
export const signalEmergency = async (subscriptionId: string, userId: string): Promise<boolean> => {
  try {
    let targetProfileId = userId;

    if (subscriptionId && UUID_REGEX.test(subscriptionId)) {
      const { data: subData } = await supabase
        .from('household_subscriptions')
        .select('subscription_plans(concessions(organization_id))')
        .eq('id', subscriptionId)
        .single();

      const orgId = (subData as any)?.subscription_plans?.concessions?.organization_id;
      if (orgId) targetProfileId = orgId;
    }

    const { error } = await supabase.from('notifications').insert([
      {
        profile_id: targetProfileId,
        title: 'URGENCE : Barque Pleine',
        content: 'Un abonné signale une barque pleine nécessitant un passage urgent.',
        type: 'collection',
      },
    ]);

    if (error) throw error;
    return true;
  } catch (err: unknown) {
    console.error('signalEmergency error:', getErrorMessage(err));
    throw err;
  }
};
