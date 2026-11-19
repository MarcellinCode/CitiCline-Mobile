import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Waste } from '../lib/types';
import { useProfileContext } from '../context/ProfileContext';
import { getErrorMessage } from '../utils/safeFetch';

export function useWastes() {
  const { session, profile, loading: profileLoading } = useProfileContext();
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const fetchWastes = useCallback(async () => {
    if (!session?.user?.id) {
      if (isMountedRef.current) {
        setWastes([]);
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

    try {
      setError(null);
      const userCity = profile?.city;

      const { data, error: queryError } = await supabase
        .from('wastes')
        .select(`
          id, seller_id, collector_id, assigned_agent_id, type_id, estimated_weight, final_weight,
          status, location, latitude, longitude, images, created_at, is_priority, mission_type,
          waste_types (id, name, price_per_kg, emoji),
          seller:profiles!seller_id(city)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(60);

      if (queryError) throw queryError;

      let filteredData = data || [];
      if (userCity) {
        const userCityLower = userCity.toLowerCase();
        filteredData = filteredData.filter((w: any) => {
          const sellerCity = w.seller?.city?.toLowerCase();
          const locationLower = w.location?.toLowerCase() || '';
          return (
            (sellerCity && sellerCity.includes(userCityLower)) ||
            locationLower.includes(userCityLower) ||
            !sellerCity
          );
        });
      }

      if (isMountedRef.current) {
        setWastes(filteredData as unknown as Waste[]);
      }
    } catch (err) {
      const msg = getErrorMessage(err, 'Impossible de charger les annonces');
      console.error('Error fetching wastes:', msg);
      if (isMountedRef.current) {
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [session?.user?.id, profile?.city]);

  useEffect(() => {
    if (profileLoading) return;
    fetchWastes();

    const channel = supabase
      .channel('wastes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wastes' },
        () => {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            fetchWastes();
          }, 400);
        }
      )
      .subscribe();

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [profileLoading, fetchWastes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWastes();
  }, [fetchWastes]);

  return { wastes, loading, refreshing, error, onRefresh };
}
