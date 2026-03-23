import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import Logo from '@/components/ui/Logo';

const { width } = Dimensions.get('window');

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
        alert("Veuillez remplir tous les champs");
        return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        alert(error.message);
      } else if (data.session) {
        router.replace(ROUTES.MARKETPLACE);
      }
    } catch (err: any) {
      alert(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 60 }} 
        style={{ paddingHorizontal: 32, paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Logo size="large" />
          <Text style={styles.headerSubtitle}>
            Connectez-vous pour continuer
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Adresse Email</Text>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#94a3b8" />
            <TextInput 
              placeholder="votre@email.com" 
              placeholderTextColor="#cbd5e1"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={[styles.label, { marginTop: 24 }]}>Mot de passe</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#94a3b8" />
            <TextInput 
              placeholder="••••••••" 
              placeholderTextColor="#cbd5e1"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotPassText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={signInWithEmail}
          disabled={loading}
          style={styles.loginButton}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
          <View style={styles.loginButtonIcon}>
            <ArrowRight size={18} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Ou se connecter avec</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Image 
              source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Image 
              source={{ uri: 'https://img.icons8.com/material-sharp/48/000000/github.png' }} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
           onPress={() => router.push('/(auth)/signup')}
           style={styles.footer}
        >
          <Text style={styles.footerText}>
            Nouveau ici ? <Text style={styles.footerLink}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 70,
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#020617',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '700',
    color: '#020617',
    fontSize: 14,
  },
  forgotPass: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
  },
  forgotPassText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 11,
  },
  loginButton: {
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
    elevation: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    fontStyle: 'italic',
  },
  loginButtonIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94a3b8',
    fontWeight: '900',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  socialBtn: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13,
  },
  footerLink: {
    color: '#10b981',
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 11,
  }
});
