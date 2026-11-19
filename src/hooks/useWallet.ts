import { useCallback, useEffect, useRef, useState } from 'react';
import { Transaction } from '@/lib/types';
import { getTransactions } from '../services/walletService';

export const useWallet = (userId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    if (!userId) {
      if (isMountedRef.current) {
        setTransactions([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getTransactions(userId);
    if (!isMountedRef.current) return;

    if (fetchError) {
      setError(fetchError);
      setTransactions([]);
    } else {
      setTransactions(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transactions, loading, error, refresh };
};
