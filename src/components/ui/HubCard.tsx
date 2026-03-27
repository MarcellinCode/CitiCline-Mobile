import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface HubCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'accent';
}

export function HubCard({ children, className, variant = 'default', ...props }: HubCardProps) {
  const variants = {
    default: 'bg-white border-2 border-zinc-50 shadow-lg shadow-zinc-200/50',
    outline: 'bg-transparent border-2 border-zinc-200',
    ghost: 'bg-zinc-50/50 border-0',
    accent: 'bg-primary border-0 shadow-lg shadow-primary/20',
  };

  return (
    <View 
      className={cn(
        "rounded-6xl p-6 overflow-hidden relative",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </View>
  );
}
