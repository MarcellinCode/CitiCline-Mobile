import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfileContext } from '../context/ProfileContext';

export function useUnreadMessages() {
  const [count, setCount] = useState(0);
  const { session } = useProfileContext();

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnreadCount = async () => {
      const { count: unreadCount, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', session.user.id)
        .eq('is_read', false);

      if (!error) setCount(unreadCount || 0);
    };

    fetchUnreadCount();

    const channel = supabase
      .channel(`unread-messages-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${session.user.id}`
        },
        () => fetchUnreadCount()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${session.user.id}`
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  return count;
}
