import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { HubText } from '@/components/ui/HubText';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react-native';

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const articles = [
    {
      id: "Article 1",
      title: "Objet du Service",
      content: "RecyCla est une plateforme de mise en relation entre citoyens, entreprises et organisations de collecte pour optimiser la gestion des déchets et l'économie circulaire."
    },
    {
      id: "Article 2",
      title: "Responsabilités",
      content: "L'utilisateur s'engage à fournir des informations exactes sur la nature et le poids des déchets signalés. Les organisations de collecte s'engagent à respecter les fréquences de passage convenues."
    },
    {
      id: "Article 3",
      title: "Propriété Intellectuelle",
      content: "Tous les contenus, logos et technologies utilisés sur l'application sont la propriété exclusive de Citicline Hub."
    },
    {
        id: "Article 4",
        title: "Modifications des Conditions",
        content: "Nous nous réservons le droit de modifier ces conditions à tout moment. Vous serez notifié via l'application en cas de changement majeur."
      }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title="Conditions" 
        subtitle="CADRE LÉGAL DU HUB"
        onBack={() => router.back()}
      />

      <ScrollView 
        className="px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View className="mb-10 items-center">
            <View className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-3xl items-center justify-center mb-6">
                <FileText size={32} color="#020617" />
            </View>
            <HubText variant="h2" className="text-zinc-900 text-center uppercase italic">Contrat de Service</HubText>
            <HubText variant="body" className="text-zinc-500 text-center text-xs mt-2 px-4 italic">
                Dernière mise à jour : 01 Avril 2026
            </HubText>
        </View>

        {articles.map((article, idx) => (
            <View key={idx} className="mb-8 pl-4 border-l-2 border-zinc-100">
                <HubText variant="label" className="text-primary mb-1 tracking-widest">{article.id}</HubText>
                <HubText variant="h3" className="text-zinc-900 mb-3 text-sm">{article.title}</HubText>
                <HubText variant="body" className="text-zinc-500 text-xs leading-5">
                    {article.content}
                </HubText>
            </View>
        ))}

        <View className="mt-12 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
            <View className="flex-row items-center gap-3 mb-4">
                <CheckCircle2 size={20} color="#059669" />
                <HubText variant="h3" className="text-emerald-900 text-xs">Engagement Écologique</HubText>
            </View>
            <HubText variant="body" className="text-emerald-700 text-[10px] leading-4">
                En utilisant RecyCla, vous rejoignez une communauté engagée pour une ville plus propre et durable.
            </HubText>
        </View>

        <View className="mt-6 p-8 bg-zinc-900 rounded-[2.5rem] flex-row items-center gap-6">
             <AlertCircle size={32} color="#f59e0b" />
             <View className="flex-1">
                <HubText variant="h3" className="text-white text-xs mb-1">Assistance Légale</HubText>
                <HubText variant="body" className="text-zinc-500 text-[9px]">
                    Pour toute question juridique, contactez legal@citicline.hub
                </HubText>
             </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' }
});
