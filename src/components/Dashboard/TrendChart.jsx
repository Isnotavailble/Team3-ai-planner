import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/* ── colour tokens (match CSS-variable palette) ─────────────────────── */
const COLORS = {
  retailers: '#059669', // --entity-segment  (emerald)
  orders: '#2E5C8A',    // --accent           (corporate blue)
  competitor: '#DC2626', // --entity-company   (red)
};

/* ── mock-data generator ─────────────────────────────────────────────── */
function buildMonthlyData(workspace) {
  // Derive a seed-ish baseline from workspace size so the numbers
  // feel loosely coupled to the loaded dataset.
  const entityCount = workspace?.entities?.length ?? 20;
  const edgeCount = workspace?.edges?.length ?? 15;

  const baseRetailers = Math.round(entityCount * 2.4);
  const baseOrders = Math.round(edgeCount * 18);
  const baseCompetitor = 42;

  const now = new Date();
  const months = [];

  for (let i = -5; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = d.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
    const projected = i > 0;
    const t = i + 5; // 0-based index for growth curve

    months.push({
      month: label,
      projected,
      'Retailers Active': Math.round(
        baseRetailers + t * 3.2 + (projected ? t * 1.5 : Math.sin(t) * 4)
      ),
      'Orders Volume': Math.round(
        baseOrders + t * 22 + (projected ? t * 12 : Math.cos(t) * 15)
      ),
      'Competitor Pressure': Math.round(
        baseCompetitor + t * 1.8 + (projected ? t * 2.6 : Math.sin(t * 0.7) * 3)
      ),
    });
  }

  return months;
}

/** Collapse months into quarters */
function toQuarterly(monthly) {
  const buckets = {};
  monthly.forEach((m) => {
    const [mon, yr] = m.month.split(' ');
    const qIndex =
      Math.floor(
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(mon) / 3
      ) + 1;
    const key = `Q${qIndex} '${yr}`;
    if (!buckets[key]) {
      buckets[key] = { month: key, projected: m.projected, _count: 0,
        'Retailers Active': 0, 'Orders Volume': 0, 'Competitor Pressure': 0 };
    }
    buckets[key]['Retailers Active'] += m['Retailers Active'];
    buckets[key]['Orders Volume'] += m['Orders Volume'];
    buckets[key]['Competitor Pressure'] += m['Competitor Pressure'];
    buckets[key]._count += 1;
    if (m.projected) buckets[key].projected = true;
  });

  return Object.values(buckets).map((b) => ({
    month: b.month,
    projected: b.projected,
    'Retailers Active': Math.round(b['Retailers Active'] / b._count),
    'Orders Volume': Math.round(b['Orders Volume'] / b._count),
    'Competitor Pressure': Math.round(b['Competitor Pressure'] / b._count),
  }));
}

/* ── custom Recharts tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const isProjected = payload[0]?.payload?.projected;

  // Deduplicate payload by name to fix the overlapping point bug (6 labels instead of 3)
  const uniquePayload = [];
  const seen = new Set();
  payload.forEach((entry) => {
    if (!seen.has(entry.name)) {
      seen.add(entry.name);
      uniquePayload.push(entry);
    }
  });

  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-default)',
        color: 'var(--text-primary)',
      }}
    >
      <p className="mb-1 font-semibold">
        {label}
        {isProjected && (
          <span
            className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            projected
          </span>
        )}
      </p>
      {uniquePayload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ── custom dot (hollow for projected points) ────────────────────────── */
function renderDot(color) {
  return function Dot(props) {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={payload.projected ? 'var(--surface-card)' : color}
        stroke={color}
        strokeWidth={1.5}
      />
    );
  };
}

/* ── main component ──────────────────────────────────────────────────── */
export default function TrendChart({ workspace = {} }) {
  const [view, setView] = useState('monthly'); // 'monthly' | 'quarterly'

  const monthlyData = useMemo(() => buildMonthlyData(workspace), [workspace]);
  const quarterlyData = useMemo(() => toQuarterly(monthlyData), [monthlyData]);

  const data = view === 'monthly' ? monthlyData : quarterlyData;

  /* Split data into historical + projected segments for dashed styling.
     Recharts doesn't natively support per-point dash arrays, so we render
     two <Line> elements per series: one for historical (solid) and one for
     projected (dashed). To make them join visually, the projected segment
     starts with the last historical point. */
  const lastHistIdx = data.findIndex((d) => d.projected) - 1;
  const historicalSlice = data.filter((_, i) => i <= Math.max(lastHistIdx, 0));
  const projectedSlice = data.filter(
    (_, i) => i >= Math.max(lastHistIdx, 0)
  );

  const SERIES = [
    { key: 'Retailers Active', color: COLORS.retailers },
    { key: 'Orders Volume', color: COLORS.orders },
    { key: 'Competitor Pressure', color: COLORS.competitor },
  ];

  return (
    <div
      className="rounded-xl border shadow-sm"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-light)',
      }}
    >
      {/* ── header ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: 'var(--border-light)' }}
      >
        <h3
          className="text-sm font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Market Trend Analysis
        </h3>

        <div
          className="inline-flex overflow-hidden rounded-lg border text-xs"
          style={{ borderColor: 'var(--border-default)' }}
        >
          {['monthly', 'quarterly'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 font-medium capitalize transition-colors"
              style={{
                background:
                  view === v ? 'var(--accent)' : 'var(--surface-card)',
                color:
                  view === v ? 'var(--text-inverse)' : 'var(--text-secondary)',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── chart ──────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
              axisLine={{ stroke: 'var(--border-default)' }}
              tickLine={false}
              allowDuplicatedCategory={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
            />

            {/* Historical lines (solid) */}
            {SERIES.map(({ key, color }) => (
              <Line
                key={`hist-${key}`}
                data={historicalSlice}
                dataKey={key}
                name={key}
                stroke={color}
                strokeWidth={2}
                dot={renderDot(color)}
                activeDot={{ r: 4, strokeWidth: 2 }}
                connectNulls
              />
            ))}

            {/* Projected lines (dashed) */}
            {SERIES.map(({ key, color }) => (
              <Line
                key={`proj-${key}`}
                data={projectedSlice}
                dataKey={key}
                name={key}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={renderDot(color)}
                activeDot={{ r: 4, strokeWidth: 2 }}
                legendType="none"
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
