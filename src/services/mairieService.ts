import { supabase } from '@/lib/supabase';

/**
 * RÉCUPÉRATION DES STATISTIQUES TERRITORIALES
 * Compte les citoyens inscrits dans une ville spécifique
 */
export const getTerritoryStats = async (city: string) => {
  try {
    if (!city) return { citizenCount: 0 };

    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'vendeur') // 'vendeur' est le rôle interne des citoyens
      .ilike('city', `%${city}%`);

    if (error) throw error;

    return {
      citizenCount: count || 0
    };
  } catch (err: any) {
    console.error('getTerritoryStats error:', err?.message);
    return { citizenCount: 0 };
  }
};
