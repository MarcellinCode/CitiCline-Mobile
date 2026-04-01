import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Truck, 
  Wrench, 
  Droplets, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
  Fuel,
  ArrowLeft
} from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { HubButton } from '@/components/ui/HubButton';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function FleetScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // En mode réel, on récupérerait le véhicule assigné à l'agent
        // Pour la démo, on simule un véhicule
        setVehicle({
          plate_number: 'AB-123-CD',
          model: 'Benne Ordures Mercedes',
          current_mileage: 45200,
          next_oil_change: 50000,
          insurance_expiry: '2026-05-15',
          status: 'active'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [profile?.id]);

  const handleChecklist = () => {
    Alert.alert(
      "Checklist Terminée",
      "Votre rapport de prise de poste a été transmis. Le véhicule est apte au service.",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#2A9D8F" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ 
        headerShown: true,
        headerTitle: () => <HubText variant="label" className="text-zinc-900 italic tracking-[0.2em] mb-0">MA FLOTTE</HubText>,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'white' },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigateSafe(router, ROUTES.ESPACE)}
            className="ml-4 w-10 h-10 bg-zinc-50 rounded-xl items-center justify-center border border-zinc-100"
          >
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        ),
      }} />

      <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
        {/* En-tête Véhicule */}
        <HubCard className="bg-zinc-900 p-8 mb-8 border-0 overflow-hidden">
           <View className="flex-row items-center gap-6">
              <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center">
                 <Truck size={32} color="white" />
              </View>
              <View>
                 <HubText variant="h2" className="text-white mb-1">{vehicle?.plate_number}</HubText>
                 <HubText variant="label" className="text-primary italic tracking-widest">{vehicle?.model}</HubText>
              </View>
           </View>
           
           <View className="mt-8 pt-8 border-t border-white/10 flex-row justify-between">
              <View>
                 <HubText variant="label" className="text-zinc-500 mb-1">Kilométrage</HubText>
                 <HubText variant="h2" className="text-white">{vehicle?.current_mileage.toLocaleString()} KM</HubText>
              </View>
              <View className="items-end">
                 <HubText variant="label" className="text-zinc-500 mb-1">Status</HubText>
               <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                  <HubText variant="label" className="text-emerald-500 text-[10px] mb-0">EN SERVICE</HubText>
               </View>
              </View>
           </View>
           
           <View className="absolute -bottom-10 -right-10 opacity-10">
              <Truck size={200} color="white" />
           </View>
        </HubCard>

        {/* Alertes & Échéances */}
        <HubText variant="label" className="text-zinc-400 mb-6 italic tracking-widest">ALERTES & ENTRETIEN</HubText>
        
        <View className="gap-4 mb-10">
           <HubCard className="flex-row items-center justify-between p-6 bg-zinc-50 border-0">
              <View className="flex-row items-center gap-4">
                 <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center">
                    <Droplets size={20} color="#D97706" />
                 </View>
                 <View>
                    <HubText variant="h3" className="text-zinc-900">Vidange Moteur</HubText>
                    <HubText variant="body" className="text-zinc-400 text-xs">Dans {(vehicle?.next_oil_change - vehicle?.current_mileage).toLocaleString()} km</HubText>
                 </View>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
           </HubCard>

           <HubCard className="flex-row items-center justify-between p-6 bg-zinc-50 border-0">
              <View className="flex-row items-center gap-4">
                 <View className="w-12 h-12 bg-emerald-100 rounded-xl items-center justify-center">
                    <ShieldCheck size={20} color="#059669" />
                 </View>
                 <View>
                    <HubText variant="h3" className="text-zinc-900">Assurance</HubText>
                    <HubText variant="body" className="text-zinc-400 text-xs">Expire le {vehicle?.insurance_expiry}</HubText>
                 </View>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
           </HubCard>
        </View>

        {/* Actions Rapides */}
        <HubText variant="label" className="text-zinc-400 mb-6 italic tracking-widest">CONTRÔLE QUOTIDIEN</HubText>
        
        <HubCard className="p-8 border-2 border-dashed border-zinc-200 bg-white mb-20 items-center">
           <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-6">
              <ClipboardCheck size={32} color="#2A9D8F" />
           </View>
           <HubText variant="h3" className="text-zinc-900 text-center mb-2">Checklist Prise de Poste</HubText>
           <HubText variant="body" className="text-zinc-400 text-center text-xs mb-8">
              Sécurisez votre route en vérifiant les 12 points de contrôle obligatoires.
           </HubText>
           
           <HubButton 
              onPress={handleChecklist}
              variant="outline"
              size="md"
              className="w-full"
           >
              Lancer la Checklist
           </HubButton>
        </HubCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
