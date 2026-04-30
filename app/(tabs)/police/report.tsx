import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Camera, MapPin, Check, X, AlertCircle, ChevronRight, ChevronLeft, ShieldAlert, UserCheck } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { uploadProofImage } from '@/lib/storage';

const { width } = Dimensions.get('window');

const INFRACTION_TYPES = [
  'Dépôt sauvage',
  'Bac débordant',
  'Nuisance sonore',
  'Pollution fluviale',
  'Encombrants non autorisés',
  'Violation de planning'
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Faible', color: '#10b981', icon: Check },
  { id: 'medium', label: 'Moyen', color: '#f59e0b', icon: AlertCircle },
  { id: 'high', label: 'Élevé', color: '#ef4444', icon: ShieldAlert },
  { id: 'critical', label: 'Critique', color: '#7f1d1d', icon: ShieldAlert },
];

export default function ReportInfraction() {
  const router = useRouter();
  const { profile } = useProfile();
  
  // States
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [offenderIdentified, setOffenderIdentified] = useState(false);
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
      Alert.alert('Permission requise', 'La caméra est nécessaire pour documenter l\'infraction.');
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
      Alert.alert('Incomplet', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Image
      const imageUrl = await uploadProofImage(image, 'CITICLINE-infractions');

      // 2. Create Record
      const { error } = await supabase
        .from('environmental_infractions')
        .insert({
          type,
          description: offenderIdentified ? `[CONTREVENANT IDENTIFIÉ] ${description}` : description,
          images: imageUrl ? [imageUrl] : [],
          zone_id: profile?.zone_id,
          reported_by: profile?.id,
          latitude: location ? location.coords.latitude : 0,
          longitude: location ? location.coords.longitude : 0,
          severity,
          status: 'open'
        });

      if (error) throw error;

      Alert.alert('Succès', 'Signalement transmis au City OS.');
      router.replace(ROUTES.POLICE);
    } catch (err: any) {
      console.log('Erreur de transmission, sauvegarde hors-ligne:', err);
      try {
        // Mode Hors-Ligne (Offline Sync)
        const offlineRecord = {
          id: Date.now().toString(),
          type,
          description: offenderIdentified ? `[CONTREVENANT IDENTIFIÉ] ${description}` : description,
          imageUri: image, // Garde l'image locale pour l'upload ultérieur
          zone_id: profile?.zone_id,
          reported_by: profile?.id,
          latitude: location ? location.coords.latitude : 0,
          longitude: location ? location.coords.longitude : 0,
          severity,
          status: 'open',
          timestamp: new Date().toISOString()
        };
        
        const existingStr = await AsyncStorage.getItem('@offline_pvs');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        existing.push(offlineRecord);
        await AsyncStorage.setItem('@offline_pvs', JSON.stringify(existing));
        
        Alert.alert('Mode Hors-Ligne', 'Réseau indisponible. Le PV a été sauvegardé localement et sera synchronisé plus tard.');
        router.replace(ROUTES.POLICE);
      } catch (cacheErr) {
        Alert.alert('Erreur Critique', 'Impossible de sauvegarder le PV même en mode hors-ligne.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View className="flex-row justify-between mb-8 px-4">
      {[1, 2, 3].map((s) => (
        <View 
          key={s} 
          className={`h-1.5 rounded-full ${step >= s ? 'bg-red-600' : 'bg-zinc-100'}`}
          style={{ width: (width - 64) / 3 }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Custom */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          Étape {step} sur 3
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View>
            <Text className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">Preuve Visuelle</Text>
            <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10">Capturez l'infraction en temps réel</Text>
            
            <TouchableOpacity 
                onPress={takePhoto}
                className="w-full h-[350px] rounded-[3.5rem] overflow-hidden bg-zinc-50 border-2 border-dashed border-zinc-200 items-center justify-center"
            >
              {image ? (
                <Image source={{ uri: image }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <View className="w-20 h-20 bg-white rounded-[2rem] items-center justify-center shadow-sm mb-4">
                    <Camera size={38} color="#000" />
                  </View>
                  <Text className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Ouvrir l'appareil</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => image ? setStep(2) : takePhoto()}
              className={`mt-10 py-6 rounded-full items-center justify-center flex-row gap-3 shadow-xl ${image ? 'bg-zinc-900' : 'bg-zinc-100'}`}
            >
              <Text className={`text-xs font-black uppercase tracking-widest ${image ? 'text-white' : 'text-zinc-400'}`}>
                {image ? 'Continuer' : 'Prendre une photo'}
              </Text>
              {image && <ChevronRight size={18} color="white" />}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">Analyse Terrain</Text>
            <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">Détails et qualification de l'incident</Text>

            {/* Severity */}
            <Text className="text-[10px] font-black uppercase text-zinc-900 tracking-widest mb-4 ml-2">Niveau de Gravité</Text>
            <View className="flex-row justify-between mb-8">
              {SEVERITY_LEVELS.map((lvl) => (
                <TouchableOpacity 
                  key={lvl.id}
                  onPress={() => setSeverity(lvl.id)}
                  className={`w-[23%] aspect-square rounded-3xl items-center justify-center border-2 ${severity === lvl.id ? 'bg-white' : 'bg-zinc-50 border-transparent'}`}
                  style={severity === lvl.id ? { borderColor: lvl.color } : {}}
                >
                  <lvl.icon size={20} color={severity === lvl.id ? lvl.color : '#a1a1aa'} />
                  <Text className="text-[8px] font-black uppercase mt-2" style={{ color: severity === lvl.id ? lvl.color : '#a1a1aa' }}>
                    {lvl.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Type */}
            <Text className="text-[10px] font-black uppercase text-zinc-900 tracking-widest mb-4 ml-2">Type d'Infraction</Text>
            <View className="flex-row flex-wrap gap-2 mb-8">
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

            {/* Offender Toggle */}
            <TouchableOpacity 
              onPress={() => setOffenderIdentified(!offenderIdentified)}
              className={`flex-row items-center gap-4 p-6 rounded-3xl mb-8 border ${offenderIdentified ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-50 border-zinc-100'}`}
            >
              <View className={`w-6 h-6 rounded-lg items-center justify-center ${offenderIdentified ? 'bg-red-500' : 'bg-white border border-zinc-200'}`}>
                {offenderIdentified && <Check size={14} color="white" strokeWidth={4} />}
              </View>
              <View className="flex-1">
                <Text className={`text-[10px] font-black uppercase tracking-widest ${offenderIdentified ? 'text-white' : 'text-zinc-900'}`}>Contrevenant identifié</Text>
                <Text className={`text-[8px] font-bold ${offenderIdentified ? 'text-zinc-400' : 'text-zinc-400'}`}>Cochez si vous avez vu le responsable</Text>
              </View>
              <UserCheck size={20} color={offenderIdentified ? "white" : "#d1d5db"} />
            </TouchableOpacity>

            {/* Notes */}
            <Text className="text-[10px] font-black uppercase text-zinc-900 tracking-widest mb-4 ml-2">Commentaires</Text>
            <TextInput 
              className="w-full bg-zinc-50 p-6 rounded-[2.5rem] text-sm font-bold text-zinc-900 border border-zinc-100 mb-10"
              placeholder="Décrivez la situation..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity 
              onPress={() => type ? setStep(3) : Alert.alert('Type requis', 'Veuillez choisir un type d\'infraction.')}
              className={`py-6 rounded-full items-center justify-center flex-row gap-3 shadow-xl ${type ? 'bg-zinc-900' : 'bg-zinc-100'}`}
            >
              <Text className={`text-xs font-black uppercase tracking-widest ${type ? 'text-white' : 'text-zinc-400'}`}>Suivant</Text>
              {type && <ChevronRight size={18} color="white" />}
            </TouchableOpacity>
            <View className="h-10" />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">Localisation</Text>
            <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10">Vérification de la zone d'intervention</Text>

            <View className="w-full h-48 bg-zinc-50 rounded-[3rem] items-center justify-center border border-zinc-100 mb-8">
              <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center animate-pulse">
                <MapPin size={32} color="#ef4444" />
              </View>
              <Text className="text-[10px] font-black text-red-600 uppercase mt-4 tracking-widest">
                Position GPS Verrouillée
              </Text>
              <Text className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">
                {location ? `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}` : "Acquisition..."}
              </Text>
            </View>

            <View className="bg-zinc-900 p-8 rounded-[3rem] mb-10">
               <View className="flex-row items-center gap-3 mb-4">
                  <CheckCircle size={16} color="#10b981" />
                  <Text className="text-[10px] font-black text-white uppercase tracking-widest">Récapitulatif Prêt</Text>
               </View>
               <Text className="text-[9px] text-zinc-400 font-bold leading-relaxed">
                 Le signalement sera transmis au département environnemental de la mairie. Une équipe pourra être dépêchée selon la gravité.
               </Text>
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading}
              className={`w-full py-6 rounded-full items-center justify-center flex-row gap-4 shadow-xl ${loading ? 'bg-zinc-200' : 'bg-red-600 shadow-red-500/30'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check size={20} color="white" strokeWidth={3} />
                  <Text className="text-sm font-black text-white uppercase tracking-widest">Transmettre au City OS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Missing Lucide Icon in original import
const CheckCircle = ({ size, color }: { size: number, color: string }) => (
  <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: color, alignItems: 'center', justify-content: 'center' }}>
    <Check size={size*0.7} color="white" strokeWidth={4} />
  </View>
);
