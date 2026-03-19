import { View, Text, ScrollView, TextInput, TouchableOpacity, Image as RNImage } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Camera, Plus, Trash2, ArrowRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { WasteType } from '@/lib/types';
import { useEffect } from 'react';

export default function PublishWaste() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [typeId, setTypeId] = useState<number | null>(null);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTypes() {
      const { data } = await supabase.from('waste_types').select('*');
      if (data) setWasteTypes(data as WasteType[]);
    }
    fetchTypes();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handlePublish = async () => {
    if (!typeId || !weight || !location) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload images logic (simplified for now to save to public URL if needed, or just array)
      // Real implementation would use supabase.storage.upload
      
      const { error } = await supabase.from('wastes').insert({
        seller_id: user.id,
        type_id: typeId,
        estimated_weight: parseFloat(weight),
        location: location,
        status: 'published',
        images: images, // In real app, these would be Supabase storage URLs
      });

      if (error) throw error;
      
      alert("Listing publié avec succès !");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Publier" subtitle="Mettez vos déchets en ligne" />

      <ScrollView className="flex-1 p-8">
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Photos</Text>
        <View className="flex-row flex-wrap gap-4 mb-10">
          {images.map((img, i) => (
            <View key={i} className="w-24 h-24 rounded-2xl overflow-hidden relative border border-slate-100">
               <RNImage source={{ uri: img }} className="w-full h-full" />
               <TouchableOpacity 
                 onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                 className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-lg items-center justify-center shadow-sm"
               >
                 <Trash2 size={12} color="white" />
               </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            onPress={pickImage}
            className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 items-center justify-center"
          >
            <Camera size={24} color="#94a3b8" />
            <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Ajouter</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Type de déchet</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-10">
            {wasteTypes.map((type) => (
               <TouchableOpacity 
                 key={type.id}
                 onPress={() => setTypeId(type.id)}
                 className={`mr-4 px-6 py-4 rounded-[1.5rem] border ${typeId === type.id ? 'bg-primary border-primary' : 'bg-slate-50 border-slate-100'}`}
               >
                 <Text className="text-xl mb-1">{type.emoji}</Text>
                 <Text className={`text-[10px] font-black uppercase tracking-widest ${typeId === type.id ? 'text-white' : 'text-slate-900'}`}>
                    {type.name}
                 </Text>
               </TouchableOpacity>
            ))}
        </ScrollView>

        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Détails</Text>
        <View className="space-y-4 mb-10">
            <View className="bg-slate-50 border border-slate-100 rounded-2xl px-4 h-16 justify-center">
                <TextInput 
                    placeholder="Poids estimé (KG)" 
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    className="font-semibold text-slate-900"
                />
            </View>
            <View className="bg-slate-50 border border-slate-100 rounded-2xl px-4 h-16 justify-center">
                <TextInput 
                    placeholder="Lieu de collecte (ex: Cocody, Abidjan)" 
                    value={location}
                    onChangeText={setLocation}
                    className="font-semibold text-slate-900"
                />
            </View>
        </View>

        <TouchableOpacity 
          onPress={handlePublish}
          disabled={loading}
          className="w-full bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mb-20"
        >
          <Text className="text-white font-black uppercase tracking-widest text-xs mr-2">
            {loading ? 'Publication...' : 'Publier maintenant'}
          </Text>
          <ArrowRight size={16} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
