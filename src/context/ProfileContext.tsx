import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '../lib/types';
import { Session } from '@supabase/supabase-js';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  session: Session | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, retries = 3) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data as Profile);
        setLoading(false);
      } else if (retries > 0) {
        // Retry after a short delay if no data yet (common during signup)
        setTimeout(() => fetchProfile(userId, retries - 1), 1000);
      } else {
        setLoading(false);
      }
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchProfile(userId, retries - 1), 1000);
      } else {
        console.error("fetchProfile error after retries:", err);
        setLoading(false);
      }
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        setLoading(true);
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    // 3. Single Realtime Subscription for the whole app
    const channel = supabase
      .channel(`profile-global-${session.user.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          if (payload.new && payload.new.id === session.user.id) {
            setProfile(prev => prev ? { ...prev, ...payload.new } : (payload.new as Profile));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile, session }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}
