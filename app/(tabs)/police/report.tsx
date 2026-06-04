import React, { useState, useEffect } from 'react';
import { 
  View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, 
  Image, ActivityIndicator, Alert, Dimensions, Platform, KeyboardAvoidingView 
} from 'react-native';
import { 
  Camera, MapPin, Check, X, AlertCircle, ChevronRight, ChevronLeft, 
  ShieldAlert, UserCheck, CheckCircle2, Navigation, RefreshCw 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { uploadProofImage } from '@/lib/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';

const { width } = Dimensions.get('window');

const INFRACTION_TYPES = [
  { label: 'Dépôt sauvage', emoji: '🗑️' },
  { label: 'Bac débordant', emoji: '🪣' },
  { label: 'Nuisance sonore', emoji: '🔊' },
  { label: 'Pollution fluviale', emoji: '🌊' },
  { label: 'Encombrants non autorisés', emoji: '🛋️' },
  { label: 'Violation de planning', emoji: '📅' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Faible', color: '#10b981', icon: Check },
  { id: 'medium', label: 'Moyen', color: '#f59e0b', icon: AlertCircle },
  { id: 'high', label: 'Élevé', color: '#ef4444', icon: ShieldAlert },
  { id: 'critical', label: 'Critique', color: '#7f1d1d', icon: ShieldAlert },
];

export default function ReportInfraction() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const [address, setAddress] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Auto-acquire location on mount
  useEffect(() => {
    acquireLocation();
  }, []);

  const acquireLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission GPS', 'La localisation est requise pour géolocaliser le signalement.');
        setLoadingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);

      // Reverse geocode for human-readable address
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo) {
          const parts = [geo.street, geo.district, geo.city, geo.region].filter(Boolean);
          setAddress(parts.join(', ') || `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
        }
      } catch {
        setAddress(`${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
      }
    } catch (err) {
      console.error('Location error:', err);
      Alert.alert('Erreur GPS', 'Impossible d\'obtenir la position. Veuillez réessayer.');
    } finally {
      setLoadingLocation(false);
    }
  };

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
      const imageUrl = await uploadProofImage(image, 'CleanZone-infractions');

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
          address: address || null,
          manual_address: manualAddress || null,
          severity,
          status: 'open'
        });

      if (error) throw error;

      Alert.alert(
        '✅ Signalement Transmis', 
        'Le City OS a reçu votre signalement. Une équipe sera alertée selon la gravité.',
        [{ 
          text: profile?.role === 'agent_police_verte' ? 'Retour au Radar' : profile?.role === 'organisation_admin' ? 'Retour Espace' : "Retour à l'accueil", 
          onPress: () => {
            if (profile?.role === 'agent_police_verte') router.replace(ROUTES.POLICE);
            else if (profile?.role === 'organisation_admin') router.replace('/espace' as any);
            else router.replace(ROUTES.MARKETPLACE as any);
          }
        }]
      );
    } catch (err: any) {
      console.log('Erreur de transmission, sauvegarde hors-ligne:', err);
      try {
        // Mode Hors-Ligne (Offline Sync)
        const offlineRecord = {
          id: Date.now().toString(),
          type,
          description: offenderIdentified ? `[CONTREVENANT IDENTIFIÉ] ${description}` : description,
          imageUri: image,
          zone_id: profile?.zone_id,
          reported_by: profile?.id,
          latitude: location ? location.coords.latitude : 0,
          longitude: location ? location.coords.longitude : 0,
          address: address || null,
          manual_address: manualAddress || null,
          severity,
          status: 'open',
          timestamp: new Date().toISOString()
        };
        
        const existingStr = await AsyncStorage.getItem('@offline_pvs');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        existing.push(offlineRecord);
        await AsyncStorage.setItem('@offline_pvs', JSON.stringify(existing));
        
        Alert.alert(
          '📡 Mode Hors-Ligne', 
          'Le PV a été sauvegardé localement. Il sera synchronisé automatiquement dès le retour du réseau.',
          [{ 
            text: profile?.role === 'agent_police_verte' ? 'Retour au Radar' : "Retour à l'accueil", 
            onPress: () => router.replace(profile?.role === 'agent_police_verte' ? ROUTES.POLICE : ROUTES.MARKETPLACE as any) 
          }]
        );
      } catch (cacheErr) {
        Alert.alert('Erreur Critique', 'Impossible de sauvegarder le PV même en mode hors-ligne.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View className="flex-row gap-2 mb-8 px-2">
      {[1, 2, 3].map((s) => (
        <View 
          key={s} 
          className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-red-600' : 'bg-zinc-100'}`}
        />
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header padding */}
      <View style={{ height: Platform.OS === 'ios' ? 0 : insets.top }} />
      
      {/* Header */}
      <View 
        className="px-6 flex-row items-center justify-between mb-4"
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : 10 }}
      >
        <TouchableOpacity 
          onPress={() => step > 1 ? setStep(step - 1) : router.back()}
          className="w-10 h-10 bg-zinc-50 rounded-xl items-center justify-center border border-zinc-100"
        >
          <ChevronLeft size={20} color="#020617" strokeWidth={3} />
        </TouchableOpacity>
        <HubText variant="label" className="text-zinc-400 italic tracking-[0.2em] mb-0">
          Étape {step} / 3
        </HubText>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-zinc-50 rounded-xl items-center justify-center border border-zinc-100"
        >
          <X size={18} color="#020617" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      >

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  ÉTAPE 1 : PREUVE VISUELLE                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <View>
            <HubText variant="h1" className="text-zinc-900 mb-1">Preuve Visuelle</HubText>
            <HubText variant="label" className="text-zinc-400 italic tracking-widest mb-8">
              Capturez l'infraction en temps réel
            </HubText>
            
            <TouchableOpacity 
                onPress={takePhoto}
                className="w-full h-[280px] rounded-[3.5rem] overflow-hidden bg-zinc-50 border-2 border-dashed border-zinc-200 items-center justify-center"
            >
              {image ? (
                <Image source={{ uri: image }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <View className="w-20 h-20 bg-white rounded-[2rem] items-center justify-center shadow-sm mb-4">
                    <Camera size={38} color="#000" />
                  </View>
                  <HubText variant="label" className="text-zinc-400 italic tracking-[0.15em]">
                    Ouvrir l'appareil photo
                  </HubText>
                </View>
              )}
            </TouchableOpacity>

            {/* Location preview (auto-acquired in background) */}
            <HubCard className="mt-6 p-5 border-0 bg-zinc-50 flex-row items-center gap-3">
              {loadingLocation ? (
                <>
                  <ActivityIndicator size="small" color="#2A9D8F" />
                  <HubText variant="caption" className="text-zinc-400 italic flex-1">
                    Acquisition GPS en cours...
                  </HubText>
                </>
              ) : location ? (
                <>
                  <View className="w-8 h-8 bg-emerald-50 rounded-lg items-center justify-center">
                    <Navigation size={16} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <HubText variant="caption" className="text-zinc-900 font-bold text-[10px]">
                      Position verrouillée
                    </HubText>
                    <HubText variant="caption" className="text-zinc-400 text-[9px]" numberOfLines={1}>
                      {address || 'Coordonnées acquises'}
                    </HubText>
                  </View>
                  <CheckCircle2 size={16} color="#10b981" />
                </>
              ) : (
                <>
                  <View className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center">
                    <MapPin size={16} color="#ef4444" />
                  </View>
                  <HubText variant="caption" className="text-red-500 italic flex-1">
                    GPS non disponible
                  </HubText>
                  <TouchableOpacity onPress={acquireLocation}>
                    <RefreshCw size={16} color="#ef4444" />
                  </TouchableOpacity>
                </>
              )}
            </HubCard>

            <TouchableOpacity 
              onPress={() => image ? setStep(2) : takePhoto()}
              className={`mt-8 py-5 rounded-full items-center justify-center flex-row gap-3 shadow-xl ${image ? 'bg-zinc-900' : 'bg-zinc-100'}`}
            >
              <HubText variant="label" className={`mb-0 tracking-widest ${image ? 'text-white' : 'text-zinc-400'}`}>
                {image ? 'Continuer' : 'Prendre une photo'}
              </HubText>
              {image && <ChevronRight size={18} color="white" />}
            </TouchableOpacity>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  ÉTAPE 2 : FORMULAIRE DE QUALIFICATION                    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <View>
            <HubText variant="h1" className="text-zinc-900 mb-1">Analyse Terrain</HubText>
            <HubText variant="label" className="text-zinc-400 italic tracking-widest mb-8">
              Détails et qualification de l'incident
            </HubText>

            {/* Severity */}
            <HubText variant="label" className="text-zinc-900 mb-4 ml-1">Niveau de Gravité</HubText>
            <View className="flex-row justify-between mb-8">
              {SEVERITY_LEVELS.map((lvl) => (
                <TouchableOpacity 
                  key={lvl.id}
                  onPress={() => setSeverity(lvl.id)}
                  className={`w-[23%] aspect-square rounded-3xl items-center justify-center border-2 ${severity === lvl.id ? 'bg-white' : 'bg-zinc-50 border-transparent'}`}
                  style={severity === lvl.id ? { borderColor: lvl.color } : {}}
                >
                  <lvl.icon size={20} color={severity === lvl.id ? lvl.color : '#a1a1aa'} />
                  <HubText 
                    variant="caption" 
                    className="mt-2 text-[8px] font-black uppercase"
                    style={{ color: severity === lvl.id ? lvl.color : '#a1a1aa' }}
                  >
                    {lvl.label}
                  </HubText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Type */}
            <HubText variant="label" className="text-zinc-900 mb-4 ml-1">Type d'Infraction</HubText>
            <View className="flex-row flex-wrap gap-2 mb-8">
              {INFRACTION_TYPES.map((t) => (
                <TouchableOpacity 
                  key={t.label} 
                  onPress={() => setType(t.label)}
                  className={`px-5 py-4 rounded-2xl border flex-row items-center gap-2 ${type === t.label ? 'bg-red-600 border-red-600' : 'bg-white border-zinc-100'}`}
                >
                  <HubText className="text-sm">{t.emoji}</HubText>
                  <HubText 
                    variant="caption" 
                    className={`text-[9px] font-black uppercase tracking-wider ${type === t.label ? 'text-white' : 'text-zinc-500'}`}
                  >
                    {t.label}
                  </HubText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Offender Toggle */}
            <TouchableOpacity 
              onPress={() => setOffenderIdentified(!offenderIdentified)}
              className={`flex-row items-center gap-4 p-5 rounded-2xl mb-8 border ${offenderIdentified ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-50 border-zinc-100'}`}
            >
              <View className={`w-6 h-6 rounded-lg items-center justify-center ${offenderIdentified ? 'bg-red-500' : 'bg-white border border-zinc-200'}`}>
                {offenderIdentified && <Check size={14} color="white" strokeWidth={4} />}
              </View>
              <View className="flex-1">
                <HubText variant="caption" className={`text-[10px] font-black uppercase tracking-widest ${offenderIdentified ? 'text-white' : 'text-zinc-900'}`}>
                  Contrevenant identifié
                </HubText>
                <HubText variant="caption" className="text-zinc-400 text-[8px]">
                  Cochez si vous avez vu le responsable
                </HubText>
              </View>
              <UserCheck size={20} color={offenderIdentified ? 'white' : '#d1d5db'} />
            </TouchableOpacity>

            {/* Commentaire / Description */}
            <HubText variant="label" className="text-zinc-900 mb-4 ml-1">Commentaire</HubText>
            <TextInput 
              className="w-full bg-zinc-50 p-6 rounded-[2rem] text-sm font-bold text-zinc-900 border border-zinc-100 mb-10"
              placeholder="Décrivez la situation observée..."
              placeholderTextColor="#a1a1aa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              style={{ minHeight: 120 }}
            />

            <TouchableOpacity 
              onPress={() => type ? setStep(3) : Alert.alert('Type requis', 'Veuillez choisir un type d\'infraction.')}
              className={`py-5 rounded-full items-center justify-center flex-row gap-3 shadow-xl ${type ? 'bg-zinc-900' : 'bg-zinc-100'}`}
            >
              <HubText variant="label" className={`mb-0 tracking-widest ${type ? 'text-white' : 'text-zinc-400'}`}>
                Suivant
              </HubText>
              {type && <ChevronRight size={18} color="white" />}
            </TouchableOpacity>
            <View className="h-10" />
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  ÉTAPE 3 : LOCALISATION + RÉCAPITULATIF + ENVOI           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <View>
            <HubText variant="h1" className="text-zinc-900 mb-1">Localisation</HubText>
            <HubText variant="label" className="text-zinc-400 italic tracking-widest mb-8">
              Vérification de la zone d'intervention
            </HubText>

            {/* Location Card */}
            <HubCard className="p-8 border-0 bg-zinc-50 items-center mb-6">
              <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-5">
                <MapPin size={36} color="#ef4444" />
              </View>
              <HubText variant="label" className="text-red-600 italic tracking-[0.2em] mb-2">
                Position GPS Verrouillée
              </HubText>
              {address ? (
                <HubText variant="body" className="text-zinc-600 text-center text-[12px] leading-relaxed italic">
                  📍 {address}
                </HubText>
              ) : (
                <HubText variant="caption" className="text-zinc-400 italic">
                  {location 
                    ? `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`
                    : 'Acquisition en cours...'}
                </HubText>
              )}

              {/* Refresh location button */}
              <TouchableOpacity 
                onPress={acquireLocation}
                className="mt-4 flex-row items-center gap-2 bg-white px-4 py-2 rounded-full border border-zinc-100"
              >
                <RefreshCw size={12} color="#2A9D8F" />
                <HubText variant="caption" className="text-primary text-[9px] font-black uppercase tracking-wider">
                  Recalibrer GPS
                </HubText>
              </TouchableOpacity>
            </HubCard>

            {/* Manual Locality Field */}
            <View className="mb-8">
              <HubText variant="label" className="text-zinc-900 mb-4 ml-1">Précision de la Localité (Facultatif)</HubText>
              <HubCard className="p-0 border-2 border-zinc-50 overflow-hidden">
                <View className="flex-row items-center px-6 py-4 gap-4">
                  <MapPin size={18} color="#94a3b8" />
                  <TextInput 
                    value={manualAddress}
                    onChangeText={setManualAddress}
                    placeholder="Ex: Face à la pharmacie, Immeuble bleu..."
                    className="flex-1 text-zinc-900 font-bold text-sm"
                    placeholderTextColor="#cbd5e1"
                    style={{ height: 48 }}
                  />
                </View>
              </HubCard>
              <HubText variant="caption" className="text-zinc-400 text-[8px] mt-2 italic px-2">
                Aidez les agents à localiser l'incident plus précisément.
              </HubText>
            </View>

            {/* Récapitulatif */}
            <HubCard className="bg-zinc-900 p-6 border-0 mb-8">
              <View className="flex-row items-center gap-2 mb-4">
                <CheckCircle2 size={16} color="#10b981" />
                <HubText variant="label" className="text-white italic tracking-widest mb-0">
                  Récapitulatif du Signalement
                </HubText>
              </View>

              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <HubText variant="caption" className="text-zinc-500 text-[9px] uppercase">Type</HubText>
                  <HubText variant="caption" className="text-white font-bold text-[10px]">{type}</HubText>
                </View>
                <View className="flex-row items-center justify-between">
                  <HubText variant="caption" className="text-zinc-500 text-[9px] uppercase">Gravité</HubText>
                  <HubText 
                    variant="caption" 
                    className="font-bold text-[10px]"
                    style={{ color: SEVERITY_LEVELS.find(s => s.id === severity)?.color }}
                  >
                    {SEVERITY_LEVELS.find(s => s.id === severity)?.label?.toUpperCase()}
                  </HubText>
                </View>
                {offenderIdentified && (
                  <View className="flex-row items-center justify-between">
                    <HubText variant="caption" className="text-zinc-500 text-[9px] uppercase">Contrevenant</HubText>
                    <HubText variant="caption" className="text-red-400 font-bold text-[10px]">IDENTIFIÉ</HubText>
                  </View>
                )}
                {manualAddress ? (
                  <View className="flex-row items-center justify-between">
                    <HubText variant="caption" className="text-zinc-500 text-[9px] uppercase">Localité</HubText>
                    <HubText variant="caption" className="text-emerald-400 font-bold text-[10px] truncate max-w-[150px]">{manualAddress}</HubText>
                  </View>
                ) : null}
                {description ? (
                  <View className="mt-2 pt-3 border-t border-zinc-800">
                    <HubText variant="caption" className="text-zinc-500 text-[9px] uppercase mb-1">Commentaire</HubText>
                    <HubText variant="caption" className="text-zinc-300 text-[10px] italic leading-relaxed">
                      "{description}"
                    </HubText>
                  </View>
                ) : null}
              </View>
            </HubCard>

            {/* Bouton de Soumission */}
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
                  <HubText variant="label" className="text-white mb-0 tracking-widest">
                    Transmettre au City OS
                  </HubText>
                </>
              )}
            </TouchableOpacity>

            <View className="h-40" />
          </View>
        )}

      </ScrollView>
      <View style={{ height: insets.bottom + 20 }} />
    </View>
  );
}
