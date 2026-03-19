import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Settings, Bell, Lock, Shield, CircleHelp } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-8 pt-6 flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>
        <Text className="text-sm font-black text-[#020617] uppercase tracking-widest">Paramètres</Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1 px-8 pb-20">
        <View className="space-y-6">
          {[
            { icon: Bell, title: "Notifications" },
            { icon: Lock, title: "Sécurité" },
            { icon: Shield, title: "Confidentialité" },
            { icon: CircleHelp, title: "Aide & Support" },
          ].map((item, i) => (
            <TouchableOpacity key={i} className="flex-row items-center justify-between py-6 border-b border-slate-50">
              <View className="flex-row items-center">
                <item.icon size={20} color="#64748b" />
                <Text className="ml-4 text-sm font-bold text-slate-600 uppercase tracking-widest">{item.title}</Text>
              </View>
              <ChevronLeft size={16} color="#cbd5e1" className="rotate-180" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
