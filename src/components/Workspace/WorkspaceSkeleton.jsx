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

function AnalyticsSkeleton() {
  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}
      className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="shimmer" style={{ width: '180px', height: '20px', borderRadius: '4px' }} />
        <div className="shimmer" style={{ width: '300px', height: '12px', borderRadius: '3px' }} />
      </div>

      {/* KPI Hero Row */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '24px',
        border: '1px solid var(--border-default)', padding: '24px 32px',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center'
      }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div className="shimmer" style={{ width: '80px', height: '10px', borderRadius: '3px' }} />
            <div className="shimmer" style={{ width: '48px', height: '26px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      {/* Two Weekly Graph Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {[1,2].map(i => (
          <div key={i} style={{
            background: 'var(--bg-surface)', borderRadius: '24px',
            padding: '24px', border: '1px solid var(--border-default)',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div className="shimmer" style={{ width: '140px', height: '10px', borderRadius: '3px' }} />
            <div className="shimmer" style={{ width: '100%', height: '180px', borderRadius: '8px' }} />
          </div>
        ))}
      </div>

      {/* Simulation Panel */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '24px',
        border: '1px solid var(--border-default)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        <div className="shimmer" style={{ width: '200px', height: '12px', borderRadius: '3px' }} />
        <div className="shimmer" style={{ width: '100%', height: '220px', borderRadius: '8px' }} />
      </div>

      {/* SWOT + Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {[1,2].map(i => (
          <div key={i} style={{
            background: 'var(--bg-surface)', borderRadius: '24px',
            padding: '24px', border: '1px solid var(--border-default)',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <div className="shimmer" style={{ width: '120px', height: '10px', borderRadius: '3px' }} />
            {[1,2,3].map(j => (
              <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="shimmer" style={{ width: '100%', height: '10px', borderRadius: '3px' }} />
                <div className="shimmer" style={{ width: '85%', height: '10px', borderRadius: '3px' }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorkspaceSkeleton({ pathname = '' }) {
  if (pathname.includes('/analytics')) {
    return <AnalyticsSkeleton />;
  }
  if (pathname.includes('/predict')) {
    return <PredictSetupSkeleton />;
  }
  return <DashboardSkeleton />;
}
