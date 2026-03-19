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
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Messages" subtitle="Discutez avec vos partenaires" />

      {/* Sleek Search Bar */}
      <View className="px-8 pb-6">
          <View className="bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 flex-row items-center">
              <TextInput 
                placeholder="Rechercher une discussion..." 
                placeholderTextColor="#94a3b8"
                className="flex-1 text-sm font-semibold text-[#020617]"
              />
          </View>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.otherUser.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '/(tabs)/chat/[id]',
              params: { id: item.otherUser.id, name: item.otherUser.full_name }
            })}
            className="flex-row items-center py-5 border-b border-slate-50"
          >
            <View className="relative">
                <View className="w-14 h-14 bg-slate-100 rounded-full items-center justify-center border border-slate-50 mr-4">
                    <User size={24} color="#94a3b8" />
                </View>
                <View className="absolute bottom-0 right-4 w-3.5 h-3.5 bg-[#2aa275] rounded-full border-2 border-white" />
            </View>
            <View className="flex-1">
                <View className="flex-row justify-between items-baseline mb-1">
                  <Text className="text-[13px] font-black text-[#020617] uppercase tracking-wider">
                      {item.otherUser?.full_name || 'Utilisateur CITICLINE'}
                  </Text>
                  <Text className="text-[9px] font-bold text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className={`text-xs font-medium flex-1 ${!item.isRead ? 'text-[#020617] font-black' : 'text-slate-500'}`} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {!item.isRead && (
                        <View className="w-2 h-2 bg-primary rounded-full ml-3" />
                    )}
                </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
            <View className="py-20 items-center">
                <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-4">
                  <MessageSquare size={32} color="#cbd5e1" />
                </View>
                <Text className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Aucune discussion active</Text>
            </View>
        )}
      />
    </View>
  );
}
