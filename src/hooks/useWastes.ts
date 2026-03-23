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
          id, seller_id, collector_id, type_id, estimated_weight, final_weight,
          status, location, latitude, longitude, images, created_at,
          waste_types (id, name, price_per_kg, emoji)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setWastes((data || []) as unknown as Waste[]);
    } catch (err) {
      console.error('Error fetching wastes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWastes();

    // Subscribe to realtime changes - only meaningful changes
    const channel = supabase
      .channel('wastes-realtime')
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
