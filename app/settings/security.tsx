import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Lock, Smartphone, ShieldCheck, Mail, ChevronRight, Fingerprint } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!profile?.email) {
      Alert.alert("Erreur", "Email non trouvé dans votre profil.");
      return;
    }

    Alert.alert(
      "Réinitialisation",
      `Un lien de réinitialisation sera envoyé à l'adresse : ${profile.email}. Confirmer ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Envoyer", 
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
               redirectTo: 'https://recy-app-six.vercel.app/reset-password', 
            });
            setLoading(false);
            if (error) {
              Alert.alert("Erreur", error.message);
            } else {
              Alert.alert("Succès", "L'email de réinitialisation a été envoyé !");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title="Sécurité" 
        subtitle="VOTRE ACCÈS AU HUB"
        onBack={() => router.back()}
      />

      <ScrollView 
        className="px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <HubText variant="label" className="text-zinc-400 mb-6 italic tracking-widest">AUTHENTIFICATION</HubText>

        <HubCard className="p-0 overflow-hidden mb-10 border-2 border-zinc-50">
          <TouchableOpacity 
            style={styles.listItem}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <View style={styles.listItemLeft}>
              <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center mr-4">
                <Lock size={18} color="#f59e0b" />
              </View>
              <View>
                <HubText variant="h3" className="text-zinc-900 text-[11px] mb-[-2]">MOT DE PASSE</HubText>
                <HubText variant="caption" className="text-zinc-400 text-[8px]">Changer via email</HubText>
              </View>
            </View>
            {loading ? <ActivityIndicator size="small" color="#f59e0b" /> : <ChevronRight size={14} color="#cbd5e1" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.listItem, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert("Double Authentification", "Bientôt disponible : Sécurisez votre compte avec un code SMS.")}
          >
            <View style={styles.listItemLeft}>
              <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-4">
                <Smartphone size={18} color="#3b82f6" />
              </View>
              <View>
                <HubText variant="h3" className="text-zinc-900 text-[11px] mb-[-2]">DOUBLE AUTH (2FA)</HubText>
                <HubText variant="caption" className="text-zinc-400 text-[8px]">Désactivé</HubText>
              </View>
            </View>
            <ChevronRight size={14} color="#cbd5e1" />
          </TouchableOpacity>
        </HubCard>

        <HubText variant="label" className="text-zinc-400 mb-6 italic tracking-widest">DONNÉES BIOMÉTRIQUES</HubText>
        
        <HubCard className="p-8 border-2 border-zinc-100 bg-zinc-50 items-center justify-center">
            <Fingerprint size={48} color="#cbd5e1" strokeWidth={1} />
            <HubText variant="h3" className="text-zinc-400 mt-4 text-center">FaceID / TouchID</HubText>
            <HubText variant="caption" className="text-zinc-400 mt-2 text-center text-[10px]">
                Activez la biométrie dans la prochaine mise à jour pour un accès instantané au Hub.
            </HubText>
        </HubCard>

        <View className="mt-12 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex-row items-start gap-4">
            <ShieldCheck size={24} color="#059669" />
            <View className="flex-1">
                <HubText variant="h3" className="text-emerald-900 mb-1">Protection Hub</HubText>
                <HubText variant="body" className="text-emerald-700 text-xs">
                    Vos données sont chiffrées de bout en bout selon les standards AES-256.
                </HubText>
            </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center' }
});
