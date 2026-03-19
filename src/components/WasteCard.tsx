import { View, Text, TouchableOpacity, Image as RNImage } from 'react-native';
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
      className="bg-white rounded-[2rem] mb-4 border border-slate-100 shadow-sm overflow-hidden"
      style={{ width: '48%' }}
    >
      <View className="relative">
        <View className="w-full aspect-square bg-slate-50 items-center justify-center">
          {hasImage ? (
            <RNImage 
              source={{ uri: waste.images[0] }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-4xl">{waste.waste_types?.emoji || '♻️'}</Text>
          )}
        </View>
        <TouchableOpacity 
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full items-center justify-center shadow-sm"
        >
          <View className="w-4 h-4 rounded-full border border-slate-300" />
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <Text className="text-[13px] font-black text-[#020617] mb-0.5" numberOfLines={1}>
          {waste.waste_types?.name || 'Recyclables'}
        </Text>
        <Text className="text-[9px] font-bold text-slate-400 uppercase mb-2" numberOfLines={1}>
          Matériau recyclable
        </Text>

        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Scale size={10} color="#64748b" />
            <Text className="text-[10px] font-black text-slate-600 ml-1">{waste.estimated_weight} Tons</Text>
          </View>
          <Text className="text-[10px] font-black text-[#020617]">${waste.waste_types?.price_per_kg || '0'}/kg</Text>
        </View>

        <View className="flex-row items-center mb-3">
          <MapPin size={10} color="#94a3b8" />
          <Text className="text-[9px] font-bold text-slate-400 uppercase truncate ml-1 flex-1" numberOfLines={1}>
            {waste.location}
          </Text>
        </View>

        <View className="flex-row items-center mb-4">
           <View className="w-3.5 h-3.5 rounded-full bg-primary/20 items-center justify-center mr-1">
             <View className="w-1.5 h-1.5 rounded-full bg-primary" />
           </View>
           <Text className="text-[9px] font-bold text-slate-500 truncate flex-1" numberOfLines={1}>
             {waste.profiles?.full_name || 'PowerCycle Ltd'}
           </Text>
           <Text className="text-[8px] font-bold text-amber-500 ml-1">★ 4.9</Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/(tabs)/marketplace/[id]', params: { id: waste.id } })}
          className="w-full bg-primary py-2.5 rounded-xl items-center justify-center"
        >
          <Text className="text-white text-[10px] font-black uppercase tracking-widest">Voir Détails</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
