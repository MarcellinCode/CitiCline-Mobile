import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, ChevronLeft, User, MoreVertical } from 'lucide-react-native';
import { MotiView } from 'moti';

export default function ChatDetail() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    async function setup() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`chat_${id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new.sender_id === id) {
            setMessages(prev => [...prev, payload.new]);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    setup();
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const messageToSend = {
      content: newMessage.trim(),
      sender_id: currentUser.id,
      receiver_id: id,
      created_at: new Date().toISOString(),
      is_read: false
    };

    // Optimistic update
    setMessages(prev => [...prev, { ...messageToSend, id: 'temp-' + Date.now() }]);
    setNewMessage('');

    const { error } = await supabase.from('messages').insert([messageToSend]);
    if (error) alert(error.message);
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Sleek Furtive Messenger Header */}
      <View className="px-6 pt-16 pb-4 flex-row items-center justify-between border-b border-slate-50">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <ChevronLeft size={28} color="#020617" />
            </TouchableOpacity>
            <View className="relative">
                <View className="w-11 h-11 bg-slate-100 rounded-full items-center justify-center mr-3 border border-slate-50">
                    <User size={22} color="#94a3b8" />
                </View>
                <View className="absolute bottom-0 right-3 w-3 h-3 bg-[#2aa275] rounded-full border-2 border-white" />
            </View>
            <View>
                <Text className="text-sm font-black text-[#020617] uppercase tracking-widest leading-none mb-1">{name}</Text>
                <Text className="text-[9px] font-bold text-[#2aa275] uppercase tracking-[0.2em]">Actif maintenant</Text>
            </View>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <MoreVertical size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
 
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item, index }) => {
          const isMe = item.sender_id === currentUser?.id;
          const prevMsg = messages[index - 1];
          const isSameSender = prevMsg?.sender_id === item.sender_id;
          
          return (
            <MotiView 
              from={{ opacity: 0, scale: 0.95, translateY: 5 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              className={`mb-1.5 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <View 
                className={`max-w-[75%] px-5 py-3.5 shadow-sm ${
                  isMe 
                    ? 'bg-[#020617] rounded-[1.8rem] rounded-tr-[0.4rem]' 
                    : 'bg-slate-100 rounded-[1.8rem] rounded-tl-[0.4rem]'
                } ${isSameSender ? (isMe ? 'rounded-tr-[1.8rem]' : 'rounded-tl-[1.8rem]') : ''}`}
                style={isMe ? { backgroundColor: '#020617' } : {}}
              >
                <Text className={`text-[13px] font-medium leading-5 ${isMe ? 'text-white' : 'text-[#020617]'}`}>
                  {item.content}
                </Text>
              </View>
            </MotiView>
          );
        }}
      />
 
      {/* Sleek Minimalist Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="px-6 py-5 bg-white border-t border-slate-50 flex-row items-center">
            <TouchableOpacity className="mr-4">
                <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
                    <Text className="text-xl">+</Text>
                </View>
            </TouchableOpacity>
            <View className="flex-1 bg-slate-100 rounded-[2rem] px-5 py-3.5 max-h-32">
                <TextInput 
                    placeholder="Aa"
                    placeholderTextColor="#94a3b8"
                    className="text-sm font-semibold text-[#020617]"
                    multiline
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
            </View>
            <TouchableOpacity 
                onPress={sendMessage}
                className="ml-4"
            >
                <Send size={22} color={newMessage.trim() ? "#2aa275" : "#cbd5e1"} />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
