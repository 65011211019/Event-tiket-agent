import React from 'react';

export function EventCardSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-muted" />
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        
        {/* Details */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        
        {/* Price & Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-muted rounded w-20" />
          <div className="h-10 bg-muted rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="h-96 bg-muted mb-8" />
      
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
            
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="h-80 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}