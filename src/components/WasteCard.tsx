import { View, Text, TouchableOpacity, Image as RNImage, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Scale, Clock } from 'lucide-react-native';
import { Waste } from '../lib/types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WasteCardProps {
  waste: Waste;
}

export function WasteCard({ waste }: WasteCardProps) {
  const router = useRouter();
  const hasImage = waste.images && waste.images.length > 0;
  
  return (
    <TouchableOpacity 
      onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } })}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <View style={styles.imageBox}>
          {hasImage ? (
            <RNImage 
              source={{ uri: waste.images[0] }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.emojiText}>{waste.waste_types?.emoji || '♻️'}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.wishlistBtn}>
          <View style={styles.wishlistIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {waste.waste_types?.name || 'Recyclables'}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          Matériau recyclable
        </Text>

        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <Scale size={10} color="#64748b" />
            <Text style={styles.weightText}>{waste.estimated_weight} Tons</Text>
          </View>
          <Text style={styles.priceText}>${waste.waste_types?.price_per_kg || '0'}/kg</Text>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={10} color="#94a3b8" />
          <Text style={styles.locationText} numberOfLines={1}>
            {waste.location}
          </Text>
        </View>

        <View style={styles.userRow}>
           <View style={styles.userAvatarBg}>
             <View style={styles.userAvatarDot} />
           </View>
           <Text style={styles.userName} numberOfLines={1}>
             {waste.profiles?.full_name || 'PowerCycle Ltd'}
           </Text>
           <Text style={styles.ratingText}>★ 4.9</Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } })}
          style={styles.actionBtn}
        >
          <Text style={styles.actionBtnText}>Voir Détails</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 32,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    width: '48%',
  },
  imageContainer: {
    // relative is implied in React Native
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emojiText: {
    fontSize: 36,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: '#020617',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#020617',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginLeft: 4,
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatarBg: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  userAvatarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  userName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    flex: 1,
    letterSpacing: -0.2,
  },
  ratingText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginLeft: 4,
  },
  actionBtn: {
    width: '100%',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
