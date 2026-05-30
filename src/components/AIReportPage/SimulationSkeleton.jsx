

export default function SimulationSkeleton({ showGraph = true, showCards = true }) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', overflow: 'hidden', paddingBottom: '24px' }}>
      
      {showGraph && (
        <>
          {/* 1. Verdict Summary Card Skeleton */}
          <div style={{
            background: 'var(--bg-gradient-1)', border: '1px solid var(--border-default)',
            borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="shimmer" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                <div className="shimmer" style={{ width: '120px', height: '10px', borderRadius: '3px' }} />
              </div>
              <div className="shimmer" style={{ width: '100px', height: '24px', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <div className="shimmer" style={{ width: '100%', height: '12px', borderRadius: '3px' }} />
              <div className="shimmer" style={{ width: '85%', height: '12px', borderRadius: '3px' }} />
            </div>
          </div>

          {/* 2. 5-LINE PROJECTION CHART SKELETON */}
          <div style={{ border: '1px solid var(--border-default)', borderRadius: '16px', padding: '20px', background: 'var(--bg-surface)' }}>
            {/* Title Block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div className="shimmer" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
              <div className="shimmer" style={{ width: '160px', height: '11px', borderRadius: '3px' }} />
            </div>
            
            {/* Shimmer Chart Grid Area */}
            <div className="shimmer" style={{ 
              width: '100%', height: '220px', borderRadius: '8px',
              position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', padding: '16px',
              background: 'rgba(244, 244, 242, 0.4)'
            }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.03)' }} />
              ))}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                  Simulating Swarm Intelligence Curves...
                </span>
              </div>
            </div>

            {/* Checkboxes Row */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center',
              paddingTop: '14px', borderTop: '1px solid var(--border-default)', marginTop: '12px'
            }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="shimmer" style={{ width: '12px', height: '12px', borderRadius: '3px' }} />
                  <div className="shimmer" style={{ width: '64px', height: '10px', borderRadius: '3px' }} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showCards && (
        /* 3. 4 MAJOR AI SUGGESTION CARDS GRID SKELETON (Horizontal collapsed accordions) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                <div className="shimmer" style={{ width: '140px', height: '12px', borderRadius: '3px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="shimmer" style={{ width: '56px', height: '20px', borderRadius: '12px' }} />
                <div className="shimmer" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
