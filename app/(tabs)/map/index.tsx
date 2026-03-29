import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { navigateSafe } from '@/utils/navigation';
import {
  Search,
  MapPin,
  Navigation,
  List,
  Filter,
  ChevronRight,
  X,
  Plus,
  ArrowRight
} from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { useWastes } from '@/hooks/useWastes';
import { useLocation } from '@/hooks/useLocation';
import { Header } from '@/components/Header';
import { MapOSM } from '@/components/map/MapOSM';

// Fixed points for the Demo Radar (Mairie Hubs & Partners)
const CITICLINE_HUBS = [
  { id: 'h1', name: 'Hub Principal - Mairie', type: 'office', latitude: 5.3484, longitude: -4.0305, emoji: '🏛️' },
  { id: 'h2', name: 'Centre de Collecte - Nord', type: 'center', latitude: 5.3850, longitude: -4.0150, emoji: '♻️' },
  { id: 'h3', name: 'Partenaire - Recy-Pro', type: 'partner', latitude: 5.3200, longitude: -3.9800, emoji: '🏢' },
];

export default function MapScreen() {
  const { wastes } = useWastes();
  const { location, loading: locLoading } = useLocation();
  const { profile } = useProfile();
  const router = useRouter();

  const isCitizen = profile?.role === 'vendeur' || profile?.role === 'super_admin';

  const initialRegion = {
    latitude: location?.coords.latitude || 5.3484, 
    longitude: location?.coords.longitude || -4.0305,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header 
        title={isCitizen ? "Radar Éco-Citoyen" : "Radar CITICLINE"} 
        subtitle={isCitizen ? "Centres de collecte et partenaires" : "Déchets à proximité de vous"} 
        onBack={() => navigateSafe(router, ROUTES.ESPACE)}
      />
      
      <View style={styles.mapContainer}>
        <MapOSM 
          userLocation={location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : null}
          hubs={CITICLINE_HUBS}
          wastes={wastes}
          onMarkerPress={(id: string, type: 'HUB' | 'WASTE') => {
            if (type === 'WASTE') {
              navigateSafe(router, ROUTES.MARKETPLACE_DETAILS(id), { id });
            } else {
              Alert.alert("Hub Info", "Ce centre de collecte est géré par la mairie.");
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  mapContainer: { flex: 1, overflow: 'hidden', borderTopLeftRadius: 48, borderTopRightRadius: 48 },
  markerContainer: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#14b8a6', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
  markerEmoji: { fontSize: 20 },
  calloutContainer: { backgroundColor: 'white', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', minWidth: 200 },
  calloutTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: -1, marginBottom: 4 },
  calloutSubtitle: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }
});

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#e9e9e9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];
