import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Waste } from '../lib/types';
import { Leaf } from 'lucide-react-native';

interface FeaturedWasteCardProps {
  waste: Waste;
}

export function FeaturedWasteCard({ waste }: FeaturedWasteCardProps) {
  const router = useRouter();
  const imageUrl = waste.images && waste.images.length > 0 ? waste.images[0] : null;

  return (
    <TouchableOpacity 
      onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } })}
      className="bg-white rounded-[2rem] mr-4 shadow-sm border border-slate-100 overflow-hidden"
      style={{ width: 220 }}
    >
      <View className="h-28 w-full bg-slate-100">
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Leaf size={32} color="#cbd5e1" />
          </View>
        )}
      </View>
      <View className="p-4">
        <Text className="text-sm font-black text-[#020617] mb-1" numberOfLines={1}>
          {waste.waste_types?.name || 'Recyclables'}
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {waste.estimated_weight} Tons
          </Text>
          <Text className="text-[10px] font-black text-primary uppercase">
            ${waste.waste_types?.price_per_kg || '0'}/kg
          </Text>
        </View>
        <View className="flex-row items-center mt-3 pt-3 border-t border-slate-50">
           <View className="w-4 h-4 rounded-full bg-primary/20 items-center justify-center mr-2">
             <View className="w-2 h-2 rounded-full bg-primary" />
           </View>
           <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-tight" numberOfLines={1}>
             {waste.profiles?.full_name || 'CITICLINE'}
           </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
