import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState } from 'react';
import { ChevronRight, Recycle, Wallet, Globe } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import Logo from '@/components/ui/Logo';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: "Collecte\nIntelligente",
    description: "Vendez vos ressources recyclables en quelques clics et participez à l'économie circulaire.",
    color: "#10b981",
    Icon: Recycle,
  },
  {
    id: 2,
    title: "Impact\nMonétisé",
    description: "Chaque action compte. Transformez vos déchets en revenus réels grâce à notre système de valorisation.",
    color: "#f59e0b",
    Icon: Wallet,
  },
  {
    id: 3,
    title: "Planète\nProtégée",
    description: "Faites partie du changement. Réduisez votre empreinte carbone tout en optimisant votre gestion locale.",
    color: "#10b981",
    Icon: Globe,
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

  const CurrentIcon = SLIDES[currentSlide].Icon;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <View style={styles.topHeader}>
        <View style={styles.logoWrapperTiny}>
            <Logo size="small" />
        </View>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.skipText}>Sauter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false} 
        bounces={false}
      >
        <View style={styles.imageSection}>
            <View style={[styles.iconCircle, { backgroundColor: `${SLIDES[currentSlide].color}1A` }]}>
               <CurrentIcon size={width * 0.35} color={SLIDES[currentSlide].color} strokeWidth={1.5} />
            </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.indicatorContainer}>
            {SLIDES.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.indicator, 
                  i === currentSlide ? styles.indicatorActive : styles.indicatorInactive
                ]} 
              />
            ))}
          </View>

          <View style={styles.textContent}>
            <Text style={styles.title}>
              {SLIDES[currentSlide].title}
            </Text>
            <Text style={styles.description}>
              {SLIDES[currentSlide].description}
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={handleNext}
              style={styles.nextButton}
              activeOpacity={0.8}
            >
              <ChevronRight size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    height: 60,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoWrapperTiny: {
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    flex: 1.2,
    backgroundColor: 'white',
    paddingHorizontal: 40,
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 40,
    backgroundColor: '#10b981',
  },
  indicatorInactive: {
    width: 10,
    backgroundColor: '#f1f5f9',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#020617',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    lineHeight: 38,
    marginBottom: 16,
    letterSpacing: -1.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  footer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  nextButton: {
    width: 68,
    height: 68,
    backgroundColor: '#020617',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  }
});
