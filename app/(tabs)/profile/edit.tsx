import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Camera, Save, User, MapPin, ChevronLeft, Image as ImageIcon } from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { HubButton } from '@/components/ui/HubButton';
import { uploadProofImage } from '@/lib/storage';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, refreshProfile } = useProfile();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [city, setCity] = useState(profile?.city || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploadingAvatar(true);
      try {
        const url = await uploadProofImage(result.assets[0].uri, 'CITICLINE-avatars');
        setAvatarUrl(url);
      } catch (err) {
        Alert.alert('Erreur', "Échec de l'envoi de la photo.");
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

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
          avatar_url: avatarUrl,
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
          {/* Avatar Section */}
          <View className="items-center mb-4">
            <TouchableOpacity 
              onPress={pickAvatar}
              disabled={uploadingAvatar}
              className="relative"
            >
              <View className="w-28 h-28 rounded-[2.5rem] bg-zinc-50 border-2 border-zinc-100 items-center justify-center overflow-hidden shadow-sm">
                {avatarUrl ? (
                  <RNImage source={{ uri: avatarUrl }} className="w-full h-full" />
                ) : (
                  <User size={48} color="#94a3b8" />
                )}
                {uploadingAvatar && (
                  <View className="absolute inset-0 bg-white/60 items-center justify-center">
                    <ActivityIndicator color="#064e3b" />
                  </View>
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900 rounded-xl items-center justify-center shadow-lg border-2 border-white">
                <Camera size={14} color="white" />
              </View>
            </TouchableOpacity>
            <HubText variant="label" className="text-zinc-400 mt-4 italic font-black text-[8px] uppercase tracking-widest">
              {uploadingAvatar ? 'ENVOI EN COURS...' : 'PHOTO DE PROFIL'}
            </HubText>
          </View>
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
