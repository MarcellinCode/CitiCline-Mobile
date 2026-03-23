import { useEffect, useState } from 'react';
import { getTransactions } from '../services/walletService';

export const useWallet = (userId?: string) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      const data = await getTransactions(userId);
      setTransactions(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    load();
  }, [userId]);

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getTransactions(userId);
    setTransactions(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  return { transactions, loading, refresh };
};
