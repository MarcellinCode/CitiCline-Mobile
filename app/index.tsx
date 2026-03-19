import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight } from 'lucide-react-native';

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="auto" />
      
      <View className="w-24 h-24 bg-primary/10 rounded-[2.5rem] items-center justify-center mb-8 border border-primary/20 overflow-hidden">
        <Text className="text-4xl text-primary">🌿</Text>
      </View>
 
      <Text className="text-4xl font-black text-[#020617] text-center uppercase italic tracking-tighter mb-2">
        CITI<Text className="text-primary">CLINE</Text>
      </Text>
      <Text className="text-sm font-medium text-slate-400 text-center mb-12">
        La gestion intelligente de vos déchets
      </Text>
 
      <TouchableOpacity 
        onPress={() => router.push('/(auth)/login')}
        className="w-full bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
      >
        <Text className="text-white font-black uppercase tracking-widest text-xs mr-2">
          Commencer l'aventure
        </Text>
        <ArrowRight size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}
