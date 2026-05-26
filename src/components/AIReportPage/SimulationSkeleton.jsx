import React from 'react';

export default function SimulationSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Verdict Summary Card Skeleton */}
      <div className="bg-surface-card p-5 rounded-xl border border-border-light shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex gap-3 flex-1">
          <div className="w-4 h-4 bg-surface-panel shimmer rounded-full mt-0.5 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-44 bg-surface-panel shimmer rounded-sm" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-full bg-surface-panel shimmer rounded-sm" />
              <div className="h-3.5 w-[90%] bg-surface-panel shimmer rounded-sm" />
            </div>
          </div>
        </div>
        <div className="h-8.5 w-32 bg-surface-panel shimmer rounded-lg shrink-0" />
      </div>

      {/* Probability Graph Skeleton */}
      <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-4.5 h-4.5 bg-surface-panel shimmer rounded-full" />
          <div className="h-4 w-52 bg-surface-panel shimmer rounded-md" />
        </div>
        
        {/* Shimmer Area Chart Area */}
        <div className="w-full h-[320px] bg-surface-panel/15 shimmer rounded-lg relative overflow-hidden flex flex-col justify-between p-4 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full h-px bg-border-light/60" />
          ))}
          {/* Wave placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[11px] font-medium text-txt-tertiary select-none">
              Calculating Scenario Probability Waves...
            </div>
          </div>
        </div>
      </div>

      {/* Pathways Grid Skeleton (3 Evaluated Pathways) */}
      <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
        <div className="h-4.5 w-36 bg-surface-panel shimmer rounded-md mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-border-light bg-surface-panel/30 space-y-4">
              <div className="flex justify-between items-center gap-2">
                <div className="h-4 w-28 bg-surface-panel shimmer rounded-md" />
                <div className="h-5 w-10 bg-surface-panel shimmer rounded-full shrink-0" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-surface-panel shimmer rounded-sm" />
                <div className="h-3 w-full bg-surface-panel shimmer rounded-sm" />
                <div className="h-3 w-3/4 bg-surface-panel shimmer rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key observed dynamics Skeleton */}
      <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
        <div className="h-4.5 w-52 bg-surface-panel shimmer rounded-md mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-start bg-surface-panel/40 p-4 rounded-lg border border-border-light">
              <div className="w-1.5 h-1.5 rounded-full bg-surface-panel shimmer mt-1.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full bg-surface-panel shimmer rounded-sm" />
                <div className="h-3 w-5/6 bg-surface-panel shimmer rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
