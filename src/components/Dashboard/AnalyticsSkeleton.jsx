import React from 'react';

export default function AnalyticsSkeleton() {
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
