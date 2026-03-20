import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Waste } from '../lib/types';

export function useWastes() {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWastes = async () => {
    try {
      const { data, error } = await supabase
        .from('wastes')
        .select(`
          *,
          waste_types (*),
          profiles:seller_id (*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWastes(data as Waste[]);
    } catch (err) {
      console.error('Error fetching wastes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWastes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wastes' },
        () => fetchWastes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWastes();
  };

  return { wastes, loading, refreshing, onRefresh };
}
