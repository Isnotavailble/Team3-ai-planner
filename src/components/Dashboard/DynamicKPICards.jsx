import React, { useMemo } from 'react';
import { Store, GitBranch, Swords, FileSearch } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

function generateTrendData(base, points = 7) {
  const data = [];
  let value = base;
  for (let i = 0; i < points; i++) {
    value = Math.max(0, value + Math.round((Math.random() - 0.4) * (base * 0.15)));
    data.push({ v: value });
  }
  return data;
}

const KPI_CONFIG = [
  {
    key: 'activeRetailers',
    label: 'Active Retailers',
    icon: Store,
    accent: '#059669',
    compute: (ws) =>
      (ws.entities || []).filter((e) => e.type === 'organization').length,
  },
  {
    key: 'marketConnections',
    label: 'Market Connections',
    icon: GitBranch,
    accent: '#2E5C8A',
    compute: (ws) => (ws.edges || []).length,
  },
  {
    key: 'competitiveSignals',
    label: 'Competitive Signals',
    icon: Swords,
    accent: '#DC2626',
    compute: (ws) =>
      (ws.entities || []).filter((e) => e.type === 'company').length,
  },
  {
    key: 'intelligenceSources',
    label: 'Intelligence Sources',
    icon: FileSearch,
    accent: '#7C3AED',
    compute: (ws) => (ws.materials || []).length,
  },
];

function KPICard({ label, value, icon: Icon, accent, trendData }) {
  return (
    <div
      className="relative rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ backgroundColor: 'var(--surface-card, #ffffff)' }}
    >
      {/* Accent bar */}
      <div className="h-[3px] w-full" style={{ backgroundColor: accent }} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-secondary, #6b7280)' }}
          >
            {label}
          </span>
          <Icon size={18} style={{ color: accent }} strokeWidth={1.8} />
        </div>

        <div
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary, #111827)' }}
        >
          {value.toLocaleString()}
        </div>

        {/* Sparkline */}
        <div className="mt-3 -mx-1">
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={trendData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${accent.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accent}
                strokeWidth={1.5}
                fill={`url(#grad-${accent.replace('#', '')})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function DynamicKPICards({ workspace = {} }) {
  const metrics = useMemo(
    () =>
      KPI_CONFIG.map((cfg) => {
        const value = cfg.compute(workspace);
        return {
          ...cfg,
          value,
          trendData: generateTrendData(value || 1),
        };
      }),
    [workspace],
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <KPICard
          key={m.key}
          label={m.label}
          value={m.value}
          icon={m.icon}
          accent={m.accent}
          trendData={m.trendData}
        />
      ))}
    </div>
  );
}
