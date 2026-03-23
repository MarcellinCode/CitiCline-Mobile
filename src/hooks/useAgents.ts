import { useEffect, useState } from 'react';
import { getAgents } from '../services/agentService';

export const useAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAgents();
      setAgents(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    load();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const data = await getAgents();
    setAgents(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  return { agents, loading, refresh };
};
