import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useInfractions() {
  const [infractions, setInfractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInfractions = async () => {
    try {
      const { data, error } = await supabase
        .from('environmental_infractions')
        .select(`
          *,
          profiles:reporter_id(full_name),
          zones:zone_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setInfractions(data || []);
    } catch (err) {
      console.error('Error fetching infractions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfractions();

    const channel = supabase
      .channel('infractions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'environmental_infractions' },
        () => fetchInfractions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { infractions, loading, fetchInfractions };
}
