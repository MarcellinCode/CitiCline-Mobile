import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Bell, DollarSign, Handshake, Info, Truck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'offer' | 'payment' | 'collection' | 'system';
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      
      // Mark as read
      const unreadIds = data?.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds && unreadIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign size={24} color="#059669" />;
      case 'offer':
        return <Handshake size={24} color="#2563eb" />;
      case 'collection':
        return <Truck size={24} color="#d97706" />;
      default:
        return <Info size={24} color="#64748b" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'payment': return '#ecfdf5';
      case 'offer': return '#eff6ff';
      case 'collection': return '#fef3c7';
      default: return '#f8fafc';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#020617" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#2aa275" size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 50 }}
              style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
            >
              <View style={[styles.iconContainer, { backgroundColor: getIconBg(item.type) }]}>
                {getIcon(item.type)}
              </View>
              <View style={styles.textContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.timeText}>
                    {new Date(item.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Text style={styles.content}>{item.content}</Text>
              </View>
              {!item.is_read && <View style={styles.unreadDot} />}
            </MotiView>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Bell size={32} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyText}>Aucune notification</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 48, height: 48, backgroundColor: '#f8fafc', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, backgroundColor: 'white', borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  notifCardUnread: { backgroundColor: '#f8fafc' },
  iconContainer: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textContent: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 13, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1, flex: 1, marginRight: 8 },
  timeText: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  content: { fontSize: 13, color: '#64748b', lineHeight: 20, fontWeight: '500' },
  unreadDot: { width: 8, height: 8, backgroundColor: '#ea580c', borderRadius: 4, marginLeft: 12, marginTop: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconBg: { width: 80, height: 80, backgroundColor: '#f8fafc', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12 }
});
