import { View, Text, ScrollView, TextInput, TouchableOpacity, Image as RNImage, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, ArrowRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { WasteType } from '@/lib/types';
import { useProfile } from '@/hooks/useProfile';

export default function PublishWaste() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [typeId, setTypeId] = useState<number | null>(null);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTypes() {
      try {
        const { data, error } = await supabase.from('waste_types').select('*');
        if (error) throw error;
        if (data) setWasteTypes(data as WasteType[]);
      } catch (err) {
        console.error("fetchTypes error:", err);
      }
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
    if (!typeId || !weight || !location || !profile?.id) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = null;
      let lng = null;
      if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
      }

      const { error } = await supabase.from('wastes').insert({
        seller_id: profile.id,
        type_id: typeId,
        estimated_weight: parseFloat(weight),
        location: location,
        latitude: lat,
        longitude: lng,
        status: 'published',
        images: images,
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Publier" subtitle="Mettez vos déchets en ligne" />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionLabel}>Photos</Text>
        <View style={styles.photosRow}>
          {images.map((img, i) => (
            <View key={i} style={styles.photoContainer}>
               <RNImage source={{ uri: img }} style={styles.photoImage} />
               <TouchableOpacity 
                 onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                 style={styles.photoDeleteBtn}
               >
                 <Trash2 size={12} color="white" />
               </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            onPress={pickImage}
            style={styles.addPhotoBtn}
          >
            <Camera size={24} color="#94a3b8" />
            <Text style={styles.addPhotoText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Type de déchet</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
            {wasteTypes.map((type) => (
               <TouchableOpacity 
                 key={type.id}
                 onPress={() => setTypeId(type.id)}
                 style={[
                   styles.typeBtn,
                   typeId === type.id ? styles.typeBtnActive : styles.typeBtnInactive
                 ]}
               >
                 <Text style={styles.typeEmoji}>{type.emoji}</Text>
                 <Text style={[
                   styles.typeName,
                   typeId === type.id ? styles.typeNameActive : styles.typeNameInactive
                 ]}>
                    {type.name}
                 </Text>
               </TouchableOpacity>
            ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Détails</Text>
        <View style={styles.detailsContainer}>
            <View style={styles.inputContainer}>
                <TextInput 
                    placeholder="Poids estimé (KG)" 
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    style={styles.inputText}
                    placeholderTextColor="#94a3b8"
                />
            </View>
            <View style={[styles.inputContainer, { marginTop: 16 }]}>
                <TextInput 
                    placeholder="Lieu de collecte (ex: Cocody, Abidjan)" 
                    value={location}
                    onChangeText={setLocation}
                    style={styles.inputText}
                    placeholderTextColor="#94a3b8"
                />
            </View>
        </View>

        <TouchableOpacity 
          onPress={handlePublish}
          disabled={loading}
          style={[styles.publishBtn, { marginBottom: insets.bottom + 120 }]}
        >
          <Text style={styles.publishBtnText}>
            {loading ? 'Publication...' : 'Publier maintenant'}
          </Text>
          <ArrowRight size={16} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollView: { flex: 1, paddingHorizontal: 32 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 },
  
  // Photos
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 40 },
  photoContainer: { width: 96, height: 96, borderRadius: 16, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#f1f5f9' },
  photoImage: { width: '100%', height: '100%' },
  photoDeleteBtn: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, backgroundColor: '#ef4444', borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  addPhotoBtn: { width: 96, height: 96, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  addPhotoText: { fontSize: 8, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginTop: 8 },

  // Types
  typesScroll: { flexDirection: 'row', marginBottom: 40 },
  typeBtn: { marginRight: 16, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 24, borderWidth: 1 },
  typeBtnActive: { backgroundColor: '#2aa275', borderColor: '#2aa275' },
  typeBtnInactive: { backgroundColor: '#f8fafc', borderColor: '#f1f5f9' },
  typeEmoji: { fontSize: 20, marginBottom: 4 },
  typeName: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3 },
  typeNameActive: { color: 'white' },
  typeNameInactive: { color: '#0f172a' },

  // Details
  detailsContainer: { marginBottom: 40 },
  inputContainer: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 16, height: 64, justifyContent: 'center' },
  inputText: { fontWeight: '600', color: '#0f172a' },

  // Publish
  publishBtn: { width: '100%', backgroundColor: '#2aa275', height: 64, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#2aa275', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  publishBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3, fontSize: 12, marginRight: 8 },
});
