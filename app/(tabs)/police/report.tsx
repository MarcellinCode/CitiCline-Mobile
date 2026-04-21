import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Camera, MapPin, Check, X, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';

const INFRACTION_TYPES = [
  'Dépôt sauvage',
  'Bac débordant',
  'Nuisance sonore',
  'Pollution fluviale',
  'Encombrants non autorisés',
  'Violation de planning'
];

export default function ReportInfraction() {
  const router = useRouter();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre caméra pour le constat.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!type || !image) {
      Alert.alert('Champs manquants', 'Veuillez prendre une photo et choisir un type d\'infraction.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Image to Supabase Storage
      const fileName = `${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: fileName,
        type: 'image/jpeg',
      } as any);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('infractions')
        .upload(`reports/${fileName}`, formData);

      const imageUrl = uploadError ? null : supabase.storage.from('infractions').getPublicUrl(`reports/${fileName}`).data.publicUrl;

      // 2. Create Infraction Record
      const { error } = await supabase
        .from('environmental_infractions')
        .insert({
          type,
          description,
          images: imageUrl ? [imageUrl] : [],
          zone_id: profile?.zone_id,
          reported_by: profile?.id,
          location: location ? `POINT(${location.coords.longitude} ${location.coords.latitude})` : null,
          severity: 'medium', // Default
          status: 'open'
        });

      if (error) throw error;

      Alert.alert('Succès', 'Infraction signalée avec succès au City OS.');
      router.replace(ROUTES.POLICE);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue lors du signalement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Back navigation */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
           <Text className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">← Revenir</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">Constat de Terrain</Text>
        <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10">Mise à jour du Radar Central</Text>

        {/* Photo Capture Section */}
        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase text-zinc-900 tracking-widest mb-4 ml-2">Preuve Visuelle</Text>
          {image ? (
            <View className="relative">
              <Image source={{ uri: image }} className="w-full h-64 rounded-[3rem] bg-zinc-100" />
              <TouchableOpacity 
                onPress={() => setImage(null)}
                className="absolute top-4 right-4 bg-white/90 w-10 h-10 rounded-full items-center justify-center shadow-lg"
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
                onPress={takePhoto}
                className="w-full h-64 rounded-[3rem] bg-zinc-50 border-2 border-dashed border-zinc-200 items-center justify-center space-y-4"
            >
              <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center shadow-sm">
                <Camera size={32} color="#000" />
              </View>
              <Text className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Prendre le cliché</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Type Selection */}
        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase text-zinc-900 tracking-widest mb-4 ml-2">Type d'Infraction</Text>
          <View className="flex-row flex-wrap gap-2">
            {INFRACTION_TYPES.map((t) => (
              <TouchableOpacity 
                key={t} 
                onPress={() => setType(t)}
                className={`px-6 py-4 rounded-3xl border ${type === t ? 'bg-red-600 border-red-600' : 'bg-white border-zinc-100'}`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${type === t ? 'text-white' : 'text-zinc-500'}`}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase text-zinc-900 tracking-widest mb-4 ml-2">Observations (Optionnel)</Text>
          <TextInput 
            className="w-full bg-zinc-50 p-6 rounded-[2.5rem] text-sm font-bold text-zinc-900 border border-zinc-100"
            placeholder="Détails supplémentaires..."
            placeholderTextColor="#a1a1aa"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Location Info */}
        <View className="flex-row items-center gap-3 mb-12 px-2">
           <MapPin size={16} color={location ? "#059669" : "#e11d48"} />
           <Text className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
             {location ? `Géo-localisation active : ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : "Recherche GPS en cours..."}
           </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={loading}
          className={`w-full py-6 rounded-[2.5rem] items-center justify-center flex-row gap-4 mb-20 shadow-xl ${loading ? 'bg-zinc-200' : 'bg-red-600 shadow-red-500/30'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Check size={20} color="white" strokeWidth={3} />
              <Text className="text-sm font-black text-white uppercase tracking-widest">Envoyer au City OS</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
