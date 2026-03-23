import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  Weight, 
  CheckCircle2, 
  Info,
  AlertTriangle
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';

export default function MissionDetail() {
  const router = useRouter();
  const { id, name, type, color } = useLocalSearchParams();
  const [step, setStep] = useState<'info' | 'scan' | 'weight' | 'success'>('info');
  const [scanned, setScanned] = useState(false);
  const [weight, setWeight] = useState('');

  const isMarketplace = type?.toString().toLowerCase().includes('recyclage') || type?.toString().toLowerCase().includes('bac');

  const handleScan = () => {
    setScanned(true);
    setTimeout(() => {
        if (isMarketplace) {
          setStep('weight');
        } else {
          setStep('success');
        }
    }, 1500);
  };

  const handleFinalize = () => {
    if (isMarketplace && !weight) {
      Alert.alert("Erreur", "Veuillez saisir le poids réel du lot.");
      return;
    }
    setStep('success');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        headerTitle: "MISSION DÉTAIL",
        headerTitleStyle: { fontWeight: '900' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <ArrowLeft size={20} color="#020617" />
          </TouchableOpacity>
        ),
        headerShadowVisible: false
      }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <AnimatePresence exitBeforeEnter>
          {step === 'info' && (
            <MotiView 
              key="info"
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <View style={styles.infoCard}>
                <View style={styles.infoIconBg}>
                  <MapPin size={32} color={color?.toString() || '#2aa275'} />
                </View>
                <Text style={styles.infoName}>{name}</Text>
                <Text style={styles.infoType}>{type}</Text>
              </View>

              <View style={styles.instructionsCard}>
                <View style={styles.instructionsRow}>
                  <Info size={16} color="#2aa275" />
                  <Text style={styles.instructionsLabel}>Instructions</Text>
                </View>
                <Text style={styles.instructionsText}>
                   {isMarketplace 
                     ? "Vérifiez la qualité des matières. Le paiement sera déduit de votre balance après validation du poids réel."
                     : "Scannez le badge QR du foyer pour valider le passage. En cas d'absence, prenez une photo de la rue."}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => setStep('scan')}
                style={styles.launchBtn}
              >
                <Text style={styles.launchBtnText}>Lancer l'opération</Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {step === 'scan' && (
            <MotiView 
              key="scan"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.scanContainer}
            >
              <View style={styles.scanArea}>
                 {!scanned ? (
                   <>
                     <Camera size={48} color="#94a3b8" />
                     <Text style={styles.scanHintText}>Visez le QR Code</Text>
                     
                     <View style={[styles.scanCorner, styles.scanCornerTL]} />
                     <View style={[styles.scanCorner, styles.scanCornerTR]} />
                     <View style={[styles.scanCorner, styles.scanCornerBL]} />
                     <View style={[styles.scanCorner, styles.scanCornerBR]} />
                   </>
                 ) : (
                   <MotiView 
                     from={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     style={styles.scanSuccessContainer}
                   >
                     <CheckCircle2 size={64} color="#2aa275" />
                     <Text style={styles.scanSuccessText}>Code Validé</Text>
                   </MotiView>
                 )}
              </View>

              <TouchableOpacity 
                onPress={handleScan}
                style={styles.simulateScanBtn}
              >
                <Text style={styles.simulateScanText}>Simuler Scan</Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {step === 'weight' && (
            <MotiView 
               key="weight"
               from={{ opacity: 0, translateX: 20 }}
               animate={{ opacity: 1, translateX: 0 }}
            >
               <View style={styles.weightCard}>
                 <Weight size={48} color="#6366f1" />
                 <Text style={styles.weightLabel}>Saisie de la Pesée</Text>
                 
                 <View style={styles.weightValueRow}>
                   <Text style={styles.weightValue}>
                     {weight || "0.0"}
                   </Text>
                   <Text style={styles.weightUnit}>kg</Text>
                 </View>
               </View>

               <View style={styles.keypadGrid}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
                    <TouchableOpacity 
                      key={k}
                      onPress={() => {
                        if (k === '⌫') setWeight(prev => prev.slice(0, -1));
                        else if (weight.length < 5) setWeight(prev => prev + k);
                      }}
                      style={styles.keypadKey}
                    >
                      <Text style={styles.keypadKeyText}>{k}</Text>
                    </TouchableOpacity>
                  ))}
               </View>

               <TouchableOpacity 
                onPress={handleFinalize}
                style={styles.validateBtn}
              >
                <Text style={styles.validateBtnText}>Valider & Payer</Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {step === 'success' && (
            <MotiView 
               key="success"
               from={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               style={styles.successContainer}
            >
               <View style={styles.successIconBg}>
                  <CheckCircle2 size={48} color="#2aa275" />
               </View>
               <Text style={styles.successTitle}>Collecte Terminée</Text>
               <Text style={styles.successSubtitle}>Données transmises à City OS</Text>

               <TouchableOpacity 
                onPress={() => navigateSafe(router, ROUTES.MISSIONS)}
                style={styles.successBtn}
              >
                <Text style={styles.successBtnText}>Retour à la route</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  headerBackBtn: { marginLeft: 16, padding: 8, backgroundColor: '#f8fafc', borderRadius: 12 },
  scrollView: { flex: 1, paddingHorizontal: 32, paddingTop: 24 },
  
  // Info step
  infoCard: { backgroundColor: '#f8fafc', padding: 32, borderRadius: 48, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', marginBottom: 24 },
  infoIconBg: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 24 },
  infoName: { fontSize: 24, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: 8 },
  infoType: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3 },
  
  instructionsCard: { padding: 24, backgroundColor: '#0f172a', borderRadius: 40, marginBottom: 24 },
  instructionsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  instructionsLabel: { marginLeft: 8, color: '#2aa275', fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 3 },
  instructionsText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', lineHeight: 20 },
  
  launchBtn: { width: '100%', backgroundColor: '#2aa275', paddingVertical: 24, borderRadius: 32, alignItems: 'center', shadowColor: '#2aa275', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  launchBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3 },

  // Scan step
  scanContainer: { flex: 1, alignItems: 'center', paddingVertical: 40 },
  scanArea: { width: '100%', aspectRatio: 1, backgroundColor: '#f1f5f9', borderRadius: 48, overflow: 'hidden', borderWidth: 2, borderStyle: 'dashed', borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  scanHintText: { marginTop: 16, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 3, fontSize: 10 },
  scanCorner: { position: 'absolute', width: 40, height: 40 },
  scanCornerTL: { top: 40, left: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#2aa275', borderTopLeftRadius: 16 },
  scanCornerTR: { top: 40, right: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#2aa275', borderTopRightRadius: 16 },
  scanCornerBL: { bottom: 40, left: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#2aa275', borderBottomLeftRadius: 16 },
  scanCornerBR: { bottom: 40, right: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#2aa275', borderBottomRightRadius: 16 },
  scanSuccessContainer: { alignItems: 'center' },
  scanSuccessText: { marginTop: 16, color: '#2aa275', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3 },
  simulateScanBtn: { marginTop: 48, backgroundColor: '#0f172a', paddingHorizontal: 40, paddingVertical: 20, borderRadius: 16 },
  simulateScanText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3, fontSize: 12 },

  // Weight step
  weightCard: { backgroundColor: '#f8fafc', padding: 32, borderRadius: 48, alignItems: 'center', marginBottom: 32 },
  weightLabel: { marginTop: 16, fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 24 },
  weightValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  weightValue: { fontSize: 56, fontWeight: '900', fontStyle: 'italic', letterSpacing: -2, color: '#020617' },
  weightUnit: { fontSize: 20, fontWeight: '900', color: '#94a3b8', paddingBottom: 8, fontStyle: 'italic' },
  keypadGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 32 },
  keypadKey: { width: '31%', backgroundColor: '#f1f5f9', height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  keypadKeyText: { fontWeight: '900', fontSize: 18 },
  validateBtn: { width: '100%', backgroundColor: '#6366f1', paddingVertical: 24, borderRadius: 32, alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  validateBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3 },

  // Success step
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  successIconBg: { width: 96, height: 96, backgroundColor: '#ecfdf5', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#020617', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, textAlign: 'center', paddingHorizontal: 16 },
  successSubtitle: { marginTop: 16, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 3, fontSize: 10, textAlign: 'center' },
  successBtn: { marginTop: 64, width: '100%', backgroundColor: '#0f172a', paddingVertical: 24, borderRadius: 32, alignItems: 'center' },
  successBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3 },
});
