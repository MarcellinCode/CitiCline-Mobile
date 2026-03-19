import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { useWastes } from '@/hooks/useWastes';
import { useLocation } from '@/hooks/useLocation';
import { Header } from '@/components/Header';
import { useRouter } from 'expo-router';

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
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Radar CITICLINE" subtitle="Déchets à proximité de vous" />
      
      <View className="flex-1 overflow-hidden rounded-t-[3rem]">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          customMapStyle={mapStyle}
        >
          {wastes.map((waste) => (
            waste.latitude && waste.longitude && (
              <Marker
                key={waste.id}
                coordinate={{ latitude: Number(waste.latitude), longitude: Number(waste.longitude) }}
                title={waste.waste_types?.name}
              >
                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border-2 border-teal-500 shadow-lg">
                  <Text className="text-xl">{waste.waste_types?.emoji}</Text>
                </View>
                <Callout 
                    onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } })}
                    tooltip
                >
                    <View className="bg-white p-4 rounded-3xl border border-slate-100 min-w-[200]">
                        <Text className="text-lg font-black text-slate-900 uppercase italic tracking-tighter mb-1">
                            {waste.waste_types?.name}
                        </Text>
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">
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
