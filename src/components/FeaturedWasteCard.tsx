import { View, TouchableOpacity, Image as RNImage } from 'react-native';
import { useRouter } from 'expo-router';
import { Waste } from '../lib/types';
import { Leaf, ArrowUpRight } from 'lucide-react-native';
import { HubText } from './ui/HubText';
import { HubCard } from './ui/HubCard';

interface FeaturedWasteCardProps {
  waste: Waste;
  key?: string | number;
}

export function FeaturedWasteCard({ waste }: FeaturedWasteCardProps) {
  const router = useRouter();
  const imageUrl = waste.images && waste.images.length > 0 ? waste.images[0] : null;

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } } as any)}
      className="w-64"
    >
      <HubCard className="p-0 border-2 border-zinc-50 overflow-hidden h-64 bg-white justify-between">
        <View className="h-32 w-full bg-zinc-50 items-center justify-center">
          {imageUrl ? (
            <RNImage source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Leaf size={40} color="#cbd5e1" strokeWidth={1} />
          )}
          <View className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full">
            <HubText variant="label" className="text-white text-[8px] tracking-[0.2em]">FEATURED</HubText>
          </View>
        </View>
        
        <View className="p-6">
          <HubText variant="h2" className="text-lg text-zinc-900 mb-2" numberOfLines={1}>
            {waste.waste_types?.name || 'Recyclables'}
          </HubText>
          
          <View className="flex-row justify-between items-center mb-4">
              <View>
                <HubText variant="label" className="text-[8px] mb-0 text-zinc-400">POIDS EST.</HubText>
                <HubText variant="h3" className="text-zinc-900 text-sm italic">{waste.estimated_weight} Tons</HubText>
              </View>
              <View className="items-end">
                <HubText variant="label" className="text-[8px] mb-0 text-zinc-400">PRIX/KG</HubText>
                <HubText variant="h3" className="text-primary text-sm italic">{waste.waste_types?.price_per_kg || '0'} FCFA</HubText>
              </View>
          </View>

          <View className="flex-row items-center justify-between border-t border-zinc-50 pt-4">
            <View className="flex-row items-center gap-2">
                <View className="w-5 h-5 rounded-full bg-primary/10 items-center justify-center">
                    <View className="w-2 h-2 rounded-full bg-primary" />
                </View>
                <HubText variant="caption" className="text-[9px] uppercase tracking-tighter decoration-zinc-400">
                    {waste.profiles?.full_name || 'CITICLINE'}
                </HubText>
            </View>
            <ArrowUpRight size={14} color="#2A9D8F" />
          </View>
        </View>
      </HubCard>
    </TouchableOpacity>
  );
}
