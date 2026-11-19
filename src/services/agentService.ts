import { supabase } from '@/lib/supabase';
import { Profile, ServiceResult } from '@/lib/types';
import { safeFetch } from '../utils/safeFetch';

export type AgentProfile = Pick<
  Profile,
  'id' | 'full_name' | 'email' | 'phone' | 'city' | 'district' | 'status' | 'organization_id' | 'assigned_vehicle_id' | 'avatar_url' | 'role' | 'wallet_balance'
>;

export const getAgents = async (
  organizationId?: string
): Promise<ServiceResult<AgentProfile[]>> => {
  return safeFetch<AgentProfile[]>(() => {
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, phone, city, district, status, organization_id, assigned_vehicle_id, avatar_url, role, wallet_balance')
      .eq('role', 'agent_collecteur');

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    return query as unknown as PromiseLike<{ data: AgentProfile[] | null; error: unknown }>;
  });
};
