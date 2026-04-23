import { View, Text, ScrollView, TextInput, TouchableOpacity, Image as RNImage, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, ArrowRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { WasteType } from '@/lib/types';
import { ROUTES } from '@/constants/routes';
import { useProfile } from '@/hooks/useProfile';

import { uploadProofImage } from '@/lib/storage';

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
      Alert.alert("Champs manquants", "Veuillez remplir tous les champs obligatoires !");
      return;
    }

    setLoading(true);
    try {
      // 1. Get Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = null;
      let lng = null;
      if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
      }

      // 2. Upload all images to Cloudinary
      const uploadedImageUrls = await Promise.all(
        images.map(uri => uploadProofImage(uri, 'CITICLINE-marketplace'))
      );

      // 3. Save to Supabase
      const { error } = await supabase.from('wastes').insert({
        seller_id: profile.id,
        type_id: typeId,
        estimated_weight: parseFloat(weight),
        location: location,
        latitude: lat,
        longitude: lng,
        status: 'published',
        images: uploadedImageUrls,
        description: description
      });

      if (error) throw error;
      
      Alert.alert(
        "Félicitations !", 
        "Votre lot a été publié sur la Marketplace. Les collecteurs à proximité ont été notifiés.",
        [{ text: "OK", onPress: () => router.push(ROUTES.MES_DECHETS as any) }]
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de publier votre annonce. Veuillez vérifier votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header 
        title="Publier un lot" 
        subtitle="Mettez vos ressources en ligne" 
        onBack={() => router.push(ROUTES.ESPACE as any)}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>1. Photos du lot (Max 3)</Text>
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
            {images.length < 3 && (
              <TouchableOpacity onPress={pickImage} style={styles.addPhotoBtn}>
                <Camera size={24} color="#94a3b8" />
                <Text style={styles.addPhotoText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionLabel}>2. Catégorie de déchet</Text>
          <View style={styles.gridContainer}>
            {wasteTypes.map((type) => (
              <TouchableOpacity 
                key={type.id}
                onPress={() => setTypeId(type.id)}
                style={[
                  styles.typeCard,
                  typeId === type.id ? styles.typeCardActive : styles.typeCardInactive
                ]}
              >
                <View style={[
                  styles.emojiBg,
                  typeId === type.id ? styles.emojiBgActive : styles.emojiBgInactive
                ]}>
                  <Text style={styles.typeEmoji}>{type.emoji || '♻️'}</Text>
                </View>
                <Text style={[
                  styles.typeName,
                  typeId === type.id ? styles.typeNameActive : styles.typeNameInactive
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>3. Détails & Localisation</Text>
          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Poids estimé (KG)</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  placeholder="0.00" 
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  style={styles.inputText}
                  placeholderTextColor="#cbd5e1"
                />
              </View>
            </View>

            <View style={[styles.inputWrapper, { marginTop: 20 }]}>
              <Text style={styles.inputLabel}>Ville / Quartier</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  placeholder="Ex: Cocody, Abidjan" 
                  value={location}
                  onChangeText={setLocation}
                  style={styles.inputText}
                  placeholderTextColor="#cbd5e1"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handlePublish}
            disabled={loading}
            style={[styles.publishBtn, { marginBottom: insets.bottom + 120 }]}
          >
            <View style={styles.publishBtnContent}>
              <Text style={styles.publishBtnText}>
                {loading ? 'PUBLICATION...' : "PUBLIER L'ANNONCE"}
              </Text>
              {!loading && <ArrowRight size={18} color="white" />}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 },
  
  // Photos
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  photoContainer: { width: 100, height: 100, borderRadius: 24, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#f1f5f9' },
  photoImage: { width: '100%', height: '100%' },
  photoDeleteBtn: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, backgroundColor: '#ef4444', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addPhotoBtn: { width: 100, height: 100, backgroundColor: '#f8fafc', borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  addPhotoText: { fontSize: 8, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

  // Grid Categories
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  typeCard: { width: '48%', padding: 20, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  typeCardActive: { backgroundColor: 'rgba(42, 162, 117, 0.05)', borderColor: '#2aa275' },
  typeCardInactive: { backgroundColor: '#f8fafc', borderColor: '#f1f5f9' },
  emojiBg: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emojiBgActive: { backgroundColor: '#2aa275' },
  emojiBgInactive: { backgroundColor: 'white' },
  typeEmoji: { fontSize: 24 },
  typeName: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  typeNameActive: { color: '#064e3b' },
  typeNameInactive: { color: '#64748b' },

  // Form
  formSection: { marginBottom: 40 },
  inputWrapper: { gap: 8 },
  inputLabel: { fontSize: 9, fontWeight: 'bold', color: '#475569', marginLeft: 4 },
  inputContainer: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 20, height: 64, justifyContent: 'center' },
  inputText: { fontWeight: '900', color: '#020617', fontSize: 16 },

  // Button
  publishBtn: { backgroundColor: '#020617', height: 72, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  publishBtnContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  publishBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3, fontSize: 13 },
});
