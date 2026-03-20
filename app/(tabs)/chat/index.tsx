import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/lib/types';
import { Header } from '@/components/Header';
import { Send, User, MessageSquare } from 'lucide-react-native';

export default function ChatScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchConversations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Grouping logic would ideally be a SQL view, but we'll do it client-side for now
      const { data, error } = await supabase
        .from('messages')
        .select(`*, sender:sender_id(*), receiver:receiver_id(*)`)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (data) {
        const uniqueConversations = new Map();
        data.forEach(msg => {
          const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
          if (otherUser && !uniqueConversations.has(otherUser.id)) {
            uniqueConversations.set(otherUser.id, {
              id: msg.id,
              otherUser,
              lastMessage: msg.content,
              timestamp: msg.created_at,
              isRead: msg.is_read || msg.sender_id === user.id
            });
          }
        });
        setConversations(Array.from(uniqueConversations.values()));
      }
      setLoading(false);
    }
    fetchConversations();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Messages" subtitle="Discutez avec vos partenaires" />

      {/* Sleek Search Bar */}
      <View style={styles.searchSection}>
          <View style={styles.searchBar}>
              <TextInput 
                placeholder="Rechercher une discussion..." 
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
              />
          </View>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.otherUser.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '/(tabs)/chat/[id]',
              params: { id: item.otherUser.id, name: item.otherUser.full_name }
            })}
            style={styles.chatItem}
          >
            <View style={styles.avatarContainer}>
                <View style={styles.avatarBg}>
                    <User size={24} color="#94a3b8" />
                </View>
                <View style={styles.statusDot} />
            </View>
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>
                      {item.otherUser?.full_name || 'Utilisateur CITICLINE'}
                  </Text>
                  <Text style={styles.chatTime}>
                    {new Date(item.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <View style={styles.chatFooter}>
                    <Text style={[styles.chatPreview, !item.isRead ? styles.chatPreviewUnread : styles.chatPreviewRead]} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {!item.isRead && (
                        <View style={styles.unreadDot} />
                    )}
                </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                  <MessageSquare size={32} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyText}>Aucune discussion active</Text>
            </View>
        )}
      />
    </View>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  searchSection: { paddingHorizontal: 32, paddingBottom: 24 },
  searchBar: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#020617' },
  listContent: { paddingHorizontal: 24, paddingBottom: 120 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  avatarContainer: { position: 'relative' },
  avatarBg: { width: 56, height: 56, backgroundColor: '#f1f5f9', borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f8fafc', marginRight: 16 },
  statusDot: { position: 'absolute', bottom: 0, right: 16, width: 14, height: 14, backgroundColor: '#2aa275', borderRadius: 7, borderWidth: 2, borderColor: 'white' },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  chatName: { fontSize: 13, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1 },
  chatTime: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8' },
  chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatPreview: { fontSize: 12, flex: 1 },
  chatPreviewUnread: { color: '#020617', fontWeight: '900' },
  chatPreviewRead: { color: '#64748b', fontWeight: '500' },
  unreadDot: { width: 8, height: 8, backgroundColor: '#2aa275', borderRadius: 4, marginLeft: 12 },
  emptyContainer: { paddingVertical: 80, alignItems: 'center' },
  emptyIconBg: { width: 80, height: 80, backgroundColor: '#f8fafc', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }
});
