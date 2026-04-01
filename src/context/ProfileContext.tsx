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
    // 1. Initial Session Check with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("getSession error (possibly stale token):", error.message);
        // If the refresh token is invalid, we clear the session locally
        if (error.message.includes("Invalid Refresh Token") || error.message.includes("not found")) {
          supabase.auth.signOut();
        }
        setLoading(false);
        return;
      }

      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error("getSession catch-all error:", err);
      setLoading(false);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user?.id) {
        setLoading(true);
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
        
        // Handle specific event where refresh token might fail
        if (event === 'TOKEN_REFRESHED' && !session) {
           console.warn("Auth token refresh failed, signing out...");
           supabase.auth.signOut();
        }
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
