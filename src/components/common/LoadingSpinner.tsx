'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    secondary: 'border-secondary-200 border-t-secondary-600',
    accent: 'border-accent-200 border-t-accent-600',
    white: 'border-white/20 border-t-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} border-4 rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-2 text-sm text-dental-muted animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-dental-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-dental-foreground mb-2">Loading...</h2>
        <p className="text-dental-muted">Please wait while we prepare your dashboard</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="dental-card p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-dental-border rounded w-3/4"></div>
        <div className="h-4 bg-dental-border rounded w-1/2"></div>
        <div className="h-4 bg-dental-border rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="dental-card overflow-hidden">
      <div className="px-6 py-4 border-b border-dental-border">
        <div className="h-4 bg-dental-border rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="divide-y divide-dental-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="h-4 bg-dental-border rounded flex-1"></div>
              <div className="h-4 bg-dental-border rounded w-20"></div>
              <div className="h-4 bg-dental-border rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
