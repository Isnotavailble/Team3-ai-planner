import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in">
      {/* Page Title & Button Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-surface-panel shimmer rounded-md" />
          <div className="h-3.5 w-64 bg-surface-panel shimmer rounded-sm" />
        </div>
        <div className="h-9 w-32 bg-surface-panel shimmer rounded-lg" />
      </div>

      {/* KPI Cards Row (4 cards) */}
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-card border border-border-light rounded-2xl p-6 h-[140px] flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-surface-panel shimmer" />
              <div className="h-3 w-24 bg-surface-panel shimmer rounded-sm" />
            </div>
            <div className="h-10 w-32 bg-surface-panel shimmer rounded-md" />
          </div>
        ))}
      </div>

      {/* CHARTS AND TOP PRODUCTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Sales Chart (approx 60%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center min-h-[28px]">
            <div className="h-3 w-32 bg-surface-panel shimmer rounded-sm" />
            <div className="h-5 w-24 bg-surface-panel shimmer rounded-md" />
          </div>
          <div className="bg-surface-card border border-border-default rounded-2xl h-[280px] shadow-sm flex flex-col p-6">
             <div className="flex-1 w-full bg-surface-panel/30 shimmer rounded-lg" />
          </div>
        </div>

        {/* Right Column: Top Products list (approx 40%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="min-h-[28px] flex items-center">
             <div className="h-3 w-28 bg-surface-panel shimmer rounded-sm" />
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-card border border-border-default rounded-xl p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-3.5 w-32 bg-surface-panel shimmer rounded-sm" />
                  <div className="h-2.5 w-16 bg-surface-panel/60 shimmer rounded-sm" />
                </div>
                <div className="h-4 w-20 bg-surface-panel shimmer rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
