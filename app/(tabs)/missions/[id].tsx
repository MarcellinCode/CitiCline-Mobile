import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  Weight, 
  CheckCircle2, 
  Info,
  AlertTriangle
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';

export default function MissionDetail() {
  const router = useRouter();
  const { id, name, type, color } = useLocalSearchParams();
  const [step, setStep] = useState<'info' | 'scan' | 'weight' | 'success'>('info');
  const [scanned, setScanned] = useState(false);
  const [weight, setWeight] = useState('');

  const isMarketplace = type?.toString().toLowerCase().includes('recyclage') || type?.toString().toLowerCase().includes('bac');

  const handleScan = () => {
    // Simulation de scan réussi
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
        headerTitle: "MISSION DÉTAIL",
        headerTitleStyle: { fontWeight: '900' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="ml-4 p-2 bg-slate-50 rounded-xl">
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        ),
        headerShadowVisible: false
      }} />

      <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
        <AnimatePresence exitBeforeEnter>
          {step === 'info' && (
            <MotiView 
              key="info"
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <View className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 items-center">
                <View className="w-20 h-20 bg-white rounded-[2rem] items-center justify-center shadow-sm mb-6">
                  <MapPin size={32} color={color?.toString() || '#2aa275'} />
                </View>
                <Text className="text-2xl font-black text-[#020617] uppercase italic mb-2">{name}</Text>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type}</Text>
              </View>

              <View className="p-6 bg-slate-900 rounded-[2.5rem]">
                <View className="flex-row items-center mb-4">
                  <Info size={16} color="#2aa275" />
                  <Text className="ml-2 text-primary font-black text-[9px] uppercase tracking-widest">Instructions</Text>
                </View>
                <Text className="text-white/80 text-xs font-bold leading-5">
                   {isMarketplace 
                     ? "Vérifiez la qualité des matières. Le paiement sera déduit de votre balance après validation du poids réel."
                     : "Scannez le badge QR du foyer pour valider le passage. En cas d'absence, prenez une photo de la rue."}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => setStep('scan')}
                className="w-full bg-primary py-6 rounded-[2rem] items-center shadow-xl shadow-primary/20"
              >
                <Text className="text-white font-black uppercase tracking-widest">Lancer l'opération</Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {step === 'scan' && (
            <MotiView 
              key="scan"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 items-center py-10"
            >
              <View className="w-full aspect-square bg-slate-100 rounded-[3rem] overflow-hidden border-2 border-dashed border-slate-300 items-center justify-center relative">
                 {!scanned ? (
                   <>
                     <Camera size={48} color="#94a3b8" />
                     <Text className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Visez le QR Code</Text>
                     
                     {/* QR Viewfinder lines simulation */}
                     <View className="absolute top-10 left-10 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                     <View className="absolute top-10 right-10 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                     <View className="absolute bottom-10 left-10 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                     <View className="absolute bottom-10 right-10 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                   </>
                 ) : (
                   <MotiView 
                     from={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="items-center"
                   >
                     <CheckCircle2 size={64} color="#2aa275" />
                     <Text className="mt-4 text-primary font-black uppercase tracking-widest">Code Validé</Text>
                   </MotiView>
                 )}
              </View>

              <TouchableOpacity 
                onPress={handleScan}
                className="mt-12 bg-slate-900 px-10 py-5 rounded-2xl"
              >
                <Text className="text-white font-black uppercase tracking-widest text-xs">Simuler Scan</Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {step === 'weight' && (
            <MotiView 
               key="weight"
               from={{ opacity: 0, translateX: 20 }}
               animate={{ opacity: 1, translateX: 0 }}
               className="space-y-8"
            >
               <View className="bg-slate-50 p-8 rounded-[3rem] items-center">
                 <Weight size={48} color="#6366f1" />
                 <Text className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Saisie de la Pesée</Text>
                 
                 <View className="flex-row items-end gap-3">
                   <Text className="text-6xl font-black italic tracking-tighter text-[#020617]">
                     {weight || "0.0"}
                   </Text>
                   <Text className="text-xl font-black text-slate-400 pb-2 italic">kg</Text>
                 </View>
               </View>

               <View className="flex-row flex-wrap justify-between gap-y-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
                    <TouchableOpacity 
                      key={k}
                      onPress={() => {
                        if (k === '⌫') setWeight(prev => prev.slice(0, -1));
                        else if (weight.length < 5) setWeight(prev => prev + k);
                      }}
                      style={{ width: '31%' }}
                      className="bg-slate-100 h-16 rounded-2xl items-center justify-center active:bg-slate-200"
                    >
                      <Text className="font-black text-lg">{k}</Text>
                    </TouchableOpacity>
                  ))}
               </View>

               <TouchableOpacity 
                onPress={handleFinalize}
                className="w-full bg-indigo-600 py-6 rounded-[2rem] items-center shadow-xl shadow-indigo-600/20"
              >
                <Text className="text-white font-black uppercase tracking-widest">Valider & Payer</Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {step === 'success' && (
            <MotiView 
               key="success"
               from={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex-1 items-center justify-center pt-20"
            >
               <View className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] items-center justify-center mb-8">
                  <CheckCircle2 size={48} color="#2aa275" />
               </View>
               <Text className="text-3xl font-black text-[#020617] uppercase italic tracking-tighter text-center px-4">Collecte Terminée</Text>
               <Text className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center">Données transmises à City OS</Text>

               <TouchableOpacity 
                onPress={() => router.push('/(tabs)/missions')}
                className="mt-16 w-full bg-slate-900 py-6 rounded-[2rem] items-center"
              >
                <Text className="text-white font-black uppercase tracking-widest">Retour à la route</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
