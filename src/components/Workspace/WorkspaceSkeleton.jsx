import React from 'react';
import DashboardSkeleton from '../Dashboard/DashboardSkeleton';

function PredictSetupSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-panel shimmer shrink-0" />
        <div className="space-y-2">
          <div className="h-5.5 w-48 bg-surface-panel shimmer rounded-md" />
          <div className="h-3 w-60 bg-surface-panel shimmer rounded-sm" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Setup Conditions Skeleton */}
        <div className="w-full lg:w-[350px] bg-surface-card p-6 rounded-xl border border-border-light shadow-sm space-y-6 shrink-0">
          <div className="h-3.5 w-28 bg-surface-panel shimmer rounded-md mb-2" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2.5">
              <div className="flex justify-between">
                <div className="h-3 w-28 bg-surface-panel shimmer rounded-sm" />
                <div className="h-3 w-6 bg-surface-panel shimmer rounded-sm" />
              </div>
              <div className="h-2 w-full bg-surface-panel shimmer rounded-full" />
            </div>
          ))}
          <div className="h-9.5 w-full bg-surface-panel shimmer rounded-lg" style={{ marginTop: '32px' }} />
        </div>

        {/* Right Column: Waiting Placeholder Skeleton */}
        <div className="flex-1 h-[500px] bg-surface-card rounded-xl border border-border border-dashed flex flex-col items-center justify-center space-y-4">
          <div className="w-9 h-9 rounded-full bg-surface-panel shimmer" />
          <div className="h-3.5 w-60 bg-surface-panel shimmer rounded-md" />
          <div className="h-3 w-80 bg-surface-panel shimmer rounded-sm text-center" />
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceSkeleton({ pathname = '' }) {
  if (pathname.includes('/predict') || pathname.includes('/analytics')) {
    return <PredictSetupSkeleton />;
  }
  return <DashboardSkeleton />;
}
