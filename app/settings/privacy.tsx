import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { Shield, Eye, Lock, Share2 } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      icon: Eye,
      title: "Collecte des données",
      content: "Nous collectons uniquement les informations nécessaires au bon fonctionnement du service : votre nom, votre localisation pour les collectes, et vos coordonnées de contact.",
      color: "#0ea5e9"
    },
    {
      icon: Lock,
      title: "Sécurité & Stockage",
      content: "Vos données sont stockées de manière sécurisée via Supabase et ne sont jamais vendues à des tiers. Nous utilisons un chiffrement de niveau bancaire pour protéger vos transactions.",
      color: "#10b981"
    },
    {
      icon: Share2,
      title: "Partage avec les partenaires",
      content: "Seules les organisations de collecte (Mairies/Entreprises) auxquelles vous êtes abonné reçoivent vos informations de localisation pour assurer le service.",
      color: "#6366f1"
    }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title="Confidentialité" 
        subtitle="VOS DONNÉES SONT SACRÉES"
        onBack={() => router.back()}
      />

      <ScrollView 
        className="px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View className="mb-10 items-center">
            <View className="w-16 h-16 bg-emerald-50 rounded-3xl items-center justify-center mb-6">
                <Shield size={32} color="#059669" />
            </View>
            <HubText variant="h2" className="text-zinc-900 text-center uppercase italic">Protection Totale</HubText>
            <HubText variant="body" className="text-zinc-500 text-center text-xs mt-2 px-4">
                RecyCla s'engage à protéger votre vie privée et vos données personnelles conformément aux réglementations locales.
            </HubText>
        </View>

        {sections.map((section, idx) => (
            <HubCard key={idx} className="p-8 mb-6 border-0 bg-zinc-50">
                <View className="flex-row items-center gap-4 mb-4">
                    <View style={{ backgroundColor: `${section.color}10` }} className="w-10 h-10 rounded-xl items-center justify-center">
                        <section.icon size={18} color={section.color} />
                    </View>
                    <HubText variant="h3" className="text-zinc-900 text-sm">{section.title}</HubText>
                </View>
                <HubText variant="body" className="text-zinc-500 text-xs leading-5">
                    {section.content}
                </HubText>
            </HubCard>
        ))}

        <View className="mt-8 p-10 bg-zinc-900 rounded-[3rem] items-center">
            <HubText variant="h3" className="text-white mb-2 italic">Droit à l'Oubli</HubText>
            <HubText variant="body" className="text-zinc-500 text-center text-[10px] mb-8">
                Vous pouvez demander la suppression intégrale de vos données à tout moment depuis le centre d'assistance.
            </HubText>
            <TouchableOpacity className="px-8 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
                <HubText variant="label" className="text-red-500 text-[8px] mb-0">Demander la suppression</HubText>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' }
});
