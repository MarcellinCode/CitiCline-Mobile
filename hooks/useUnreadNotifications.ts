import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';

export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile?.id) return;

    fetchUnreadCount();

    // Listen for new notifications
    const channel = supabase
      .channel(`unread-count-${profile.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', // Listen to inserts or updates (read/unread status)
          schema: 'public', 
          table: 'notifications',
          filter: `profile_id=eq.${profile.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile?.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return { unreadCount, refresh: fetchUnreadCount };
};
