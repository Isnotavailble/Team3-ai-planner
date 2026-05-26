import React from 'react';
import GraphCanvas from '../Graph/GraphCanvas';

const LEGEND_ITEMS = [
  { label: 'Our Platform', color: '#0F172A' },
  { label: 'Competitors', color: '#DC2626' },
  { label: 'Segments', color: '#059669' },
  { label: 'Policies', color: '#D97706' },
];

function MarketGraphCard({ entities, edges, selectedId, onSelectNode }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--text-primary, #0F172A)' }}
        >
          Market Relationship Map
        </h3>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {LEGEND_ITEMS.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--text-secondary, #64748B)' }}
            >
              <span
                className="inline-block shrink-0 rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: item.color,
                }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="relative h-[400px]">
        <GraphCanvas
          entities={entities}
          edges={edges}
          selectedId={selectedId}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );
}

export default MarketGraphCard;
