import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, ChevronLeft, User, MoreVertical } from 'lucide-react-native';
import { MotiView } from 'moti';

import { useProfile } from '@/hooks/useProfile';

export default function ChatDetail() {
  const insets = useSafeAreaInsets();
  const { id, name, waste_id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let channel: any;
    async function setup() {
      if (!profile?.id) return;
      try {
        let query = supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${profile.id})`)
          .order('created_at', { ascending: true });

        if (waste_id) {
          query = query.eq('waste_id', waste_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data) setMessages(data);

        // Mark as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', id)
          .eq('receiver_id', profile.id)
          .eq('is_read', false);

        // Subscribe to real-time changes
        channel = supabase
          .channel(`chat_${id}`)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id=eq.${profile.id}`
          }, (payload: any) => {
            if (payload.new.sender_id === id) {
              if (waste_id && payload.new.waste_id !== waste_id) return;
              setMessages(prev => [...prev, payload.new]);
            }
          })
          .subscribe();
      } catch (err) {
        console.error("ChatDetail setup error:", err);
      }
    }
    setup();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [id, profile?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile) return;

    try {
      const messageToSend = {
        content: newMessage.trim(),
        sender_id: profile.id,
        receiver_id: id,
        waste_id: waste_id || null,
        created_at: new Date().toISOString(),
        is_read: false
      };

      // Optimistic update
      setMessages(prev => [...prev, { ...messageToSend, id: 'temp-' + Date.now() }]);
      setNewMessage('');

      const { error } = await supabase.from('messages').insert([messageToSend]);
      if (error) alert(error.message);
    } catch (err: any) {
      alert(err.message || "Erreur d'envoi");
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Sleek Furtive Messenger Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0) }]}>
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ChevronLeft size={28} color="#020617" />
            </TouchableOpacity>
            <View style={styles.avatarWrapper}>
                <View style={styles.avatarCircle}>
                    <User size={22} color="#94a3b8" />
                </View>
                <View style={styles.onlineDot} />
            </View>
            <View>
                <Text style={styles.headerName}>{name}</Text>
                <Text style={styles.headerStatusText}>Actif maintenant</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
            <MoreVertical size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
 
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item, index }) => {
          const isMe = item.sender_id === profile?.id;
          const prevMsg = messages[index - 1];
          const isSameSender = prevMsg?.sender_id === item.sender_id;
          
          return (
            <MotiView 
              from={{ opacity: 0, scale: 0.95, translateY: 5 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}
            >
              <View 
                style={[
                  styles.msgBubble,
                  isMe ? styles.msgBubbleMe : styles.msgBubbleThem,
                  isSameSender && (isMe ? styles.msgBubbleSmallRadiusRight : styles.msgBubbleSmallRadiusLeft)
                ]}
              >
                <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
                  {item.content}
                </Text>
              </View>
            </MotiView>
          );
        }}
      />
  
      {/* Sleek Minimalist Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputArea}>
            <TouchableOpacity style={styles.addMediaBtn}>
                <View style={styles.addMediaCircle}>
                    <Text style={styles.plusIcon}>+</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
                <TextInput 
                    placeholder="Aa"
                    placeholderTextColor="#94a3b8"
                    style={styles.textInput}
                    multiline
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
            </View>
            <TouchableOpacity 
                onPress={sendMessage}
                style={styles.sendBtn}
            >
                <Send size={22} color={newMessage.trim() ? "#2aa275" : "#cbd5e1"} />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  avatarWrapper: { position: 'relative', marginRight: 12 },
  avatarCircle: { width: 44, height: 44, backgroundColor: '#f1f5f9', borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f8fafc' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, backgroundColor: '#2aa275', borderRadius: 6, borderWidth: 2, borderColor: 'white' },
  headerName: { fontSize: 13, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  headerStatusText: { fontSize: 9, fontWeight: 'bold', color: '#2aa275', textTransform: 'uppercase', letterSpacing: 1 },
  moreBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  msgRow: { marginBottom: 6, flexDirection: 'row' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '75%', paddingHorizontal: 20, paddingVertical: 14, paddingLeft: 20, paddingRight: 20, paddingTop: 14, paddingBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  msgBubbleMe: { backgroundColor: '#020617', borderTopLeftRadius: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, borderTopRightRadius: 6 },
  msgBubbleThem: { backgroundColor: '#f1f5f9', borderTopRightRadius: 28, borderBottomRightRadius: 28, borderBottomLeftRadius: 28, borderTopLeftRadius: 6 },
  msgBubbleSmallRadiusRight: { borderTopRightRadius: 28 },
  msgBubbleSmallRadiusLeft: { borderTopLeftRadius: 28 },
  msgText: { fontSize: 13, fontWeight: '500', lineHeight: 20 },
  msgTextMe: { color: 'white' },
  msgTextThem: { color: '#020617' },
  inputArea: { paddingHorizontal: 24, paddingVertical: 20, paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f8fafc', flexDirection: 'row', alignItems: 'center' },
  addMediaBtn: { marginRight: 16 },
  addMediaCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  plusIcon: { fontSize: 20, color: '#020617' },
  inputWrapper: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 32, paddingHorizontal: 20, paddingVertical: 14, paddingLeft: 20, paddingRight: 20, paddingTop: 14, paddingBottom: 14, maxHeight: 128 },
  textInput: { fontSize: 14, fontWeight: '600', color: '#020617' },
  sendBtn: { marginLeft: 16 }
});
