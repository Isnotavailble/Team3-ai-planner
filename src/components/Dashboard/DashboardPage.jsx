import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import DynamicKPICards from './DynamicKPICards';
import CategorizedMetrics from './CategorizedMetrics';
import TrendChart from './TrendChart';
import RecentSignals from './RecentSignals';
import MarketGraphCard from './MarketGraphCard';

export default function DashboardPage({ workspace, businessProfile, selectedNodeId, handleSelectNode }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Strategic Dashboard
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Market intelligence overview · Updated just now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/workspace/predict')}
            className="flex items-center gap-1.5 border-none rounded-lg cursor-pointer text-xs font-medium px-4 py-2 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            <Play size={12} fill="currentColor" /> Run Prediction
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <DynamicKPICards workspace={workspace} />

      {/* Categorized Metrics */}
      {businessProfile && (
        <CategorizedMetrics profile={businessProfile} />
      )}

      {/* Two-column layout: Trend Chart + Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <TrendChart workspace={workspace} />
        </div>
        <div className="lg:col-span-2">
          <RecentSignals materials={workspace.materials} />
        </div>
      </div>

      {/* Market Graph Card */}
      <MarketGraphCard
        entities={workspace.entities}
        edges={workspace.edges}
        selectedId={selectedNodeId}
        onSelectNode={handleSelectNode}
      />
    </div>
  );
}
