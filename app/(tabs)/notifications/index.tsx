import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Bell, Info, AlertTriangle, CheckCircle, ChevronLeft, Trash2 } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { Header } from '@/components/Header';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  created_at: string;
  read: boolean;
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadNotifications();
    }
  }, [profile?.id]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('loadNotifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  };

  const clearAll = async () => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', profile?.id);
      setNotifications([]);
    } catch (err) {
      console.error('clearAll error:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={18} color="#ef4444" />;
      case 'success': return <CheckCircle size={18} color="#10b981" />;
      default: return <Info size={18} color="#3b82f6" />;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title="Notifications" 
        subtitle="VOS ALERTES HUB" 
        onBack={() => navigateSafe(router, ROUTES.ESPACE)}
        rightAction={
          notifications.length > 0 ? (
            <TouchableOpacity 
                onPress={clearAll} 
                className="w-12 h-12 bg-red-50 rounded-2xl items-center justify-center border border-red-100"
            >
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView 
        className="flex-1 px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 100 }}
      >
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator color="#2A9D8F" size="large" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="py-40 items-center">
            <View className="w-20 h-20 bg-zinc-50 rounded-[2.5rem] items-center justify-center mb-8">
              <Bell size={32} color="#cbd5e1" strokeWidth={1.5} />
            </View>
            <HubText variant="h3" className="text-zinc-400 italic">Aucune notification</HubText>
            <HubText variant="label" className="text-zinc-300 mt-2 tracking-[0.2em]">C'EST CALME PAR ICI</HubText>
          </View>
        ) : (
          <View className="gap-6">
            {notifications.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => !item.read && markAsRead(item.id)}
                activeOpacity={0.7}
              >
                <HubCard className={cn(
                  "p-6 border-0",
                  item.read ? "bg-white border border-zinc-50" : "bg-emerald-50/30 border border-emerald-100"
                )}>
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-3">
                      <View className={cn(
                        "w-8 h-8 rounded-xl items-center justify-center",
                        item.type === 'alert' ? "bg-red-50" : item.type === 'success' ? "bg-emerald-50" : "bg-blue-50"
                      )}>
                        {getIcon(item.type)}
                      </View>
                      <HubText variant="label" className="text-zinc-400 text-[7px] mb-0 tracking-widest uppercase font-bold">
                        HUBSIGNAL · {item.type}
                      </HubText>
                    </View>
                    <HubText variant="caption" className="text-zinc-300 text-[8px] italic">
                      {new Date(item.created_at).toLocaleDateString()}
                    </HubText>
                  </View>
                  <HubText variant="h3" className="text-zinc-900 text-sm mb-2">{item.title}</HubText>
                  <HubText variant="caption" className="text-zinc-500 text-[10px] leading-relaxed">
                    {item.message}
                  </HubText>
                </HubCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
