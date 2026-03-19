import { View, Text, Image as RNImage, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: "Videz vos placards",
    description: "Prenez en photo vos déchets recyclables et postez-les en un clin d'œil sur CITICLINE.",
    emoji: "♻️",
    color: "#14b8a6",
    image: require('../assets/onboarding_recycle.png')
  },
  {
    id: 2,
    title: "Gagnez de l'argent",
    description: "Chaque lot de déchet a une valeur. Transformez votre impact écologique en revenus réels.",
    emoji: "💰",
    color: "#eab308",
    image: require('../assets/onboarding_money.png')
  },
  {
    id: 3,
    title: "Sauvez la planète",
    description: "Rejoignez une communauté de collecteurs et de vendeurs engagés pour un environnement plus propre.",
    emoji: "🌎",
    color: "#22c55e",
    image: require('../assets/onboarding_planet.png')
  }
];

export default function Onboarding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <View className="flex-[0.6] items-center justify-center p-10">
        <View className="w-full aspect-square bg-slate-50 rounded-[4rem] items-center justify-center border border-slate-100 overflow-hidden">
          <Text className="text-8xl">{SLIDES[currentSlide].emoji}</Text>
          {/* Once images are downloaded, use <RNImage source={{ uri: SLIDES[currentSlide].image }} /> */}
        </View>
      </View>

      <View className="flex-[0.4] bg-white px-10 pt-6">
        <View className="flex-row gap-1 mb-8">
          {SLIDES.map((_, i) => (
            <View 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-slate-200'}`} 
            />
          ))}
        </View>

        <Text className="text-4xl font-black text-[#020617] uppercase italic tracking-tighter mb-4 leading-none">
          {SLIDES[currentSlide].title}
        </Text>
        <Text className="text-base font-medium text-slate-400 mb-12 leading-relaxed">
          {SLIDES[currentSlide].description}
        </Text>

        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Passer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleNext}
            className="w-16 h-16 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
          >
            <ChevronRight size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
