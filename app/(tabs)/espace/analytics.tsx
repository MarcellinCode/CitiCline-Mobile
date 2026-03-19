import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, BarChart3, TrendingUp, Package, Users, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';

export default function AnalyticsScreen() {
  const router = useRouter();

  const stats = [
    { label: "Poids Total", value: "1,280 kg", icon: Package, color: "#2aa275" },
    { label: "Croissance", value: "+12.5%", icon: TrendingUp, color: "#6366f1" },
    { label: "Agents Actifs", value: "8", icon: Users, color: "#f59e0b" },
    { label: "Énergie Économisée", value: "450 kWh", icon: Zap, color: "#ef4444" },
  ];

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ 
        headerShown: true,
        headerTitle: "ANALYTIQUE",
        headerTitleStyle: { fontWeight: '900' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="ml-4 p-2 bg-slate-50 rounded-xl">
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        ),
        headerShadowVisible: false
      }} />

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <MotiView 
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-8"
        >
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Rapport de Performance</Text>
          <Text className="text-3xl font-black text-[#020617] italic tracking-tighter uppercase">Impact Zone</Text>
        </MotiView>

        <View className="flex-row flex-wrap justify-between gap-y-4">
          {stats.map((stat, i) => (
            <View 
              key={i} 
              style={{ width: '47%' }}
              className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 items-center"
            >
              <View className="mb-4 w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</Text>
              <Text className="text-xl font-black text-[#020617]">{stat.value}</Text>
            </View>
          ))}
        </View>

        <View className="mt-8 p-8 bg-slate-900 rounded-[2.5rem] overflow-hidden">
             <Text className="text-primary font-black uppercase text-[10px] tracking-widest mb-2">Note B2B</Text>
             <Text className="text-white font-bold leading-5 italic">
               "Les rapports détaillés par concession et les exports CSV sont disponibles uniquement sur le tableau de bord Web CitrixLine."
             </Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
