import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
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
  const isMountedRef = useRef(true);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedUserIdRef = useRef<string | null>(null);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const fetchProfile = async (userId: string, retries = 3) => {
    clearRetryTimer();
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!isMountedRef.current) return;

      if (data) {
        if (data.role === 'mairie') {
          await supabase.auth.signOut();
          if (!isMountedRef.current) return;
          loadedUserIdRef.current = null;
          setSession(null);
          setProfile(null);
          setLoading(false);
          Alert.alert(
            "Accès refusé",
            "L'application mobile est réservée aux agents de terrain et usagers. Pour le rôle Mairie, connectez-vous sur la plateforme web."
          );
          return;
        }
        loadedUserIdRef.current = userId;
        setProfile(data as Profile);
        setLoading(false);
      } else if (retries > 0) {
        retryTimerRef.current = setTimeout(() => fetchProfile(userId, retries - 1), 1000);
      } else {
        setLoading(false);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (retries > 0) {
        retryTimerRef.current = setTimeout(() => fetchProfile(userId, retries - 1), 1000);
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
    isMountedRef.current = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMountedRef.current) return;
      if (error) {
        console.error("getSession error (possibly stale token):", error.message);
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
      if (isMountedRef.current) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMountedRef.current) return;
      setSession(nextSession);

      if (nextSession?.user?.id) {
        // Avoid unmounting Tabs on background token refresh for the already-loaded user
        if (loadedUserIdRef.current !== nextSession.user.id) {
          setLoading(true);
          fetchProfile(nextSession.user.id);
        }
      } else {
        clearRetryTimer();
        loadedUserIdRef.current = null;
        setProfile(null);
        setLoading(false);

        if (event === 'TOKEN_REFRESHED' && !nextSession) {
          console.warn("Auth token refresh failed, signing out...");
          supabase.auth.signOut();
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      clearRetryTimer();
      subscription.unsubscribe();
    };
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
