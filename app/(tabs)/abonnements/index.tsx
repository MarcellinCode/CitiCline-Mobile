import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { 
  ChevronLeft, 
  Crown, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Wallet,
  Plus,
  Building2,
  Clock,
  ArrowRight,
  Zap,
  ShieldCheck,
} from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { useLocation } from '@/hooks/useLocation';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { creditWallet, debitWallet } from '@/services/walletService';
import { getOrganizationsNearby, getOrganizationPlans, createSubscription, signalEmergency } from '@/services/organizationService';
import { Modal, TextInput, Alert, Pressable } from 'react-native';

type Subscription = {
  id: string;
  zone_name: string;
  company_name: string;
  pickup_days: string[];
  pickup_time: string;
  status: string;
  tier: string;
};

export default function AbonnementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { location, errorMsg: locationError } = useLocation();
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [orgLoading, setOrgLoading] = React.useState(false);
  
  // Wallet & Config State
  const [topUpModal, setTopUpModal] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [configModal, setConfigModal] = React.useState(false);
  const [organizations, setOrganizations] = React.useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = React.useState<any | null>(null);
  const [plans, setPlans] = React.useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = React.useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!profile) return;
    loadSubscription();
  }, [profile]);

  const loadSubscription = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .maybeSingle();

      setSubscription(data as Subscription | null);
    } catch (err) {
      console.error("loadSubscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setIsSubmitting(true);
    const res = await creditWallet(profile!.id, Number(amount));
    if (res.success) {
      Alert.alert("Succès", `Votre portefeuille a été rechargé de ${amount} FCFA.`);
      setTopUpModal(false);
      setAmount('');
      refreshProfile();
    } else {
      Alert.alert("Erreur", "Impossible de recharger le portefeuille.");
    }
    setIsSubmitting(false);
  };

  const startConfiguration = async () => {
    setConfigModal(true);
    setOrgLoading(true);
    
    // Détection auto : on utilise la ville du profil ou la géoloc
    const userCity = profile?.city;
    
    try {
      const orgs = await getOrganizationsNearby(userCity);
      setOrganizations(orgs);
      
      if (orgs.length === 0) {
        Alert.alert(
          "Zone non couverte", 
          `Aucune organisation n'a été détectée dans votre ville (${userCity || 'inconnue'}). Vous pouvez tout de même parcourir les organisations partenaires.`
        );
        // Fallback: list all if none found
        const allOrgs = await getOrganizationsNearby();
        setOrganizations(allOrgs);
      }
    } catch (err) {
      console.error("startConfiguration error:", err);
    } finally {
      setOrgLoading(false);
    }
  };

  const selectOrg = async (org: any) => {
    setSelectedOrg(org);
    const p = await getOrganizationPlans(org.id);
    setPlans(p);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !profile) return;
    
    if ((profile.wallet_balance || 0) < selectedPlan.price) {
      Alert.alert("Solde Insuffisant", "Veuillez recharger votre portefeuille.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Débiter le wallet
      const debitRes = await debitWallet(profile.id, selectedPlan.price);
      if (!debitRes.success) {
        Alert.alert("Erreur", debitRes.error || "Impossible de débiter le portefeuille.");
        setIsSubmitting(false);
        return;
      }

      // 2. Créer l'abonnement
      await createSubscription(profile.id, {
        ...selectedPlan,
        company_name: selectedOrg.full_name
      });
      
      Alert.alert("Félicitations", "Votre abonnement est maintenant actif !");
      setConfigModal(false);
      loadSubscription();
      refreshProfile();
    } catch (err) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la souscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmergency = async () => {
    if (!subscription || !profile) return;
    
    Alert.alert(
      "Signalement Urgent",
      "Confirmez-vous que votre barque est pleine et nécessite un passage immédiat ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer", 
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await signalEmergency(subscription.id, profile.id);
              Alert.alert("Signalé", "Les agents de l'organisation ont été informés de votre urgence.");
            } catch (err) {
              Alert.alert("Erreur", "Impossible d'envoyer le signalement.");
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const title = (profile?.role === 'vendeur' || profile?.role === 'super_admin') ? 'Service de Collecte' : 'Abonnement';
  const isLoad = profileLoading || loading;

  return (
    <View style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header 
        title={title} 
        onBack={() => navigateSafe(router, ROUTES.ESPACE)}
      />

      {isLoad ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#2aa275" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        >
          {(profile?.role === 'vendeur' || profile?.role === 'super_admin') && (
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <View style={styles.walletIconBg}>
                  <Wallet size={20} color="#2aa275" />
                </View>
                <Text style={styles.walletTitle}>Mon Portefeuille</Text>
              </View>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceAmount}>{profile?.wallet_balance || 0}</Text>
                <Text style={styles.balanceCurrency}>FCFA</Text>
              </View>
              <TouchableOpacity style={styles.topUpBtn} onPress={() => setTopUpModal(true)}>
                <Plus size={16} color="white" />
                <Text style={styles.topUpBtnText}>Recharger</Text>
              </TouchableOpacity>
            </View>
          )}

          {(profile?.role === 'vendeur' || profile?.role === 'super_admin') && subscription ? (
            <View>
              <View style={styles.activeSubCard}>
                <View style={styles.crownIconBg}>
                  <Crown size={40} color="#2aa275" />
                </View>
                <Text style={styles.zoneNameTitle}>
                  {subscription.zone_name || 'Zone Assignée'}
                </Text>
                <Text style={styles.partnerSubtitle}>
                  Géré par : {subscription.company_name || 'Partenaire CITICLINE'}
                </Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Service Actif</Text>
                </View>
              </View>

              <Text style={styles.sectionHeading}>Jours de Passage</Text>
              <View style={styles.daysContainer}>
                {(subscription.pickup_days || ['Lundi', 'Mercredi', 'Vendredi']).map((day: string, i: number) => (
                  <View key={i} style={styles.dayItem}>
                    <View style={styles.dayItemLeft}>
                      <Calendar size={18} color="#2aa275" />
                      <Text style={styles.dayItemText}>{day ?? 'Jour inconnu'}</Text>
                    </View>
                    <Text style={styles.dayItemTime}>
                      {subscription.pickup_time || '08h - 10h'}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.emergencyBtn, isSubmitting && { opacity: 0.7 }]} 
                onPress={handleEmergency}
                disabled={isSubmitting}
              >
                <Zap size={20} color="white" fill="white" />
                <Text style={styles.emergencyBtnText}>Barque Pleine (Urgent)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reportBtn}>
                <AlertCircle size={16} color="white" />
                <Text style={styles.reportBtnText}>Signaler un Problème</Text>
              </TouchableOpacity>
            </View>
          ) : (profile?.role === 'vendeur' || profile?.role === 'super_admin') && !subscription ? (
            <View>
              <View style={styles.noSubCard}>
                <View style={styles.emptyCrownIconBg}>
                  <Crown size={40} color="#cbd5e1" />
                </View>
                <Text style={styles.noSubTitle}>Pas d'Abonnement</Text>
                <Text style={styles.noSubDesc}>
                  Souscrivez à un service de collecte pour vos déchets ménagers.
                </Text>
                
                <TouchableOpacity style={styles.configBtn} onPress={startConfiguration}>
                  <Text style={styles.configBtnText}>Configurer mon service</Text>
                  <ArrowRight size={16} color="white" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionHeading}>Avantages</Text>
              <View style={styles.perksContainer}>
                {[
                  'Collecte régulière planifiée',
                  'Notification avant chaque passage',
                  'Historique de vos collectes',
                  'Support prioritaire 24/7',
                ].map((item, i) => (
                  <View key={i} style={styles.perkItem}>
                    <CheckCircle2 size={18} color="#2aa275" />
                    <Text style={styles.perkText}>{item}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.contactBtn}>
                <Text style={styles.contactBtnText}>Contacter un Collecteur</Text>
              </TouchableOpacity>
            </View>
          ) : profile?.role === 'collecteur' ? (
            <View>
              <View style={[styles.proSubCard, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }]}>
                <View style={[styles.proCrownIconBg, { backgroundColor: '#e0f2fe' }]}>
                  <Crown size={40} color="#0284c7" />
                </View>
                <Text style={[styles.proSubTitle, { color: '#0c4a6e' }]}>Acheteur Indépendant</Text>
                <View style={[styles.proPriceBadge, { borderColor: '#bae6fd' }]}>
                  <Text style={[styles.proPriceText, { color: '#0284c7' }]}>6 000 FCFA / MOIS</Text>
                </View>
                <View style={[styles.proBadge, { backgroundColor: '#0284c7' }]}>
                  <Text style={styles.proBadgeText}>Premium</Text>
                </View>
              </View>

              <Text style={styles.sectionHeading}>Avantages Acheteur</Text>
              <View style={styles.perksContainer}>
                {[
                  'Réservations illimitées sur la Marketplace',
                  'Frais de service RecyCla réduits',
                  'Priorité d\'accès aux nouveaux lots publiés',
                  'Support client réactif 7/7',
                ].map((item, i) => (
                  <View key={i} style={styles.perkItem}>
                    <CheckCircle2 size={18} color="#0284c7" />
                    <Text style={styles.perkText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={{ marginBottom: 40, padding: 20, backgroundColor: '#f8fafc', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' }}>
                <Text style={{ fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Note sur le plan Gratuit</Text>
                <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600', lineHeight: 20 }}>
                  Sans abonnement, vous êtes limité à <Text style={{ fontWeight: '900' }}>3 réservations par mois</Text>. Passez à Premium pour un accès illimité.
                </Text>
              </View>
            </View>
          ) : profile?.role === 'mairie' ? (
            <View>
              <View style={[styles.proSubCard, { backgroundColor: '#fdf4ff', borderColor: '#e9d5ff' }]}>
                <View style={[styles.proCrownIconBg, { backgroundColor: '#f5e8ff' }]}>
                  <Crown size={40} color="#7c3aed" />
                </View>
                <Text style={[styles.proSubTitle, { color: '#4c1d95' }]}>Mairie (Élite)</Text>
                <View style={[styles.proPriceBadge, { borderColor: '#e9d5ff' }]}>
                  <Text style={[styles.proPriceText, { color: '#7c3aed' }]}>200 000 FCFA / MOIS</Text>
                </View>
                <View style={[styles.proBadge, { backgroundColor: '#7c3aed' }]}>
                  <Text style={styles.proBadgeText}>Souveraineté</Text>
                </View>
              </View>

              <Text style={styles.sectionHeading}>Outils de Souveraineté</Text>
              <View style={styles.perksContainer}>
                {[
                  'Contrôle souverain City OS',
                  'Gestion des concessions territoriales',
                  'Carnet d\'entretien & maintenance',
                  'Rapports RSE certifiés',
                  'Support technique B2B 24/7',
                ].map((item, i) => (
                  <View key={i} style={styles.perkItem}>
                    <CheckCircle2 size={18} color="#7c3aed" />
                    <Text style={styles.perkText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <View style={{ width: 80, height: 80, backgroundColor: '#f8fafc', borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <ShieldCheck size={40} color="#94a3b8" />
              </View>
              <Text style={[styles.proSubTitle, { textAlign: 'center', marginBottom: 8 }]}>Compte Opérationnel</Text>
              <Text style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: 13 }}>
                Votre abonnement est géré par votre organisation parente.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal Recharge */}
      <Modal visible={topUpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Saisir le montant</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 5000"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setTopUpModal(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleTopUp} 
                style={[styles.modalConfirmBtn, isSubmitting && { opacity: 0.7 }]}
                disabled={isSubmitting}
              >
                <Text style={styles.modalConfirmText}>{isSubmitting ? '...' : 'Confirmer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Configuration Abonnement */}
      <Modal visible={configModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.fullModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configuration Service</Text>
              <TouchableOpacity onPress={() => {
                setConfigModal(false);
                setSelectedOrg(null);
                setSelectedPlan(null);
              }}>
                <Text style={{ fontWeight: 'bold' }}>Fermer</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {orgLoading ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator color="#2aa275" />
                  <Text style={{ marginTop: 16, color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}>
                    RECHERCHE DES GESTIONNAIRES LOCAUX...
                  </Text>
                </View>
              ) : !selectedOrg ? (
                <>
                  <Text style={styles.sectionHeading}>
                    Gestionnaires à {profile?.city || 'proximité'}
                  </Text>
                  {organizations.map(org => (
                    <TouchableOpacity 
                      key={org.id} 
                      style={styles.orgSelectItem} 
                      onPress={() => selectOrg(org)}
                    >
                      <Building2 size={24} color="#020617" />
                      <View style={{ marginLeft: 16 }}>
                        <Text style={styles.orgName}>{org.full_name}</Text>
                        <Text style={styles.orgZone}>{org.city || 'Zone de collecte'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              ) : !selectedPlan ? (
                <>
                  <TouchableOpacity onPress={() => setSelectedOrg(null)} style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#2aa275', fontWeight: 'bold' }}>← Changer d'organisation</Text>
                  </TouchableOpacity>
                  <Text style={styles.sectionHeading}>Étape 2 : Choisir votre fréquence</Text>
                  {plans.map(plan => (
                    <TouchableOpacity 
                      key={plan.id} 
                      style={styles.planSelectItem} 
                      onPress={() => setSelectedPlan(plan)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planDesc}>Passages : {plan.pickup_days?.join(', ') || 'À définir'}</Text>
                      </View>
                      <Text style={styles.planPrice}>{plan.price} CFA</Text>
                    </TouchableOpacity>
                  ))}
                  {plans.length === 0 && <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>Aucun plan disponible.</Text>}
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => setSelectedPlan(null)} style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#2aa275', fontWeight: 'bold' }}>← Changer de plan</Text>
                  </TouchableOpacity>
                  <Text style={styles.sectionHeading}>Étape 3 : Résumé & Activation</Text>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Organisation</Text>
                      <Text style={styles.summaryValue}>{selectedOrg.full_name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Service</Text>
                      <Text style={styles.summaryValue}>{selectedPlan.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Prix / mois</Text>
                      <Text style={[styles.summaryValue, { color: '#2aa275' }]}>{selectedPlan.price} CFA</Text>
                    </View>
                  </View>

                  <View style={styles.walletStatus}>
                    <Text style={styles.walletStatusLabel}>Votre solde actuel :</Text>
                    <Text style={styles.walletStatusValue}>{profile?.wallet_balance || 0} CFA</Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.activateBtn, isSubmitting && { opacity: 0.7 }]} 
                    onPress={handleSubscribe}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.activateBtnText}>Payer & Activer</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  iconBtn: { width: 48, height: 48, backgroundColor: '#f8fafc', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 32 },
  activeSubCard: { backgroundColor: 'rgba(42, 162, 117, 0.1)', borderColor: 'rgba(42, 162, 117, 0.2)', borderWidth: 1, padding: 32, borderRadius: 48, alignItems: 'center', marginBottom: 40 },
  crownIconBg: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  zoneNameTitle: { fontSize: 24, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, marginBottom: 4 },
  partnerSubtitle: { color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 10, letterSpacing: 2, marginBottom: 16 },
  activeBadge: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#2aa275', borderRadius: 9999 },
  activeBadgeText: { color: 'white', fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 },
  sectionHeading: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 24 },
  daysContainer: { flexDirection: 'column', gap: 16, marginBottom: 24 },
  dayItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  dayItemLeft: { flexDirection: 'row', alignItems: 'center' },
  dayItemText: { marginLeft: 12, fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', letterSpacing: 2 },
  dayItemTime: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  reportBtn: { width: '100%', borderColor: '#f1f5f9', borderWidth: 1, height: 64, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  reportBtnText: { color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginLeft: 8 },
  emergencyBtn: { width: '100%', backgroundColor: '#f59e0b', height: 72, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  emergencyBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 14, marginLeft: 12 },
  noSubCard: { backgroundColor: '#f8fafc', borderColor: '#f1f5f9', borderWidth: 1, padding: 32, borderRadius: 48, alignItems: 'center', marginBottom: 40 },
  emptyCrownIconBg: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  noSubTitle: { fontSize: 24, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, marginBottom: 8 },
  noSubDesc: { color: '#94a3b8', fontWeight: '500', textAlign: 'center', fontSize: 14, marginBottom: 24 },
  configBtn: { backgroundColor: '#020617', paddingHorizontal: 24, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  configBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 },
  perksContainer: { flexDirection: 'column', gap: 12, marginBottom: 40 },
  perkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  perkText: { marginLeft: 12, fontSize: 14, fontWeight: 'bold', color: '#475569' },
  contactBtn: { width: '100%', borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1', height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  contactBtnText: { color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 },
  proSubCard: { backgroundColor: '#eef2ff', borderColor: '#e0e7ff', borderWidth: 1, padding: 32, borderRadius: 48, alignItems: 'center', marginBottom: 32 },
  proCrownIconBg: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  proSubTitle: { fontSize: 24, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, marginBottom: 8 },
  proBadge: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6366f1', borderRadius: 9999 },
  proBadgeText: { color: 'white', fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 },
  proPriceBadge: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e0e7ff' },
  proPriceText: { color: '#6366f1', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  
  // New Wallet Styles
  walletCard: { backgroundColor: '#f8fafc', borderRadius: 32, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: '#f1f5f9' },
  walletHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  walletIconBg: { width: 36, height: 36, backgroundColor: 'rgba(42, 162, 117, 0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  walletTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 },
  balanceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  balanceAmount: { fontSize: 32, fontWeight: '900', color: '#020617', fontStyle: 'italic' },
  balanceCurrency: { fontSize: 12, fontWeight: '900', color: '#2aa275', marginLeft: 8 },
  topUpBtn: { backgroundColor: '#020617', height: 48, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: 20 },
  topUpBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 8 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '80%', borderRadius: 32, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  fullModalContent: { backgroundColor: 'white', width: '100%', height: '90%', borderTopLeftRadius: 48, borderTopRightRadius: 48, marginTop: 'auto' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#020617', textTransform: 'uppercase', marginBottom: 20, fontStyle: 'italic' },
  modalInput: { backgroundColor: '#f8fafc', height: 64, borderRadius: 16, paddingHorizontal: 20, fontSize: 18, fontWeight: 'bold', color: '#020617', marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  modalCancelText: { fontWeight: 'bold', color: '#64748b' },
  modalConfirmBtn: { flex: 2, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2aa275' },
  modalConfirmText: { fontWeight: 'bold', color: 'white' },
  
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  orgSelectItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  orgName: { fontSize: 16, fontWeight: '900', color: '#020617', textTransform: 'uppercase' },
  orgZone: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  planSelectItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 24, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  planName: { fontSize: 14, fontWeight: '900', color: '#020617', textTransform: 'uppercase', marginBottom: 4 },
  planDesc: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  planPrice: { fontSize: 16, fontWeight: '900', color: '#2aa275' },
  summaryCard: { backgroundColor: '#f8fafc', padding: 24, borderRadius: 32, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: '#94a3b8', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase' },
  summaryValue: { color: '#020617', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  walletStatus: { alignItems: 'center', marginBottom: 32 },
  walletStatusLabel: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  walletStatusValue: { color: '#020617', fontSize: 18, fontWeight: '900', fontStyle: 'italic' },
  activateBtn: { backgroundColor: '#2aa275', height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#2aa275', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  activateBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', fontSize: 14, letterSpacing: 2 }
});
