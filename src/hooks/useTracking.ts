import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';
import { Alert } from 'react-native';

export function useTracking() {
  const { profile } = useProfile();
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const subscriber = useRef<Location.LocationSubscription | null>(null);

  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission GPS Requise", "L'accès à la position est nécessaire pour le tracking.");
        return;
      }

      setIsTracking(true);
      
      // Start watching position
      subscriber.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000,    // Or every 5 seconds
        },
        async (newLocation) => {
          setLocation(newLocation);
          
          if (profile?.id) {
            // Send to Supabase
            await supabase.from('agent_live_positions').insert({
              agent_id: profile.id,
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              speed: newLocation.coords.speed,
              heading: newLocation.coords.heading
            });
          }
        }
      );
    } catch (err) {
      console.error("Tracking error:", err);
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (subscriber.current) {
      subscriber.current.remove();
      subscriber.current = null;
    }
    setIsTracking(false);
  };

  const toggleTracking = () => {
    if (isTracking) stopTracking();
    else startTracking();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriber.current) {
        subscriber.current.remove();
      }
    };
  }, []);

  return { isTracking, location, toggleTracking };
}
