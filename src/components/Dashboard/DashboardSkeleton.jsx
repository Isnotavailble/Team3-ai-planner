
export default function DashboardSkeleton() {
  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}
      className="animate-fade-in">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="shimmer" style={{ width: '180px', height: '22px', borderRadius: '6px' }} />
          <div className="shimmer" style={{ width: '260px', height: '12px', borderRadius: '4px' }} />
        </div>
        <div className="shimmer" style={{ width: '100px', height: '32px', borderRadius: '8px' }} />
      </div>

      {/* Financial Breakdown Card */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '24px',
        padding: '24px', border: '1px solid var(--border-default)',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        {/* Card Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="shimmer" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '200px', height: '14px', borderRadius: '4px' }} />
        </div>

        {/* 3 KPI Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="shimmer" style={{ width: '100px', height: '11px', borderRadius: '4px' }} />
              <div className="shimmer" style={{ width: '130px', height: '26px', borderRadius: '6px' }} />
            </div>
          ))}
        </div>

        {/* Health Status Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
          <div className="shimmer skeleton-circle" style={{ width: '40px', height: '40px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="shimmer" style={{ width: '140px', height: '11px', borderRadius: '4px' }} />
            <div className="shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>

      {/* Two-Column Row: Pie Chart Card + Breakdown List Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Left: Profit Pie Chart Card */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '24px',
          padding: '24px', border: '1px solid var(--border-default)',
          display: 'flex', flexDirection: 'column', gap: '24px'
        }}>
          {/* Card label */}
          <div className="shimmer" style={{ width: '220px', height: '10px', borderRadius: '4px' }} />

          {/* Side-by-side: donut + legend */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {/* Donut circle */}
            <div className="shimmer skeleton-circle" style={{ width: '160px', height: '160px', flexShrink: 0 }} />

            {/* Legend rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="shimmer skeleton-circle" style={{ width: '8px', height: '8px' }} />
                    <div className="shimmer" style={{ width: '90px', height: '11px', borderRadius: '4px' }} />
                  </div>
                  <div className="shimmer" style={{ width: '110px', height: '14px', borderRadius: '4px', marginLeft: '16px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Breakdown List Card */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '24px',
          padding: '24px', border: '1px solid var(--border-default)',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          {/* Header row with title + toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="shimmer" style={{ width: '140px', height: '10px', borderRadius: '4px' }} />
            <div className="shimmer" style={{ width: '120px', height: '24px', borderRadius: '8px' }} />
          </div>

          {/* List rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="shimmer skeleton-circle" style={{ width: '10px', height: '10px' }} />
                    <div className="shimmer" style={{ width: `${90 + i * 10}px`, height: '11px', borderRadius: '4px' }} />
                  </div>
                  <div className="shimmer" style={{ width: '70px', height: '11px', borderRadius: '4px' }} />
                </div>
                <div className="shimmer" style={{ width: '100%', height: '4px', borderRadius: '2px' }} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Revenue vs Target Bar Chart */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '24px',
        padding: '24px', border: '1px solid var(--border-default)',
        display: 'flex', flexDirection: 'column', gap: '24px'
      }}>
        <div className="shimmer" style={{ width: '260px', height: '10px', borderRadius: '4px' }} />
        <div className="shimmer" style={{ width: '100%', height: '280px', borderRadius: '12px' }} />
      </div>

    </div>
  );
}
