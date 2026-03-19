import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image as RNImage } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { Mail, Lock, ArrowRight, Github, Chrome as Google_ } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        alert(error.message);
      } else if (data.session) {
        router.replace('/(tabs)/marketplace');
      }
    } catch (err: any) {
      alert(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <View className="mt-20 mb-12">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
              <RNImage source={require('../../assets/icon.png')} className="w-full h-full" resizeMode="cover" />
            </View>
            <Text className="text-4xl font-black text-[#020617] uppercase italic tracking-tighter">
              CITI<Text className="text-primary">CLINE</Text>
            </Text>
          </View>
          <Text className="text-4xl font-black text-[#020617] uppercase italic tracking-tighter leading-none mb-2">
            Bon retour
          </Text>
          <Text className="text-base font-medium text-slate-400">
            Connectez-vous pour continuer.
          </Text>
        </View>

        <View className="space-y-4">
          <View className="bg-slate-50 border border-slate-100 rounded-2xl flex-row items-center px-4 h-16">
            <Mail size={20} color="#94a3b8" />
            <TextInput 
              placeholder="Email" 
              className="flex-1 ml-3 font-semibold text-[#020617]"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View className="bg-slate-50 border border-slate-100 rounded-2xl flex-row items-center px-4 h-16">
            <Lock size={20} color="#94a3b8" />
            <TextInput 
              placeholder="Mot de passe" 
              className="flex-1 ml-3 font-semibold text-[#020617]"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity className="self-end mt-4 mb-8">
          <Text className="text-primary font-bold text-xs uppercase tracking-widest">Oublié ?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={signInWithEmail}
          disabled={loading}
          className="w-full bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
        >
          <Text className="text-white font-black uppercase tracking-widest text-xs mr-2">
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
          <ArrowRight size={16} color="white" />
        </TouchableOpacity>

        <View className="flex-row items-center my-10">
          <View className="flex-1 h-[1px] bg-slate-100" />
          <Text className="mx-4 text-slate-300 font-black text-[10px] uppercase tracking-widest">Ou</Text>
          <View className="flex-1 h-[1px] bg-slate-100" />
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity className="flex-1 bg-white border border-slate-100 h-16 rounded-2xl flex-row items-center justify-center shadow-sm">
            <Github size={20} color="#020617" />
            <Text className="ml-3 font-black text-[10px] uppercase tracking-widest text-[#020617]">GitHub</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white border border-slate-100 h-16 rounded-2xl flex-row items-center justify-center shadow-sm">
             <Google_ size={20} color="#ea4335" />
             <Text className="ml-3 font-black text-[10px] uppercase tracking-widest text-[#020617]">Google</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-auto items-center pb-8">
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text className="text-slate-400 font-medium">
              Pas de compte ? <Text className="text-primary font-black uppercase text-[10px] tracking-widest">S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
