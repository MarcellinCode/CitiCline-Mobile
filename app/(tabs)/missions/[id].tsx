import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { HubButton } from '@/components/ui/HubButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MissionDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name, type, color } = useLocalSearchParams();
  const [step, setStep] = useState<'info' | 'scan' | 'weight' | 'success'>('info');
  const [scanned, setScanned] = useState(false);
  const [weight, setWeight] = useState('');

  const isMarketplace = type?.toString().toLowerCase().includes('recyclage') || type?.toString().toLowerCase().includes('bac');

  const handleScan = () => {
    setScanned(true);
    setTimeout(() => {
        if (isMarketplace) {
          setStep('weight');
        } else {
          setStep('success');
        }
    }, 1500);
  };

  const handleFinalize = () => {
    if (isMarketplace && !weight) {
      Alert.alert("Erreur", "Veuillez saisir le poids réel du lot.");
      return;
    }
    setStep('success');
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

      <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
          {step === 'info' && (
            <View key="info">
              <HubCard className="p-10 border-0 bg-primary/5 items-center mb-8">
                <View className="w-20 h-20 bg-white rounded-[2rem] items-center justify-center shadow-xl shadow-zinc-200/50 mb-8">
                  <MapPin size={32} color={color?.toString() || '#2A9D8F'} strokeWidth={3} />
                </View>
                <HubText variant="h2" className="text-zinc-900 mb-1">{name}</HubText>
                <HubText variant="label" className="text-primary italic tracking-widest">{type}</HubText>
              </HubCard>

              <HubCard className="bg-zinc-900 p-8 mb-10 border-0">
                <View className="flex-row items-center gap-2 mb-4">
                  <Info size={16} color="#2A9D8F" strokeWidth={3} />
                  <HubText variant="label" className="text-primary italic tracking-widest mb-0">INSTRUCTIONS</HubText>
                </View>
                <HubText variant="body" className="text-white/80 leading-relaxed italic">
                   {isMarketplace 
                     ? "Vérifiez la qualité des matières sur place. Le paiement final sera calculé après votre pesée réelle."
                     : "Scannez le badge QR du foyer pour valider le ramassage. Prenez une photo en cas d'imprévu."}
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
              <View className="w-full aspect-square bg-zinc-50 rounded-[4rem] border-4 border-dashed border-zinc-200 items-center justify-center relative overflow-hidden">
                 {!scanned ? (
                   <>
                     <Camera size={64} color="#cbd5e1" strokeWidth={1} />
                     <HubText variant="label" className="mt-6 text-zinc-400">VISEZ LE QR CODE</HubText>
                     
                     <View className="absolute top-12 left-12 w-16 h-16 border-t-8 border-l-8 border-primary rounded-tl-3xl opacity-50" />
                     <View className="absolute top-12 right-12 w-16 h-16 border-t-8 border-r-8 border-primary rounded-tr-3xl opacity-50" />
                     <View className="absolute bottom-12 left-12 w-16 h-16 border-b-8 border-l-8 border-primary rounded-bl-3xl opacity-50" />
                     <View className="absolute bottom-12 right-12 w-16 h-16 border-b-8 border-r-8 border-primary rounded-br-3xl opacity-50" />
                   </>
                 ) : (
                    <View className="items-center">
                     <View className="w-24 h-24 bg-emerald-500 rounded-full items-center justify-center shadow-2xl shadow-emerald-500/50">
                        <CheckCircle2 size={48} color="white" />
                     </View>
                     <HubText variant="h2" className="mt-8 text-zinc-900">Code Validé</HubText>
                    </View>
                 )}
              </View>

              <TouchableOpacity 
                onPress={handleScan}
                className="mt-12 bg-zinc-900 px-10 py-5 rounded-3xl"
              >
                <HubText variant="label" className="text-white italic tracking-widest mb-0">SIMULER SCAN HUB</HubText>
              </TouchableOpacity>
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
