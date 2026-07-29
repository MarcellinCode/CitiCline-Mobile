import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';
import { Alert } from 'react-native';

// Haversine formula to calculate distance between two coordinates in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useTracking() {
  const { profile } = useProfile();
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const subscriber = useRef<Location.LocationSubscription | null>(null);

  // Refs for throttling GPS updates
  const lastPosition = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastSentTime = useRef<number>(0);

  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission GPS Requise", "L'accès à la position est nécessaire pour le tracking.");
        return;
      }

      setIsTracking(true);
      
      // Start watching position with native options aligned to ADR-004
      subscriber.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 15, // Minimum 15 meters
          timeInterval: 10000,   // Minimum 10 seconds
        },
        async (newLocation) => {
          setLocation(newLocation);
          
          if (profile?.id) {
            const { latitude, longitude } = newLocation.coords;
            const now = Date.now();
            
            // Client-side throttling check (double security)
            if (lastPosition.current) {
              const distance = getDistance(
                lastPosition.current.latitude,
                lastPosition.current.longitude,
                latitude,
                longitude
              );
              const timeElapsed = now - lastSentTime.current;
              
              // Skip update if moved less than 15 meters AND less than 10 seconds elapsed
              if (distance < 15 && timeElapsed < 10000) {
                return;
              }
            }
            
            lastPosition.current = { latitude, longitude };
            lastSentTime.current = now;
            
            // Send to Supabase
            await supabase.from('agent_live_positions').insert({
              agent_id: profile.id,
              latitude: latitude,
              longitude: longitude,
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
