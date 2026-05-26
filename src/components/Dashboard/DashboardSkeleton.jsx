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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-card border border-border-light rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-surface-panel shimmer rounded-sm" />
              <div className="w-5 h-5 bg-surface-panel shimmer rounded-full" />
            </div>
            <div className="h-8 w-16 bg-surface-panel shimmer rounded-md" />
            <div className="h-10 w-full bg-surface-panel/40 shimmer rounded-lg" />
          </div>
        ))}
      </div>

      {/* Financials & Budgeting Card Skeleton */}
      <div className="bg-surface-card border border-border-light rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
          <div className="w-4.5 h-4.5 bg-surface-panel shimmer rounded-full" />
          <div className="h-4 w-40 bg-surface-panel shimmer rounded-md" />
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="h-4 w-36 mx-auto bg-surface-panel shimmer rounded-md mb-6" />
            <div className="h-[250px] flex items-end gap-3 px-4">
              {[60, 80, 50, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex gap-1 items-end h-full">
                  <div className="w-1/2 bg-surface-panel shimmer rounded-t-sm" style={{ height: `${h}%` }} />
                  <div className="w-1/2 bg-surface-panel/45 shimmer rounded-t-sm" style={{ height: `${h - 15}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="h-4 w-32 bg-surface-panel shimmer rounded-md mb-6" />
            <div className="w-44 h-44 rounded-full border-[18px] border-surface-panel shimmer flex items-center justify-center" />
          </div>
        </div>
      </div>

      {/* Sales Velocity Chart Skeleton */}
      <div className="bg-surface-card border border-border-light rounded-xl overflow-hidden shadow-sm p-6 space-y-6">
        <div className="h-4 w-52 bg-surface-panel shimmer rounded-md" />
        <div className="h-[280px] w-full bg-surface-panel/20 shimmer rounded-lg relative overflow-hidden flex flex-col justify-between p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full h-px bg-border-light/60" />
          ))}
          {/* Simulated line wave */}
          <div className="absolute inset-0 flex items-center justify-between px-8">
            <div className="w-2.5 h-2.5 rounded-full bg-surface-panel shimmer" style={{ transform: 'translateY(20px)' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-surface-panel shimmer" style={{ transform: 'translateY(10px)' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-surface-panel shimmer" style={{ transform: 'translateY(-15px)' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-surface-panel shimmer" style={{ transform: 'translateY(-5px)' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-surface-panel shimmer" style={{ transform: 'translateY(-40px)' }} />
          </div>
        </div>
      </div>

      {/* Two Columns: Trend Chart + Signals Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-surface-card border border-border-light rounded-xl p-6 space-y-6">
          <div className="h-4 w-32 bg-surface-panel shimmer rounded-md" />
          <div className="h-[260px] w-full bg-surface-panel/30 shimmer rounded-lg" />
        </div>
        <div className="lg:col-span-2 bg-surface-card border border-border-light rounded-xl p-6 space-y-4">
          <div className="h-4 w-28 bg-surface-panel shimmer rounded-md mb-2" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 py-1 border-b border-border-light/40 last:border-none">
              <div className="w-8 h-8 rounded-md bg-surface-panel shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-surface-panel shimmer rounded-sm" />
                <div className="h-2.5 w-1/2 bg-surface-panel/60 shimmer rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Graph Card Skeleton */}
      <div className="bg-surface-card border border-border-light rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-40 bg-surface-panel shimmer rounded-md" />
          <div className="h-7 w-24 bg-surface-panel shimmer rounded-md" />
        </div>
        <div className="h-[350px] w-full bg-surface-panel/20 shimmer rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Mock network node mesh layout in skeleton */}
          <div className="absolute top-[25%] left-[20%] w-10 h-10 rounded-full bg-surface-panel shimmer" />
          <div className="absolute top-[40%] left-[50%] w-12 h-12 rounded-full bg-surface-panel shimmer" />
          <div className="absolute top-[60%] left-[30%] w-8 h-8 rounded-full bg-surface-panel shimmer" />
          <div className="absolute top-[30%] left-[75%] w-10 h-10 rounded-full bg-surface-panel shimmer" />
          <div className="absolute top-[70%] left-[70%] w-9 h-9 rounded-full bg-surface-panel shimmer" />
        </div>
      </div>
    </div>
  );
}
