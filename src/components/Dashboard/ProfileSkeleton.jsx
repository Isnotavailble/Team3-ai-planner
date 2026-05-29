import React from 'react';

export default function ProfileSkeleton() {
  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* PROFILE HEADER */}
      <header style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: '24px', padding: '28px', display: 'flex', alignItems: 'center', gap: '20px'
      }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%' }} className="shimmer" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="shimmer" style={{ width: '150px', height: '24px', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '200px', height: '14px', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '80px', height: '20px', borderRadius: '10px', marginTop: '4px' }} />
        </div>
      </header>

      {/* BUSINESS PROFILE SETTINGS (CHANGE USERNAME) */}
      <section className="space-y-4">
        <div className="shimmer" style={{ width: '150px', height: '14px', borderRadius: '4px' }} />
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px'
        }}>
          <div className="shimmer" style={{ width: '180px', height: '18px', borderRadius: '4px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="shimmer" style={{ flex: 1, height: '40px', borderRadius: '8px' }} />
            <div className="shimmer" style={{ width: '80px', height: '40px', borderRadius: '8px' }} />
          </div>
        </div>
      </section>

      {/* LANGUAGE SELECTOR */}
      <section style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="shimmer" style={{ width: '120px', height: '16px', borderRadius: '4px' }} />
            <div className="shimmer" style={{ width: '200px', height: '12px', borderRadius: '4px' }} />
          </div>
        </div>
        <div className="shimmer" style={{ width: '120px', height: '32px', borderRadius: '8px' }} />
      </section>

      {/* CHANNELS INTEGRATIONS */}
      <section className="space-y-4">
        <div className="shimmer" style={{ width: '150px', height: '14px', borderRadius: '4px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="shimmer" style={{ width: '100px', height: '16px', borderRadius: '4px' }} />
                  <div className="shimmer" style={{ width: '140px', height: '12px', borderRadius: '4px' }} />
                </div>
              </div>
              <div className="shimmer" style={{ width: '80px', height: '28px', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      </section>

      {/* BUSINESS QUESTIONNAIRE & SYSTEM SETTINGS */}
      <section className="space-y-4">
        <div className="shimmer" style={{ width: '250px', height: '14px', borderRadius: '4px' }} />
        <div style={{
          background: 'var(--bg-elevated)', border: '1px dashed var(--border-default)',
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center'
        }}>
          <div className="shimmer" style={{ width: '300px', height: '16px', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '250px', height: '16px', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '200px', height: '36px', borderRadius: '8px', marginTop: '8px' }} />
        </div>
      </section>
      
      {/* SIGN OUT SECTION */}
      <section className="space-y-4">
        <div className="shimmer" style={{ width: '150px', height: '14px', borderRadius: '4px' }} />
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="shimmer" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
              <div className="shimmer" style={{ width: '180px', height: '12px', borderRadius: '4px' }} />
            </div>
          </div>
          <div className="shimmer" style={{ width: '80px', height: '36px', borderRadius: '8px' }} />
        </div>
      </section>
    </div>
  );
}
