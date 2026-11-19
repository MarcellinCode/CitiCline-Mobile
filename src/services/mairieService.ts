import { supabase } from '@/lib/supabase';
import { getErrorMessage } from '../utils/safeFetch';

export interface TerritoryStats {
  citizenCount: number;
  error?: string;
}

/**
 * RÉCUPÉRATION DES STATISTIQUES TERRITORIALES
 * Compte les citoyens inscrits dans une ville spécifique
 */
export const getTerritoryStats = async (city: string): Promise<TerritoryStats> => {
  try {
    if (!city?.trim()) return { citizenCount: 0 };

    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'producteur') // 'producteur' est le rôle interne des citoyens/producteurs
      .ilike('city', `%${city.trim()}%`);

    if (error) throw error;

    return {
      citizenCount: count || 0,
    };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error('getTerritoryStats error:', message);
    return { citizenCount: 0, error: message };
  }
};
