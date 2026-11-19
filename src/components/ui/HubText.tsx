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
    h1: 'text-2xl font-bold tracking-tight text-slate-900 leading-8',
    h2: 'text-xl font-bold tracking-tight text-slate-900 leading-7',
    h3: 'text-base font-semibold text-slate-900 leading-6',
    label: 'text-xs font-semibold uppercase tracking-wider text-slate-500',
    body: 'text-sm font-normal text-slate-700 leading-5',
    caption: 'text-xs font-medium text-slate-500',
  };

  return (
    <Text 
      className={cn(
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </Text>
  );
}
