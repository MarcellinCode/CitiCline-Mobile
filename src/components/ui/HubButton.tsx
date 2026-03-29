import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils';

interface HubButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function HubButton({ 
  children, 
  className, 
  textClassName, 
  variant = 'primary', 
  icon,
  size = 'md',
  loading,
  disabled,
  ...props 
}: HubButtonProps) {
  const variants = {
    primary: 'bg-zinc-900',
    secondary: 'bg-zinc-100',
    accent: 'bg-primary',
    outline: 'border-2 border-zinc-200 bg-transparent',
  };

  const textColors = {
    primary: 'text-white',
    secondary: 'text-zinc-900',
    accent: 'text-white',
    outline: 'text-zinc-900',
  };

  const sizes = {
    sm: 'h-10 px-4 rounded-2xl',
    md: 'h-14 px-6 rounded-3xl',
    lg: 'h-20 px-8 rounded-4xl',
    xl: 'h-24 px-10 rounded-5xl',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-[13px]',
    xl: 'text-[15px]',
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...props}
    >
      <View
        className={cn(
          "flex-row items-center justify-between overflow-hidden",
          variants[variant],
          sizes[size],
          (disabled || loading) && "opacity-50",
          className
        )}
      >
        {loading ? (
             <View className="flex-1 items-center justify-center">
                <ActivityIndicator color={variant === 'primary' || variant === 'accent' ? 'white' : '#18181b'} />
             </View>
        ) : (
            <>
                <Text 
                className={cn(
                    "font-black uppercase italic tracking-[0.1em]",
                    textColors[variant],
                    textSizes[size],
                    textClassName
                )}
                >
                {children}
                </Text>
                
                {icon && (
                <View className={cn(
                    "w-8 h-8 rounded-xl items-center justify-center ml-4",
                    variant === 'primary' ? 'bg-primary' : 'bg-zinc-900'
                )}>
                    {icon}
                </View>
                )}
            </>
        )}
      </View>
    </TouchableOpacity>
  );
}
