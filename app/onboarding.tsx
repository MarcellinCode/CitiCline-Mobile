import { View, Dimensions, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useState } from 'react';
import { ChevronRight, Recycle, Wallet, Globe } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { HubButton } from '@/components/ui/HubButton';
import { HubText } from '@/components/ui/HubText';
import Logo from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: "Collecte\nIntelligente",
    description: "Vendez vos ressources recyclables en quelques clics et participez à l'économie circulaire.",
    color: "#2A9D8F",
    Icon: Recycle,
  },
  {
    id: 2,
    title: "Impact\nMonétisé",
    description: "Chaque action compte. Transformez vos déchets en revenus réels grâce à notre système de valorisation.",
    color: "#E9C46A",
    Icon: Wallet,
  },
  {
    id: 3,
    title: "Planète\nProtégée",
    description: "Faites partie du changement. Réduisez votre empreinte carbone tout en optimisant votre gestion locale.",
    color: "#2A9D8F",
    Icon: Globe,
  }
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.push('/(auth)/login');
    }
  };

  const CurrentIcon = SLIDES[currentSlide].Icon;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <View className="flex-row justify-between items-center px-8 h-16">
        <View className="w-10">
            <Logo size="small" />
        </View>
        <HubButton 
          variant="secondary" 
          size="sm" 
          onPress={() => router.push('/(auth)/login')}
        >
          Sauter
        </HubButton>
      </View>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false} 
        bounces={false}
      >
        <View className="flex-1 items-center justify-center p-5">
           <View className="items-center justify-center">
              <View 
                className="w-64 h-64 rounded-[4rem] items-center justify-center"
                style={{ backgroundColor: `${SLIDES[currentSlide].color}15` }}
              >
                 <CurrentIcon size={width * 0.35} color={SLIDES[currentSlide].color} strokeWidth={1.5} />
              </View>
           </View>
        </View>

        <View className="flex-[1.2] bg-white px-10 justify-between pb-10">
          <View>
            <View className="flex-row gap-2 mb-8">
              {SLIDES.map((_, i) => (
                <View 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full",
                    i === currentSlide ? "w-10" : "w-10",
                    i === currentSlide ? "bg-zinc-900" : "bg-zinc-100"
                  )}
                  style={{ backgroundColor: i === currentSlide ? SLIDES[currentSlide].color : '#f1f5f9' }}
                />
              ))}
            </View>

              <View>
                <HubText variant="h1" className="mb-4 text-zinc-900 leading-[0.95]">
                  {SLIDES[currentSlide].title}
                </HubText>
                <HubText variant="body" className="text-zinc-500 leading-6">
                  {SLIDES[currentSlide].description}
                </HubText>
              </View>
          </View>

          <View style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <HubButton 
              onPress={handleNext}
              variant="primary"
              size="lg"
              icon={<ChevronRight size={32} color="white" />}
              className="w-20 rounded-[2.5rem]"
            >
              {""}
            </HubButton>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

