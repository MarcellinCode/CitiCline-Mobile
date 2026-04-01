import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { HubText } from '@/components/ui/HubText';
import { HubCard } from '@/components/ui/HubCard';
import { CircleHelp, Mail, Phone, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "Comment recharger mon portefeuille ?",
      answer: "Allez dans l'onglet 'Espace' ou 'Portefeuille' et cliquez sur 'Recharger'. Pour l'instant, seul le mode simulation est disponible."
    },
    {
      id: 2,
      question: "Ma barque est pleine, que faire ?",
      answer: "Accédez à l'onglet 'Abonnements' et utilisez le bouton 'Barque Pleine (Urgent)'. Votre organisation de collecte sera immédiatement alertée."
    },
    {
      id: 3,
      question: "Comment changer mon type de déchets ?",
      answer: "Lors de la publication d'une nouvelle offre de collecte, vous pouvez sélectionner le type de déchet approprié (Plastique, Métal, etc.)."
    },
    {
        id: 4,
        question: "Qu'est-ce que les Points Éco ?",
        answer: "Les Points Éco récompensent votre engagement en faveur du recyclage. Ils seront bientôt échangeables contre des remises sur vos abonnements."
      }
  ];

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const contactMethods = [
    { icon: Phone, label: "Appeler le Hub", value: "+225 07 00 00 00 00", color: "#10b981" },
    { icon: Mail, label: "Email Support", value: "support@citicline.hub", color: "#0ea5e9" },
    { icon: MessageCircle, label: "Chat en direct", value: "Agents disponibles 24/7", color: "#6366f1" }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title="Centre d'Aide" 
        subtitle="NOUS SOMMES LÀ POUR VOUS"
        onBack={() => router.back()}
      />

      <ScrollView 
        className="px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <HubText variant="label" className="text-zinc-400 mb-6 italic tracking-widest">QUESTIONS FRÉQUENTES</HubText>

        <View className="mb-12">
            {faqs.map((faq) => (
                <TouchableOpacity 
                    key={faq.id} 
                    onPress={() => toggleExpand(faq.id)}
                    activeOpacity={0.7}
                    className="mb-4"
                >
                    <HubCard className={cn(
                        "p-6 border-0",
                        expandedId === faq.id ? "bg-emerald-50 border border-emerald-100" : "bg-zinc-50"
                    )}>
                        <View className="flex-row justify-between items-center">
                            <HubText variant="h3" className="flex-1 text-[11px] text-zinc-900 leading-tight pr-4">
                                {faq.question}
                            </HubText>
                            {expandedId === faq.id ? <ChevronUp size={16} color="#059669" /> : <ChevronDown size={16} color="#94a3b8" />}
                        </View>
                        {expandedId === faq.id && (
                            <HubText variant="body" className="text-zinc-500 text-[10px] mt-4 leading-5">
                                {faq.answer}
                            </HubText>
                        )}
                    </HubCard>
                </TouchableOpacity>
            ))}
        </View>

        <HubText variant="label" className="text-zinc-400 mb-6 italic tracking-widest">CONTACTER LE HUB</HubText>

        <View className="flex-row flex-wrap justify-between gap-y-4">
            {contactMethods.map((method, idx) => (
                <HubCard key={idx} className="w-[48%] p-6 border-0 bg-white shadow-sm border border-zinc-50 items-center justify-center">
                    <View style={{ backgroundColor: `${method.color}10` }} className="w-12 h-12 rounded-2xl items-center justify-center mb-4">
                        <method.icon size={24} color={method.color} />
                    </View>
                    <HubText variant="label" className="text-zinc-400 text-[8px] mb-1">{method.label}</HubText>
                    <HubText variant="h3" className="text-zinc-900 text-[9px] text-center" numberOfLines={1}>{method.value}</HubText>
                </HubCard>
            ))}
        </View>

        <View className="mt-12 items-center">
             <View className="w-12 h-12 bg-zinc-900 rounded-full items-center justify-center mb-4">
                <CircleHelp size={24} color="white" />
             </View>
             <HubText variant="label" className="text-zinc-400 text-center">Version 1.0.4 - Bêta Publique</HubText>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' }
});

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
