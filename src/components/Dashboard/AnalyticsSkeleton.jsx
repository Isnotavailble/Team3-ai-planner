
export default function AnalyticsSkeleton() {
  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}
      className="animate-fade-in">

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="shimmer" style={{ width: '200px', height: '22px', borderRadius: '6px' }} />
        <div className="shimmer" style={{ width: '340px', height: '12px', borderRadius: '4px' }} />
      </div>

      {/* Main Simulation Card */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '24px',
        border: '1px solid var(--border-default)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '24px'
      }}>

        {/* Card Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="shimmer skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="shimmer" style={{ width: '220px', height: '14px', borderRadius: '4px' }} />
            <div className="shimmer" style={{ width: '300px', height: '10px', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Two-column: Sliders | Chart area */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>

          {/* Left: Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="shimmer" style={{ width: '100px', height: '10px', borderRadius: '4px' }} />

            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="shimmer" style={{ width: '130px', height: '11px', borderRadius: '4px' }} />
                  <div className="shimmer" style={{ width: '36px', height: '11px', borderRadius: '4px' }} />
                </div>
                <div className="shimmer" style={{ width: '100%', height: '6px', borderRadius: '3px' }} />
              </div>
            ))}

            {/* Run button */}
            <div className="shimmer" style={{ width: '100%', height: '36px', borderRadius: '8px' }} />
          </div>

          {/* Right: Dashed chart placeholder */}
          <div style={{
            height: '420px', border: '1.5px dashed var(--border-default)', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="shimmer skeleton-circle" style={{ width: '32px', height: '32px', opacity: 0.4 }} />
          </div>
        </div>

        {/* Bottom two-column: SWOT | Recommendations */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px',
          borderTop: '1px solid var(--border-default)', paddingTop: '24px'
        }}>

          {/* SWOT Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="shimmer skeleton-circle" style={{ width: '18px', height: '18px' }} />
              <div className="shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
            </div>
            {/* 2×2 SWOT grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  border: '1px solid var(--border-default)', borderRadius: '16px',
                  padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="shimmer skeleton-circle" style={{ width: '6px', height: '6px' }} />
                    <div className="shimmer" style={{ width: '60px', height: '10px', borderRadius: '3px' }} />
                  </div>
                  <div className="shimmer" style={{ width: '80%', height: '11px', borderRadius: '3px' }} />
                  <div className="shimmer" style={{ width: '100%', height: '10px', borderRadius: '3px' }} />
                  <div className="shimmer" style={{ width: '70%', height: '10px', borderRadius: '3px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="shimmer skeleton-circle" style={{ width: '18px', height: '18px' }} />
              <div className="shimmer" style={{ width: '140px', height: '14px', borderRadius: '4px' }} />
            </div>
            {/* Rec list */}
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                border: '1px solid var(--border-default)', borderRadius: '12px',
                padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start'
              }}>
                <div className="shimmer" style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div className="shimmer" style={{ width: '60%', height: '12px', borderRadius: '3px' }} />
                  <div className="shimmer" style={{ width: '95%', height: '10px', borderRadius: '3px' }} />
                  <div className="shimmer" style={{ width: '75%', height: '10px', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
