import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image as RNImage } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight } from 'lucide-react-native';
import { CITICLINE_LOGO_BASE64 } from '@/components/ui/logoBase64';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (e) {
        console.error("Home screen auth check failed:", e);
      } finally {
        setIsChecking(false);
      }
    };
    init();
  }, []);

  // Pendant que Supabase vérifie silencieusement, on ne rend RIEN (le Splash Screen couvre ce vide)
  if (isChecking) {
    return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
  }

  const insets = useSafeAreaInsets();

  // Dès qu'on sait qu'il y a un compte, on "téléporte" l'utilisateur instantanément sans peindre l'écran
  if (session) {
    return <Redirect href="/(tabs)/marketplace" />;
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 40) }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <View style={styles.logoWrapper}>
        <RNImage 
          source={{ uri: CITICLINE_LOGO_BASE64 }} 
          style={{ width: width * 0.4, height: width * 0.4 }}
          resizeMode="contain"
        />
      </View>
 
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          CITI<Text style={{ color: '#10b981' }}>CLINE</Text>
        </Text>
        <Text style={styles.subtitle}>
          L'EXCELLENCE DE LA GESTION DES DÉCHETS
        </Text>
      </View>
 
      <TouchableOpacity 
        onPress={() => router.push('/onboarding')}
        style={styles.button}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          Commencer l'aventure
        </Text>
        <View style={styles.buttonIcon}>
            <ArrowRight size={18} color="white" />
        </View>
      </TouchableOpacity>

      
      <Text style={styles.footerBrand}>Powered by Citicline Engineering</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoWrapper: {
    width: width * 0.6,
    height: width * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  hugeIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#020617',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -2,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  button: {
    width: '100%',
    backgroundColor: '#020617',
    height: 72,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 11,
    fontStyle: 'italic',
  },
  buttonIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrand: {
    position: 'absolute',
    bottom: 40,
    fontSize: 8,
    fontWeight: '900',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
