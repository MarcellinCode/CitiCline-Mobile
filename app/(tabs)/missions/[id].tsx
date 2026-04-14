import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { 
  ArrowLeft, 
  MapPin, 
  Weight, 
  CheckCircle2, 
  Info,
  ArrowRight,
  Camera
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { HubButton } from '@/components/ui/HubButton';
import { uploadProofImage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MissionDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name, type, color } = useLocalSearchParams();
  const [mission, setMission] = useState<any>(null);
  const [step, setStep] = useState<'info' | 'scan' | 'weight' | 'success'>('info');
  const [scanned, setScanned] = useState(false);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
        loadMission();
    }
  }, [id]);

  const loadMission = async () => {
    try {
        setLoading(true);
        const { data, error } = await supabase
            .from('wastes')
            .select('*, waste_types(*), profiles!wastes_seller_id_fkey(*)')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        setMission(data);
    } catch (err) {
        console.error("loadMission error:", err);
        Alert.alert("Erreur", "Impossible de charger les détails de la mission.");
    } finally {
        setLoading(false);
    }
  };

  const isMarketplace = mission?.mission_type !== 'subscription_pickup';
  const displayType = mission?.mission_type === 'subscription_pickup' ? 'Collecte Abonnement' : 'Marketplace';
  const displayColor = mission?.mission_type === 'subscription_pickup' ? '#2A9D8F' : '#f59e0b';

  // Pre-request permissions when entering scan step
  useEffect(() => {
    if (step === 'scan' && (!permission || !permission.granted)) {
        requestPermission();
    }
  }, [step, permission?.granted]);

  const handleScan = async () => {
    if (!permission || !permission.granted) {
        const response = await requestPermission();
        if (!response.granted) {
            Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire pour cette opération.");
            return;
        }
        return; // Return and wait for rerender with granted permission
    }
    
    if (cameraRef.current) {
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
            if (photo) {
                setLoading(true);
                const publicUrl = await uploadProofImage(photo.uri);
                
                if (!photoBefore) {
                    setPhotoBefore(publicUrl);
                    await supabase.from('wastes').update({ photo_url: publicUrl }).eq('id', id);
                } else {
                    setPhotoAfter(publicUrl);
                }
                
                setScanned(true);
                setTimeout(() => {
                    if (isMarketplace) {
                        setStep('weight');
                    } else {
                        setStep('success');
                    }
                }, 1000);
            }
        } catch (err) {
            console.error("Capture/Upload error:", err);
            Alert.alert("Erreur", "Impossible de capturer ou d'envoyer la photo.");
        } finally {
            setLoading(false);
        }
    }
  };

  const handleFinalize = async () => {
    if (isMarketplace && !weight) {
      Alert.alert("Erreur", "Veuillez saisir le poids réel du lot.");
      return;
    }
    
    try {
        setUpdating(true);
        const { data: rpcData, error: rpcError } = await supabase.rpc('fn_finalize_collection', {
            p_waste_id: id,
            p_final_weight: isMarketplace ? parseFloat(weight) : 0
        });
        
        if (rpcError) throw rpcError;
        if (rpcData && rpcData.success === false) throw new Error(rpcData.error);
        
        setStep('success');
    } catch (err: any) {
        console.error("Finalize error:", err);
        Alert.alert("Erreur", err.message || "Impossible de valider la mission.");
    } finally {
        setUpdating(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ 
        headerShown: true,
        headerTitle: () => <HubText variant="label" className="text-zinc-900 italic tracking-[0.2em] mb-0">MISSION DÉTAIL</HubText>,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="ml-4 w-10 h-10 bg-zinc-50 rounded-xl items-center justify-center border border-zinc-100">
            <ArrowLeft size={18} color="#020617" strokeWidth={3} />
          </TouchableOpacity>
        ),
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'white' }
      }} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#2A9D8F" size="large" />
            <HubText variant="label" className="mt-4 text-zinc-400">Chargement de la mission...</HubText>
        </View>
      ) : (
        <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
          {step === 'info' && (
            <View key="info">
              <HubCard className="p-10 border-0 bg-primary/5 items-center mb-8">
                <View className="w-20 h-20 bg-white rounded-[2rem] items-center justify-center shadow-xl shadow-zinc-200/50 mb-8">
                  <MapPin size={32} color={displayColor} strokeWidth={3} />
                </View>
                <HubText variant="h2" className="text-zinc-900 mb-1">{mission?.profiles?.full_name || 'Citoyen'}</HubText>
                <HubText variant="label" className="text-primary italic tracking-widest">{displayType}</HubText>
              </HubCard>

              <HubCard className="bg-zinc-900 p-8 mb-10 border-0">
                <View className="flex-row items-center gap-2 mb-4">
                  <Info size={16} color="#2A9D8F" strokeWidth={3} />
                  <HubText variant="label" className="text-primary italic tracking-widest mb-0">INSTRUCTIONS</HubText>
                </View>
                <HubText variant="body" className="text-white/80 leading-relaxed italic">
                   {isMarketplace 
                     ? "Vérifiez la qualité des matières sur place. Une photo et la pesée réelle sont obligatoires pour le débit du client."
                     : "Mission d'abonnement : Collectez le bac du foyer. Une photo 'après' est requise pour confirmer le service."}
                </HubText>
              </HubCard>

              <HubButton 
                onPress={() => setStep('scan')}
                variant="primary"
                size="xl"
                icon={<ArrowRight size={20} color="white" />}
              >
                Lancer l'opération
              </HubButton>
            </View>
          )}

          {step === 'scan' && (
            <View key="camera" className="items-center py-10">
              <View className="w-full aspect-[3/4] bg-zinc-900 rounded-[3rem] border-4 border-zinc-100 items-center justify-center relative overflow-hidden">
                 {!scanned ? (
                   permission?.granted ? (
                     <CameraView
                       ref={cameraRef}
                       style={StyleSheet.absoluteFill}
                       facing="back"
                     >
                       <View className="flex-1 items-center justify-center">
                          <View className="absolute top-12 left-12 w-16 h-16 border-t-8 border-l-8 border-white rounded-tl-3xl opacity-50" />
                          <View className="absolute top-12 right-12 w-16 h-16 border-t-8 border-r-8 border-white rounded-tr-3xl opacity-50" />
                          <View className="absolute bottom-12 left-12 w-16 h-16 border-b-8 border-l-8 border-white rounded-bl-3xl opacity-50" />
                          <View className="absolute bottom-12 right-12 w-16 h-16 border-b-8 border-r-8 border-white rounded-tr-3xl opacity-50" />
                       </View>
                     </CameraView>
                   ) : (
                     <View className="items-center p-10">
                        <Camera size={48} color="#94a3b8" strokeWidth={1} />
                        <HubText variant="label" className="mt-6 text-zinc-500 text-center italic">
                          CLIQUEZ SUR LE BOUTON CI-DESSOUS{'\n'}POUR ACTIVER LA CAMÉRA
                        </HubText>
                     </View>
                   )
                 ) : (
                    <View className="items-center">
                     <View className="w-24 h-24 bg-emerald-500 rounded-full items-center justify-center shadow-2xl shadow-emerald-500/50">
                        <CheckCircle2 size={48} color="white" />
                     </View>
                     <HubText variant="h2" className="mt-8 text-zinc-900">PREUVE ENREGISTRÉE</HubText>
                    </View>
                 )}
              </View>

              {!scanned && (
                <View className="mt-12 w-full px-10">
                  <HubButton 
                    onPress={handleScan}
                    variant="primary"
                    size="xl"
                    loading={loading}
                    icon={<Camera size={20} color="white" />}
                  >
                    {!photoBefore ? "Prendre Photo Avant" : "Prendre Photo Après"}
                  </HubButton>
                  
                  <View className="mt-6">
                    <HubText variant="label" className="text-zinc-400 text-center italic">
                      {!photoBefore 
                        ? "Prenez une photo du site AVANT l'intervention" 
                        : "Prenez une photo du site APRÈS le nettoyage"}
                    </HubText>
                  </View>
                </View>
              )}
            </View>
          )}

          {step === 'weight' && (
            <View key="weight">
               <HubCard className="bg-zinc-50 border-0 p-10 items-center mb-10">
                 <Weight size={48} color="#2A9D8F" strokeWidth={1.5} />
                 <HubText variant="label" className="mt-6 text-zinc-400 italic mb-8">SAISIE DE LA PESÉE RÉELLE</HubText>
                 
                 <View className="flex-row items-end gap-3">
                   <HubText variant="h1" className="text-7xl text-zinc-900 italic mb-[-10]">
                     {weight || "0.0"}
                   </HubText>
                   <HubText variant="h2" className="text-primary italic">KG</HubText>
                 </View>
               </HubCard>

               <View className="flex-row flex-wrap justify-between gap-4 mb-10">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
                    <TouchableOpacity 
                      key={k}
                      onPress={() => {
                        if (k === '⌫') setWeight(prev => prev.slice(0, -1));
                        else if (weight.length < 5) setWeight(prev => prev + k);
                      }}
                      className="w-[30%] h-20 bg-zinc-50 rounded-3xl items-center justify-center border border-zinc-100"
                    >
                      <HubText variant="h2" className="text-zinc-900 text-2xl">{k}</HubText>
                    </TouchableOpacity>
                  ))}
               </View>

               <HubButton 
                onPress={handleFinalize}
                variant="primary"
                size="xl"
              >
                Valider & Débiter
              </HubButton>
            </View>
          )}

          {step === 'success' && (
            <View key="success" className="items-center justify-center pt-20">
               <View className="w-32 h-32 bg-emerald-50 rounded-[3rem] items-center justify-center mb-10">
                  <CheckCircle2 size={64} color="#10b981" strokeWidth={2.5} />
               </View>
               <HubText variant="h1" className="text-center mb-4">OPÉRATION RÉUSSIE</HubText>
               <HubText variant="body" className="text-center text-zinc-400 italic mb-12">
                   Données transmises instantanément{'\n'}au Central Hub CITICLINE.
               </HubText>

               <HubButton 
                onPress={() => router.push(ROUTES.MISSIONS as any)}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Retour à la route
              </HubButton>
            </View>
          )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}
