import { useProfileContext } from '../context/ProfileContext';

/**
 * Hook to access the user profile from the global context.
 * Now centralized to avoid redundant network calls and subscriptions.
 */
export function useProfile() {
  const { profile, loading, refreshProfile } = useProfileContext();
  
  return { 
    profile, 
    loading,
    refreshProfile 
  };
}
