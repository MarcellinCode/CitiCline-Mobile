import { useCallback, useEffect, useRef, useState } from 'react';
import { AgentProfile, getAgents } from '../services/agentService';

export const useAgents = (organizationId?: string) => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getAgents(organizationId);
    if (!isMountedRef.current) return;

    if (fetchError) {
      setError(fetchError);
      setAgents([]);
    } else {
      setAgents(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { agents, loading, error, refresh };
};
