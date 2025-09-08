import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-3 text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingPage({ text = 'กำลังโหลด...' }: { text?: string }) {
  return (
    <div className="min-h-screen-header flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse bg-muted rounded-xl h-96 flex items-center justify-center">
      <LoadingSpinner size="md" />
    </div>
  );
}