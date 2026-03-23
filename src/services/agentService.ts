import { supabase } from '@/lib/supabase';
import { safeFetch } from '../utils/safeFetch';

export const getAgents = async (): Promise<any[] | null> => {
  const result = await safeFetch<any[]>(() => 
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'agent_collecteur')
  );

  return result.data;
};
