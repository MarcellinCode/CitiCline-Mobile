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

    const startTracking = async () => {
      // Seulement tracer les agents
      if (profile?.role !== 'agent_collecteur') return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission de localisation refusée');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Mise à jour tous les 10 mètres
        },
        async (loc) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('tracking_logs').insert({
              agent_id: user.id,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        }
      );
    };

    if (!loading && profile) {
      startTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [profile, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator color="#2aa275" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2aa275',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        height: 90,
        paddingBottom: 30,
        paddingTop: 10,
        backgroundColor: '#ffffff',
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
                  width: 65,
                  height: 65,
                  borderRadius: 33,
                  backgroundColor: '#020617',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#2aa275',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.4,
                  shadowRadius: 15,
                  elevation: 5,
                  borderWidth: 4,
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
