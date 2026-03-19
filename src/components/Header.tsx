import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  rightAction?: React.ReactNode;
}

export function Header({ title, subtitle, className, rightAction }: HeaderProps) {
  return (
    <View className={cn("px-8 pt-16 pb-6 bg-white flex-row items-center justify-between", className)}>
      <View className="flex-1">
        <Text className="text-3xl font-black text-[#020617] uppercase italic tracking-tighter leading-none mb-1">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && (
        <View className="ml-4">
          {rightAction}
        </View>
      )}
    </View>
  );
}
