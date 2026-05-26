import React from 'react';
import { X, FileText, ArrowRight, CornerRightDown } from 'lucide-react';

const FRIENDLY_TYPES = {
  you: 'Our Platform',
  company: 'Competitor App',
  segment: 'Market Segment',
  person: 'Key Figure',
  policy: 'Market Rule',
  concept: 'Market Need',
  event: 'Market Event',
  product: 'Product Feature',
  organization: 'Retail Shop Account'
};

export default function Drilldown({
  entity,
  onClose,
  onSelectEntity,
  materials,
  edges
}) {
  // Filter materials that cite this entity
  const citedMaterials = materials.filter(m => m.extracted && m.extracted.includes(entity.id));

  // Find immediate neighbors in the graph
  const neighbors = [];
  edges.forEach(e => {
    if (e.a === entity.id) {
      neighbors.push({ edgeLabel: e.label, node: e.b });
    } else if (e.b === entity.id) {
      neighbors.push({ edgeLabel: e.label, node: e.a });
    }
  });

  return (
    <div style={{
      width: '380px', height: '100%', borderLeft: '1px solid var(--border-default)',
      background: 'var(--surface-card)', display: 'flex', flexDirection: 'column',
      boxShadow: '-4px 0 16px rgba(0,0,0,0.02)'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center" style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border-light)'
      }}>
        <div>
          <span className="mono" style={{
            fontSize: '9px', background: 'var(--surface-panel)', color: 'var(--text-secondary)',
            padding: '2px 6px', borderRadius: '3px', fontWeight: 500
          }}>
            {FRIENDLY_TYPES[entity.type]?.toUpperCase() || entity.type.toUpperCase()}
          </span>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
            {entity.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '4px', borderRadius: '4px', color: 'var(--text-tertiary)'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="scrollable" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Core Summary Description */}
        <div>
          <h3 className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
            CONTEXT DESCRIPTION
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '16px' }}>
            {entity.summary}
          </p>
        </div>

        {/* References / Source Files */}
        {citedMaterials.length > 0 && (
          <div>
            <h3 className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
              MARKET SOURCE MATERIALS
            </h3>
            <div className="flex flex-col gap-4">
              {citedMaterials.map(m => (
                <div
                  key={m.id}
                  style={{
                    border: '1px solid var(--border-light)', borderRadius: '4px',
                    padding: '16px', background: 'var(--surface-panel)'
                  }}
                >
                  <div className="flex items-center gap-1.5" style={{ fontWeight: 500, fontSize: '12px', color: 'var(--text-primary)' }}>
                    <FileText size={14} color="var(--text-secondary)" />
                    {m.title}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                    "{m.summary}"
                  </p>
                  <div className="mono" style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                    {m.type} · {m.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected relationships */}
        {neighbors.length > 0 && (
          <div>
            <h3 className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
              DIRECT CONNECTIONS
            </h3>
            <div className="flex flex-col gap-3">
              {neighbors.map((n, idx) => {
                return (
                  <div
                    key={`neighbor-${idx}`}
                    onClick={() => onSelectEntity(n.node)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-light)',
                      background: 'var(--surface-card)', cursor: 'pointer', transition: 'all 0.1s ease',
                      fontSize: '13px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{n.node}</span>
                      <span className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        {n.edgeLabel}
                      </span>
                    </div>
                    <ArrowRight size={16} color="var(--text-tertiary)" style={{ marginLeft: 'auto' }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
