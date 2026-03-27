import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { HubButton } from '@/components/ui/HubButton';
import { HubText } from '@/components/ui/HubText';
import Logo from '@/components/ui/Logo';

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
        router.replace(ROUTES.MARKETPLACE as any);
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
      className="flex-1 bg-white"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 60 }} 
        className="px-8"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 0) }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-12 h-12 bg-zinc-50 rounded-2xl items-center justify-center border border-zinc-100"
          >
              <ChevronLeft size={24} color="#020617" />
          </TouchableOpacity>
        </View>

        <View className="mt-10 mb-10 items-center">
          <Logo size="large" />
          <HubText variant="label" className="mt-4">
            Connectez-vous pour continuer
          </HubText>
        </View>

        <View className="mb-8">
          <HubText variant="label" className="mb-3 ml-2 text-zinc-900">Adresse Email</HubText>
          <View className="bg-zinc-50 border border-zinc-100 rounded-3xl flex-row items-center px-5 h-16">
            <Mail size={20} color="#94a3b8" />
            <TextInput 
              placeholder="votre@email.com" 
              placeholderTextColor="#cbd5e1"
              className="flex-1 ml-3 font-semibold text-zinc-900 text-base"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <HubText variant="label" className="mb-3 ml-2 mt-6 text-zinc-900">Mot de passe</HubText>
          <View className="bg-zinc-50 border border-zinc-100 rounded-3xl flex-row items-center px-5 h-16">
            <Lock size={20} color="#94a3b8" />
            <TextInput 
              placeholder="••••••••" 
              placeholderTextColor="#cbd5e1"
              className="flex-1 ml-3 font-semibold text-zinc-900 text-base"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity className="mt-4 self-end px-1">
            <HubText variant="caption" className="text-primary font-black uppercase">Mot de passe oublié ?</HubText>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <HubButton 
            onPress={signInWithEmail}
            disabled={loading}
            variant="primary"
            size="xl"
            icon={<ArrowRight size={20} color="white" />}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </HubButton>
        </View>

        <View className="flex-row items-center my-10">
          <View className="flex-1 h-[1px] bg-zinc-100" />
          <HubText variant="label" className="mx-4 text-zinc-400">Ou se connecter avec</HubText>
          <View className="flex-1 h-[1px] bg-zinc-100" />
        </View>

        <View className="flex-row gap-4 mb-10">
          <TouchableOpacity className="flex-1 bg-white border border-zinc-100 h-16 rounded-3xl items-center justify-center shadow-sm">
            <Image 
              source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
              className="w-6 h-6"
            />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white border border-zinc-100 h-16 rounded-3xl items-center justify-center shadow-sm">
            <Image 
              source={{ uri: 'https://img.icons8.com/material-sharp/48/000000/github.png' }} 
              className="w-6 h-6"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
           onPress={() => router.push('/(auth)/signup' as any)}
           className="items-center pb-10"
        >
          <HubText variant="body" className="text-zinc-500">
            Nouveau ici ? <HubText variant="body" className="text-primary font-black uppercase tracking-widest text-[10px]">Créer un compte</HubText>
          </HubText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
