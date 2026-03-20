import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Waste } from '../lib/types';
import { Leaf } from 'lucide-react-native';

interface FeaturedWasteCardProps {
  waste: Waste;
  key?: string | number;
}

export function FeaturedWasteCard({ waste }: FeaturedWasteCardProps) {
  const router = useRouter();
  const imageUrl = waste.images && waste.images.length > 0 ? waste.images[0] : null;

  return (
    <TouchableOpacity 
      onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } })}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Leaf size={32} color="#cbd5e1" />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {waste.waste_types?.name || 'Recyclables'}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.weightText}>
            {waste.estimated_weight} Tons
          </Text>
          <Text style={styles.priceText}>
            ${waste.waste_types?.price_per_kg || '0'}/kg
          </Text>
        </View>
        <View style={styles.userRow}>
           <View style={styles.userAvatarBg}>
             <View style={styles.userAvatarDot} />
           </View>
           <Text style={styles.userName} numberOfLines={1}>
             {waste.profiles?.full_name || 'CITICLINE'}
           </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    width: 220,
  },
  imageContainer: {
    height: 112,
    width: '100%',
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#020617',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  priceText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10b981',
    textTransform: 'uppercase',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  userAvatarBg: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  userName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  }
});
