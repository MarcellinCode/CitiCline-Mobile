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
    default: 'bg-white border border-slate-200/80 shadow-sm shadow-slate-200/50',
    outline: 'bg-transparent border border-slate-200',
    ghost: 'bg-slate-50 border-0',
    accent: 'bg-primary border-0 shadow-sm shadow-primary/20',
  };

  return (
    <View 
      className={cn(
        "rounded-2xl p-5 overflow-hidden relative",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </View>
  );
}
