import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { Mail, Lock, User, ArrowRight, Truck, Building2, ChevronLeft, Phone, MapPin, Briefcase, FileText, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import Logo from '@/components/ui/Logo';

const { width } = Dimensions.get('window');

export default function Signup() {
  const insets = useSafeAreaInsets();
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
    if (!email || !password) {
        alert("Veuillez remplir les champs obligatoires");
        return;
    }
    setLoading(true);
    try {
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

        if (error) {
            alert(error.message);
        } else if (!session) {
            alert("Vérifiez votre boîte mail pour confirmer l'inscription !");
            router.replace('/(auth)/login');
        } else {
            router.replace('/(tabs)/marketplace');
        }
    } catch (err: any) {
        alert(err.message || "Une erreur est survenue");
    } finally {
        setLoading(false);
    }
  }

  const RoleCard = ({ type, title, desc, icon: Icon, color }: any) => (
    <TouchableOpacity 
      onPress={() => { setRole(type); setStep(2); }}
      activeOpacity={0.9}
      style={styles.roleCard}
    >
      <View style={[styles.roleIconContainer, { backgroundColor: color }]}>
        <Icon color="white" size={28} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleDesc}>{desc}</Text>
      </View>
      <ChevronLeft size={20} color="#cbd5e1" style={{ transform: [{ rotate: '180deg' }] }} />
    </TouchableOpacity>
  );

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
        <TouchableOpacity 
          onPress={() => step === 1 ? router.back() : setStep(1)} 
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#020617" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Logo size="large" />
          <Text style={styles.headerSubtitle}>
            {step === 1 ? 'Créer votre compte' : 'Complétez votre profil'}
          </Text>
        </View>

        {step === 1 ? (
          <View style={styles.roleSection}>
            <Text style={styles.sectionLabel}>Choisissez votre rôle</Text>
            <RoleCard 
              type="vendeur"
              title="CITOYEN"
              desc="Recyclez et gagnez des récompenses"
              icon={User}
              color="#10b981"
            />
            <RoleCard 
              type="collecteur"
              title="COLLECTEUR"
              desc="Gérez vos tournées de collecte"
              icon={Truck}
              color="#f59e0b"
            />
            <RoleCard 
              type="organisation_admin"
              title="ORGANISATION"
              desc="Gérez une zone ou une équipe"
              icon={Building2}
              color="#6366f1"
            />

            <View style={styles.mairieNote}>
                <Text style={styles.mairieNoteText}>
                    🏢 Un accès Administrateur Mairie ? Contactez l'assistance technique Citicline.
                </Text>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.sectionLabel}>Informations {role === 'vendeur' ? 'Personnelles' : 'Professionnelles'}</Text>
            
            {role === 'vendeur' && (
              <>
                <View style={styles.inputBox}>
                    <User size={18} color="#94a3b8" />
                    <TextInput placeholder="Nom complet" placeholderTextColor="#cbd5e1" style={styles.input} value={fullName} onChangeText={setFullName}/>
                </View>
                <View style={styles.inputBox}>
                    <Phone size={18} color="#94a3b8" />
                    <TextInput placeholder="Téléphone" placeholderTextColor="#cbd5e1" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View style={styles.inputBox}>
                    <MapPin size={18} color="#94a3b8" />
                    <TextInput placeholder="Quartier / Adresse" placeholderTextColor="#cbd5e1" style={styles.input} value={district} onChangeText={setDistrict} />
                </View>
              </>
            )}

            {role === 'collecteur' && (
              <>
                <View style={styles.inputBox}>
                    <User size={18} color="#94a3b8" />
                    <TextInput placeholder="Nom complet" placeholderTextColor="#cbd5e1" style={styles.input} value={fullName} onChangeText={setFullName}/>
                </View>
                <View style={styles.inputBox}>
                    <Phone size={18} color="#94a3b8" />
                    <TextInput placeholder="Téléphone" placeholderTextColor="#cbd5e1" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View style={styles.inputBox}>
                    <Truck size={18} color="#94a3b8" />
                    <TextInput placeholder="Type de véhicule" placeholderTextColor="#cbd5e1" style={styles.input} value={vehicleType} onChangeText={setVehicleType} />
                </View>
                <View style={styles.inputBox}>
                    <FileText size={18} color="#94a3b8" />
                    <TextInput placeholder="N° Pièce d'identité" placeholderTextColor="#cbd5e1" style={styles.input} value={idNumber} onChangeText={setIdNumber} />
                </View>
              </>
            )}

            {role === 'organisation_admin' && (
              <>
                <View style={styles.inputBox}>
                    <Building2 size={18} color="#94a3b8" />
                    <TextInput placeholder="Nom de l'Organisation" placeholderTextColor="#cbd5e1" style={styles.input} value={orgName} onChangeText={setOrgName}/>
                </View>
                <View style={styles.inputBox}>
                    <Briefcase size={18} color="#94a3b8" />
                    <TextInput placeholder="Nom du Responsable" placeholderTextColor="#cbd5e1" style={styles.input} value={contactPerson} onChangeText={setContactPerson}/>
                </View>
                <View style={styles.inputBox}>
                    <FileText size={18} color="#94a3b8" />
                    <TextInput placeholder="N° RCCM / IFU" placeholderTextColor="#cbd5e1" style={styles.input} value={rccm} onChangeText={setRccm} />
                </View>
                <View style={styles.inputBox}>
                    <Phone size={18} color="#94a3b8" />
                    <TextInput placeholder="Téléphone du siège" placeholderTextColor="#cbd5e1" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
              </>
            )}

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Identifiants</Text>
            <View style={styles.inputBox}>
                <Mail size={18} color="#94a3b8" />
                <TextInput placeholder="Email" placeholderTextColor="#cbd5e1" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none"/>
            </View>
            <View style={styles.inputBox}>
                <Lock size={18} color="#94a3b8" />
                <TextInput placeholder="Mot de passe" placeholderTextColor="#cbd5e1" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            <TouchableOpacity 
              onPress={signUpWithEmail}
              disabled={loading}
              style={styles.submitBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.footer}>
            <Text style={styles.footerText}>
                Déjà inscrit ? <Text style={styles.footerLink}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        )}
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
    height: 60,
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#020617',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  roleSection: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#020617',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  mairieNote: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  mairieNoteText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 14,
  },
  formContainer: {
    gap: 12,
  },
  inputBox: {
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
  submitBtn: {
    backgroundColor: '#020617',
    height: 72,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginRight: 12,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 40,
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
