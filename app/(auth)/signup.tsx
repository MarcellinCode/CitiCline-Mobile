import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image as RNImage } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { Mail, Lock, User, ArrowRight, Truck, Building2, ChevronLeft, Phone, MapPin, Briefcase, FileText, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'vendeur' | 'collecteur' | 'organisation_admin' | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Citoyen
  const [district, setDistrict] = useState('');
  
  // Collecteur
  const [vehicleType, setVehicleType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  
  // Organisation
  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [rccm, setRccm] = useState('');
  const [agentCount, setAgentCount] = useState('');

  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: role === 'organisation_admin' ? orgName : fullName,
          role: role,
          phone: phone,
          district: district,
          vehicle_type: vehicleType,
          id_number: idNumber,
          rccm: rccm,
          contact_person: contactPerson,
          agent_count: agentCount
        },
      },
    });

    if (error) alert(error.message);
    else if (!session) alert("Vérifiez votre boîte mail pour confirmer l'inscription !");
    else router.replace('/(tabs)/marketplace/index');
    
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8 pb-12">
        {step === 2 && (
            <TouchableOpacity onPress={() => setStep(1)} className="absolute top-16 left-0 z-10 w-12 h-12 items-center justify-center bg-slate-50 rounded-full border border-slate-100">
                <ChevronLeft size={24} color="#020617" />
            </TouchableOpacity>
        )}

        <View className="mt-20 mb-8 items-center">
          <View className="w-16 h-16 bg-emerald-50 rounded-3xl items-center justify-center border border-emerald-100 mb-6">
            <RNImage source={require('../../assets/icon.png')} className="w-10 h-10 rounded-xl" resizeMode="contain" />
          </View>
          <Text className="text-3xl font-black text-[#020617] tracking-tight mb-2 text-center leading-none">
            Créer un compte
          </Text>
          <Text className="font-medium text-slate-400 text-center">
            Rejoignez l'aventure CITICLINE
          </Text>
        </View>

        {step === 1 ? (
          <View className="space-y-4">
            <Text className="text-center font-black text-slate-500 uppercase tracking-widest mb-4">
              VOUS ÊTES :
            </Text>
            
            {/* Citoyen Card */}
            <TouchableOpacity 
              onPress={() => { setRole('vendeur'); setStep(2); }}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 flex-row items-center shadow-sm"
            >
              <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center mr-4">
                <User color="#10b981" size={24} strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Text className="font-black text-[#020617] uppercase tracking-tight mb-1 text-sm">CITOYEN (FOYER)</Text>
                <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Je vends mes déchets & je gère mes ordures.</Text>
              </View>
              <ArrowRight color="#cbd5e1" size={20} />
            </TouchableOpacity>

            {/* Collecteur Card */}
            <TouchableOpacity 
              onPress={() => { setRole('collecteur'); setStep(2); }}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 flex-row items-center shadow-sm"
            >
              <View className="w-12 h-12 rounded-2xl bg-amber-50 items-center justify-center mr-4">
                <Truck color="#f59e0b" size={24} strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Text className="font-black text-[#020617] uppercase tracking-tight mb-1 text-sm">Collecteur Indépendant</Text>
                <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Je souhaite acheter des lots recyclables.</Text>
              </View>
              <ArrowRight color="#cbd5e1" size={20} />
            </TouchableOpacity>

            {/* Organisation Card */}
            <TouchableOpacity 
              onPress={() => { setRole('organisation_admin'); setStep(2); }}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 flex-row items-center shadow-sm"
            >
              <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center mr-4">
                <Building2 color="#6366f1" size={24} strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Text className="font-black text-[#020617] uppercase tracking-tight mb-1 text-sm">Organisation</Text>
                <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Je gère une zone et ma flotte d'agents.</Text>
              </View>
              <ArrowRight color="#cbd5e1" size={20} />
            </TouchableOpacity>
            
            <View className="mt-8 pt-8 border-t border-slate-100 border-dashed">
                <Text className="text-center font-black text-slate-400 uppercase tracking-widest text-[10px] mb-1">
                    Accès Officiel Mairie
                </Text>
                <Text className="text-center font-bold text-slate-400 italic text-[9px] uppercase tracking-widest leading-relaxed">
                    L'inscription Mairie se fait exclusivement via lien d'invitation sécurisé.
                </Text>
            </View>
          </View>
        ) : (
          <View className="space-y-4">
            
            {role === 'vendeur' && (
                <>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <User size={20} color="#94a3b8" />
                    <TextInput placeholder="Nom complet" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={fullName} onChangeText={setFullName}/>
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <Phone size={20} color="#94a3b8" />
                    <TextInput placeholder="Numéro de téléphone" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <MapPin size={20} color="#94a3b8" />
                    <TextInput placeholder="Quartier / Adresse" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={district} onChangeText={setDistrict} />
                </View>
                </>
            )}

            {role === 'collecteur' && (
                <>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <User size={20} color="#94a3b8" />
                    <TextInput placeholder="Nom complet" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={fullName} onChangeText={setFullName}/>
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <Phone size={20} color="#94a3b8" />
                    <TextInput placeholder="Numéro de téléphone" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <Truck size={20} color="#94a3b8" />
                    <TextInput placeholder="Type de véhicule (ex: Tricycle)" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={vehicleType} onChangeText={setVehicleType} />
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <FileText size={20} color="#94a3b8" />
                    <TextInput placeholder="N° CNI ou Passeport" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={idNumber} onChangeText={setIdNumber} />
                </View>
                </>
            )}

            {role === 'organisation_admin' && (
                <>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <Building2 size={20} color="#94a3b8" />
                    <TextInput placeholder="Nom de l'Organisation" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={orgName} onChangeText={setOrgName}/>
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <Briefcase size={20} color="#94a3b8" />
                    <TextInput placeholder="Nom du Responsable" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={contactPerson} onChangeText={setContactPerson}/>
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <FileText size={20} color="#94a3b8" />
                    <TextInput placeholder="N° RCCM ou IFU" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={rccm} onChangeText={setRccm} />
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <Users size={20} color="#94a3b8" />
                    <TextInput placeholder="Nombre d'agents estimé" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={agentCount} onChangeText={setAgentCount} keyboardType="numeric" />
                </View>
                <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
                    <Phone size={20} color="#94a3b8" />
                    <TextInput placeholder="Téléphone du siège" placeholderTextColor="#cbd5e1" className="flex-1 ml-4 font-bold text-[#020617]" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                </>
            )}

            {/* Champs communs (Email & Password) */}
            <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
              <Mail size={20} color="#94a3b8" />
              <TextInput 
                placeholder={role === 'organisation_admin' ? "Email professionnel" : "Email"}
                placeholderTextColor="#cbd5e1"
                className="flex-1 ml-4 font-bold text-[#020617]"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View className="bg-slate-50 border border-slate-100 rounded-[2rem] flex-row items-center px-6 h-16">
              <Lock size={20} color="#94a3b8" />
              <TextInput 
                placeholder="Mot de passe sécurisé" 
                placeholderTextColor="#cbd5e1"
                className="flex-1 ml-4 font-bold text-[#020617]"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              onPress={signUpWithEmail}
              disabled={loading}
              className="w-full bg-primary h-16 rounded-[2rem] flex-row items-center justify-center shadow-xl shadow-primary/30 mt-8"
            >
              <Text className="text-white font-black uppercase tracking-widest text-xs mr-3">
                {loading ? 'Création...' : "Confirmer l'inscription"}
              </Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
            <View className="mt-12 items-center">
            <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                Vous avez déjà un compte ? <Text className="text-primary">Connectez-vous</Text>
                </Text>
            </TouchableOpacity>
            </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
