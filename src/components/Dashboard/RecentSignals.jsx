import React from 'react';
import {
  FileText,
  AlertTriangle,
  Newspaper,
  Globe,
  TrendingUp,
  MessageSquare,
  Layers,
} from 'lucide-react';

const TYPE_CONFIG = {
  'News Leak': {
    icon: AlertTriangle,
    color: '#EA580C',
    bg: 'rgba(234, 88, 12, 0.08)',
  },
  Newsletter: {
    icon: Newspaper,
    color: '#2563EB',
    bg: 'rgba(37, 99, 235, 0.08)',
  },
  'Web Article': {
    icon: Globe,
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
  },
  'Market Report': {
    icon: TrendingUp,
    color: '#7C3AED',
    bg: 'rgba(124, 58, 237, 0.08)',
  },
  'Social Post': {
    icon: MessageSquare,
    color: '#E11D48',
    bg: 'rgba(225, 29, 72, 0.08)',
  },
};

const DEFAULT_TYPE_CONFIG = {
  icon: Layers,
  color: 'var(--text-tertiary)',
  bg: 'rgba(142, 141, 136, 0.08)',
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || DEFAULT_TYPE_CONFIG;
}

export default function RecentSignals({ materials = [] }) {
  return (
    <div
      className="rounded-xl border shadow"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <FileText size={16} style={{ color: 'var(--text-tertiary)' }} />
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          Recent Intelligence
        </h3>
      </div>

      {/* Signal list */}
      <div>
        {materials.length === 0 ? (
          <div
            className="flex items-center justify-center py-10 text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            No intelligence signals yet.
          </div>
        ) : (
          materials.map((item, index) => {
            const config = getTypeConfig(item.type);
            const Icon = config.icon;
            const entityCount = Array.isArray(item.extracted)
              ? item.extracted.length
              : 0;
            const isLast = index === materials.length - 1;

            return (
              <div
                key={item.id ?? index}
                className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 cursor-default"
                style={{
                  borderBottom: isLast
                    ? 'none'
                    : '1px solid var(--border-light)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Type icon badge */}
                <div
                  className="flex items-center justify-center rounded-md shrink-0"
                  style={{
                    width: 30,
                    height: 30,
                    background: config.bg,
                    color: config.color,
                  }}
                >
                  <Icon size={14} />
                </div>

                {/* Title + source */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.title}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {item.source}
                  </div>
                </div>

                {/* Entity count badge */}
                {entityCount > 0 && (
                  <span
                    className="text-xs font-medium shrink-0 rounded-full px-2 py-0.5"
                    style={{
                      background: 'var(--surface-active)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {entityCount} {entityCount === 1 ? 'entity' : 'entities'}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
