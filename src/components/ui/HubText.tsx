import React from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '@/lib/utils';

interface HubTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'label' | 'body' | 'caption';
}

export function HubText({ children, className, variant = 'body', ...props }: HubTextProps) {
  const variants = {
    h1: 'text-4xl font-black uppercase italic tracking-tighter leading-tight',
    h2: 'text-2xl font-black uppercase italic tracking-tight leading-tight',
    h3: 'text-xl font-black uppercase italic tracking-tight leading-tight',
    label: 'text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400',
    body: 'text-sm font-medium',
    caption: 'text-xs font-semibold text-zinc-500',
  };

  return (
    <Text 
      className={cn(
        variants[variant],
        className
      )} 
      style={{ includeFontPadding: false }}
      {...props}
    >
      {children}
    </Text>
  );
}
