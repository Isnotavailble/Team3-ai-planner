import React, { useState } from 'react';
import { Network } from 'lucide-react';
import GraphCanvas from '../Graph/GraphCanvas';

const LEGEND_ITEMS = [
  { label: 'Our Platform', color: '#0F172A' },
  { label: 'Competitors', color: '#DC2626' },
  { label: 'Segments', color: '#059669' },
  { label: 'Policies', color: '#D97706' },
];

function MarketGraphCard({ entities, edges, selectedId, onSelectNode }) {
  const [showGraph, setShowGraph] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 shadow bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3
            className="text-base font-semibold flex items-center gap-2"
            style={{ color: 'var(--text-primary, #0F172A)' }}
          >
            Market Relationship Map
            <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
              DEV MODE
            </span>
          </h3>
        </div>

        {/* Legend */}
        {showGraph && (
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
        )}
      </div>

      {/* Content */}
      <div className="relative h-[400px]">
        {!showGraph ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-center p-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
              <Network size={28} />
            </div>
            <h4 className="text-gray-900 font-medium mb-1">Interactive Network Graph is Disabled</h4>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              The physics-based relationship graph requires high rendering resources and is optimized for developer inspection.
            </p>
            <button
              onClick={() => setShowGraph(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              Render Developer Graph
            </button>
          </div>
        ) : (
          <GraphCanvas
            entities={entities}
            edges={edges}
            selectedId={selectedId}
            onSelectNode={onSelectNode}
          />
        )}
      </div>
    </div>
  );
}

export default MarketGraphCard;
