import { View, Text, StyleSheet } from 'react-native';
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
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps';
import { useWastes } from '@/hooks/useWastes';
import { useLocation } from '@/hooks/useLocation';
import { Header } from '@/components/Header';

export default function MapScreen() {
  const { wastes } = useWastes();
  const { location, loading: locLoading } = useLocation();
  const router = useRouter();

  const initialRegion = {
    latitude: location?.coords.latitude || 5.3484, // Default to Abidjan if no location
    longitude: location?.coords.longitude || -4.0305,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Radar CITICLINE" subtitle="Déchets à proximité de vous" />
      
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          mapPadding={{ top: 0, right: 0, bottom: 100, left: 0 }}
        >
          <UrlTile 
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {wastes.map((waste) => (
            waste.latitude && waste.longitude && (
              <Marker
                key={waste.id}
                coordinate={{ latitude: Number(waste.latitude), longitude: Number(waste.longitude) }}
                title={waste.waste_types?.name}
              >
                <View style={styles.markerContainer}>
                  <Text style={styles.markerEmoji}>{waste.waste_types?.emoji}</Text>
                </View>
                <Callout 
                    onPress={() => navigateSafe(router, ROUTES.MARKETPLACE_DETAILS(waste.id), { id: waste.id })}
                    tooltip
                >
                    <View style={styles.calloutContainer}>
                        <Text style={styles.calloutTitle}>
                            {waste.waste_types?.name}
                        </Text>
                        <Text style={styles.calloutSubtitle}>
                            {waste.estimated_weight} KG • {waste.location}
                        </Text>
                    </View>
                </Callout>
              </Marker>
            )
          ))}
        </MapView>
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
