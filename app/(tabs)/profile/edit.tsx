import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Save, User, MapPin, ChevronLeft } from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { HubButton } from '@/components/ui/HubButton';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, refreshProfile } = useProfile();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [city, setCity] = useState(profile?.city || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Erreur', 'Le nom complet est obligatoire.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          city: city,
          district: district,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id);

      if (error) throw error;
      
      await refreshProfile();
      Alert.alert('Succès', 'Profil mis à jour avec succès.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error('handleSave error:', err);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title="Édition" 
        subtitle="VOS INFORMATIONS PERSONNELLES" 
        onBack={() => router.back()}
      />

      <ScrollView 
        className="flex-1 px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 100 }}
      >
        <View className="gap-8">
          <View>
            <HubText variant="label" className="text-zinc-400 mb-4 ml-1 italic">NOM COMPLET</HubText>
            <HubCard className="p-0 border-2 border-zinc-50 overflow-hidden">
              <View className="flex-row items-center px-6 py-4 gap-4">
                <User size={18} color="#94a3b8" />
                <TextInput 
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Votre nom complet"
                  className="flex-1 text-zinc-900 font-bold text-sm"
                  placeholderTextColor="#cbd5e1"
                  style={{ height: 48 }}
                />
              </View>
            </HubCard>
          </View>

          <View>
            <HubText variant="label" className="text-zinc-400 mb-4 ml-1 italic">VOTRE ZONE (VILLE)</HubText>
            <HubCard className="p-0 border-2 border-zinc-50 overflow-hidden">
              <View className="flex-row items-center px-6 py-4 gap-4">
                <MapPin size={18} color="#94a3b8" />
                <TextInput 
                  value={city}
                  onChangeText={setCity}
                  placeholder="Ex: Abidjan, Yamoussoukro..."
                  className="flex-1 text-zinc-900 font-bold text-sm"
                  placeholderTextColor="#cbd5e1"
                  style={{ height: 48 }}
                />
              </View>
            </HubCard>
          </View>

          <View>
            <HubText variant="label" className="text-zinc-400 mb-4 ml-1 italic">VOTRE QUARTIER</HubText>
            <HubCard className="p-0 border-2 border-zinc-50 overflow-hidden">
              <View className="flex-row items-center px-6 py-4 gap-4">
                <MapPin size={18} color="#94a3b8" />
                <TextInput 
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="Ex: Riviera, Marcory..."
                  className="flex-1 text-zinc-900 font-bold text-sm"
                  placeholderTextColor="#cbd5e1"
                  style={{ height: 48 }}
                />
              </View>
            </HubCard>
          </View>

          <View className="mt-8">
            <HubButton 
              variant="primary" 
              loading={loading}
              onPress={handleSave}
              icon={<Save size={18} color="white" />}
            >
              ENREGISTRER LES MODIFICATIONS
            </HubButton>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
