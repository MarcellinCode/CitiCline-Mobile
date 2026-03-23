import { Home, Map, MessageSquare, LayoutDashboard, User, Plus, Search } from 'lucide-react-native';
import { View, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function TabsLayout() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const unreadMessagesCount = useUnreadMessages();

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startTracking = async (userId: string) => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !isMounted) return;

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 30, // Increase interval to 30 meters for better battery and performance
        },
        async (loc) => {
          if (!isMounted) return;
          // Use the userId from closure instead of fetching it every 30 meters
          await supabase.from('tracking_logs').insert({
            agent_id: userId,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    };

    if (!loading && profile?.role === 'agent_collecteur' && profile?.id) {
      startTracking(profile.id);
    }

    return () => {
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [profile?.id, profile?.role, loading]); // Depend on ID and Role specifically to avoid redundant restarts on name/balance changes

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator color="#2aa275" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 35,
        height: 70,
        paddingBottom: 0,
        borderTopWidth: 0,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 5,
      },
      headerShown: false,
    }}>
      {/* 1. ACCUEIL */}
      <Tabs.Screen
        name="marketplace/index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }: { color: string }) => <Home size={24} color={color} />,
        }}
      />

      {/* 2. ESPACE (Dashboard central) */}
      <Tabs.Screen
        name="espace/index"
        options={{
          title: 'Espace',
          tabBarIcon: ({ color }: { color: string }) => <LayoutDashboard size={24} color={color} />,
        }}
      />

      {/* 3. ACTION CENTRALE (Bouton + ou Loupe selon rôle) */}
      <Tabs.Screen
        name="marketplace/publish"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={{ top: -20, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => {
                  if (profile?.role === 'vendeur') {
                    router.push('/(tabs)/marketplace/publish');
                  } else {
                    router.push('/(tabs)/marketplace');
                  }
                }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#10b981', // Emerald green
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 3,
                  borderColor: 'white'
                }}
              >
                {profile?.role === 'vendeur' ? (
                  <Plus size={32} color="white" />
                ) : (
                  <Search size={28} color="white" />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* 4. MESSAGES */}
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }: { color: string }) => <MessageSquare size={24} color={color} />,
          tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444', fontSize: 10, fontWeight: 'bold' }
        }}
      />

      {/* 5. COMPTE */}
       <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color }: { color: string }) => <User size={24} color={color} />,
        }}
      />

      {/* ROUTES SECONDAIRES (Masquées de la barre de navigation) */}
      <Tabs.Screen name="map/index" options={{ href: null }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="marketplace/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="wallet/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="mes-dechets/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="missions/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="missions/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="abonnements/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="espace/agents/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="espace/offres" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="espace/analytics" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="settings/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
