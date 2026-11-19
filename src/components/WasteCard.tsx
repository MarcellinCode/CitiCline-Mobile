import React from 'react';
import { View, TouchableOpacity, Image as RNImage } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Scale, ArrowRight, Recycle } from 'lucide-react-native';
import { Waste } from '../lib/types';
import { HubText } from './ui/HubText';
import { HubCard } from './ui/HubCard';

interface WasteCardProps {
  waste: Waste;
}

export const WasteCard = React.memo(function WasteCard({ waste }: WasteCardProps) {
  const router = useRouter();
  const hasImage = waste.images && waste.images.length > 0;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } } as any)}
      className="w-[48%] mb-4"
    >
      <HubCard className="p-0 border border-slate-200/80 overflow-hidden h-72 justify-between">
        <View className="relative">
            <View className="w-full aspect-square bg-slate-50 items-center justify-center overflow-hidden">
                {hasImage ? (
                    <RNImage 
                    source={{ uri: waste.images[0] }} 
                    className="w-full h-full"
                    resizeMode="cover"
                    />
                ) : (
                    <Recycle size={34} color="#94a3b8" strokeWidth={1.75} />
                )}
            </View>
            <View className="absolute top-2.5 right-2.5 bg-white/95 px-2.5 py-1 rounded-lg border border-slate-200/60">
                <HubText className="text-slate-900 text-xs font-semibold">
                    {waste.waste_types?.price_per_kg || '0'} F/kg
                </HubText>
            </View>
        </View>

        <View className="p-3.5 flex-1 justify-between">
            <View>
                <HubText variant="h3" className="text-slate-900 text-sm mb-1" numberOfLines={1}>
                    {waste.waste_types?.name || 'Recyclables'}
                </HubText>
                <View className="flex-row items-center gap-1 mb-2">
                    <MapPin size={12} color="#64748b" />
                    <HubText variant="caption" className="text-xs text-slate-500" numberOfLines={1}>
                        {waste.location}
                    </HubText>
                </View>
            </View>

            <View className="flex-row items-center justify-between border-t border-slate-100 pt-2.5">
                <View className="flex-row items-center gap-1.5">
                    <Scale size={13} color="#017A35" />
                    <HubText className="text-xs font-semibold text-slate-800">{waste.estimated_weight} kg</HubText>
                </View>
                <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center">
                    <ArrowRight size={14} color="#017A35" />
                </View>
            </View>
        </View>
      </HubCard>
    </TouchableOpacity>
  );
});
