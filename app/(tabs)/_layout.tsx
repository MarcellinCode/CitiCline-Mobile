import { Home, Map, MessageSquare, LayoutDashboard, User, Plus, Search } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
      tabBarActiveTintColor: '#2A9D8F',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: '#ffffff',
        borderRadius: 40,
        height: 80,
        paddingBottom: 0,
        borderTopWidth: 0,
        borderWidth: 2,
        borderColor: '#f8fafc',
        shadowColor: '#2A9D8F',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 25,
      },
      tabBarLabelStyle: {
        fontSize: 9,
        fontFamily: Platform.OS === 'ios' ? 'Inter-Black' : 'sans-serif',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 5,
      },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="marketplace/index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }: { color: string }) => <Home size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="espace/index"
        options={{
          title: 'Espace',
          tabBarIcon: ({ color }: { color: string }) => <LayoutDashboard size={22} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="marketplace/publish"
        options={{
          title: '',
          tabBarButton: () => (
            <View className="top-[-25] items-center justify-center">
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => {
                  if (profile?.role === 'vendeur' || profile?.role === 'super_admin') {
                    router.push('/marketplace/publish' as any);
                  } else {
                    router.push(ROUTES.MARKETPLACE as any);
                  }
                }}
                className="w-16 h-16 rounded-[2rem] bg-zinc-900 items-center justify-center shadow-xl shadow-zinc-400/50 border-[4px] border-white"
              >
                {(profile?.role === 'vendeur' || profile?.role === 'super_admin') ? (
                  <Plus size={32} color="#2A9D8F" strokeWidth={3} />
                ) : (
                  <Search size={28} color="#2A9D8F" strokeWidth={3} />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }: { color: string }) => <MessageSquare size={22} color={color} strokeWidth={2.5} />,
          tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444', fontSize: 10, fontWeight: 'bold' }
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color }: { color: string }) => <User size={22} color={color} strokeWidth={2.5} />,
        }}
      />
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
      <Tabs.Screen name="espace/flotte" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="espace/reservations" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="espace/impact-rse" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="settings/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="profile/edit" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
