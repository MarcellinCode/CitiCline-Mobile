import { View, TouchableOpacity, Image as RNImage } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Scale } from 'lucide-react-native';
import { Waste } from '../lib/types';
import { HubText } from './ui/HubText';
import { HubCard } from './ui/HubCard';
import { cn } from '../lib/utils';

interface WasteCardProps {
  waste: Waste;
}

export function WasteCard({ waste }: WasteCardProps) {
  const router = useRouter();
  const hasImage = waste.images && waste.images.length > 0;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } } as any)}
      className="w-[48%] mb-4"
    >
      <HubCard className="p-0 border-2 border-zinc-50 overflow-hidden h-72 justify-between">
        <View className="relative">
            <View className="w-full aspect-square bg-zinc-50 items-center justify-center overflow-hidden">
                {hasImage ? (
                    <RNImage 
                    source={{ uri: waste.images[0] }} 
                    className="w-full h-full"
                    resizeMode="cover"
                    />
                ) : (
                    <HubText className="text-4xl">{waste.waste_types?.emoji || '♻️'}</HubText>
                )}
            </View>
            <View className="absolute top-3 right-3 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
                <HubText variant="label" className="text-zinc-900 text-[8px] leading-tight">
                    {waste.waste_types?.price_per_kg || '0'} /KG
                </HubText>
            </View>
        </View>

        <View className="p-4 flex-1 justify-between">
            <View>
                <HubText variant="h3" className="text-zinc-900 text-sm mb-1" numberOfLines={1}>
                    {waste.waste_types?.name || 'Recyclables'}
                </HubText>
                <View className="flex-row items-center gap-1 mb-2">
                    <MapPin size={10} color="#94a3b8" />
                    <HubText variant="caption" className="text-[8px] uppercase tracking-wider" numberOfLines={1}>
                        {waste.location}
                    </HubText>
                </View>
            </View>

            <View className="flex-row items-center justify-between border-t border-zinc-50 pt-3">
                <View className="flex-row items-center gap-1">
                    <Scale size={12} color="#2A9D8F" />
                    <HubText variant="h3" className="text-[10px] text-zinc-900">{waste.estimated_weight}T</HubText>
                </View>
                <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
                    <ArrowSmallRight size={14} color="#2A9D8F" />
                </View>
            </View>
        </View>
      </HubCard>
    </TouchableOpacity>
  );
}

// Minimal arrow icon for internal card use
function ArrowSmallRight({ size, color }: { size: number, color: string }) {
    return (
        <View style={{ transform: [{ rotate: '-45deg' }] }}>
          <View style={{ width: size, height: 2, backgroundColor: color, position: 'absolute', top: size/2 }} />
          <View style={{ width: size/1.5, height: 2, backgroundColor: color, position: 'absolute', top: size/2 - size/4, right: 0, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: size/1.5, height: 2, backgroundColor: color, position: 'absolute', top: size/2 + size/4, right: 0, transform: [{ rotate: '-45deg' }] }} />
        </View>
    );
}
