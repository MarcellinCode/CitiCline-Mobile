import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfileContext } from '../context/ProfileContext';

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);
  const { session } = useProfileContext();

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchCount = async () => {
      const { count: unreadCount, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', session.user.id)
        .eq('is_read', false);

      if (!error) setCount(unreadCount || 0);
    };

    fetchCount();

    const channel = supabase
      .channel(`unread-notifications-${session.user.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        () => fetchCount()
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  return count;
}
