import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Translate developer-centric keys to user-friendly business terms
const FRIENDLY_TYPES = {
  you: 'Our Platform',
  company: 'Competitor App',
  segment: 'Market Segment',
  policy: 'Market Rule',
  concept: 'Market Need',
  event: 'Market Event',
  product: 'Product Feature',
  organization: 'Retail Shop Account'
};

const FRIENDLY_EDGES = {
  selling_to: 'Selling to',
  competing_for_shops: 'Competing for shops',
  feature_of: 'Feature of',
  retailer: 'Retailer',
  buys_from: 'Buys from',
  partners_with: 'Partners with',
  offers_product: 'Offers product',
  developing: 'Developing',
  addresses_need: 'Addresses need',
  orders_on: 'Orders on'
};

const TYPE_COLORS = {
  you: 'var(--entity-you)',
  company: 'var(--entity-company)',
  segment: 'var(--entity-segment)',
  policy: 'var(--entity-policy)',
  concept: 'var(--entity-concept)',
  event: 'var(--entity-event)',
  product: 'var(--entity-product)',
  organization: 'var(--entity-segment)' // uses segment color
};

export default function GraphCanvas({
  entities,
  edges,
  selectedId,
  onSelectNode
}) {
  const svgRef = useRef(null);
  
  // Stable zoom and pan state
  const [pan, setPan] = useState({ x: -100, y: -80 });
  const [zoom, setZoom] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Spring physics nodes coordinate simulation state
  const [nodePositions, setNodePositions] = useState({});

  useEffect(() => {
    const positions = {};
    
    // Set base positions (carefully calibrated for B2B dataset)
    entities.forEach(node => {
      positions[node.id] = {
        x: node.x || 720,
        y: node.y || 470,
        vx: 0,
        vy: 0
      };
    });

    const kAttract = 0.02;
    const kRepel = 4000;
    const damping = 0.85;

    // Run 100 ticks of spring correction to separate overlapping nodes
    for (let tick = 0; tick < 100; tick++) {
      entities.forEach((n1, i) => {
        entities.forEach((n2, j) => {
          if (i >= j) return;
          const pos1 = positions[n1.id];
          const pos2 = positions[n2.id];
          if (!pos1 || !pos2) return;
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);
          
          if (dist < 300) {
            const force = kRepel / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            pos1.vx += fx;
            pos1.vy += fy;
            pos2.vx -= fx;
            pos2.vy -= fy;
          }
        });
      });

      edges.forEach(edge => {
        const posA = positions[edge.a];
        const posB = positions[edge.b];
        if (!posA || !posB) return;

        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const targetDist = 200;
        const force = (dist - targetDist) * kAttract;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        posA.vx -= fx;
        posA.vy -= fy;
        posB.vx += fx;
        posB.vy += fy;
      });

      entities.forEach(node => {
        const pos = positions[node.id];
        if (!pos) return;
        // Keep shwezay center anchored
        if (node.id === 'shwezay') {
          pos.vx = 0;
          pos.vy = 0;
          return;
        }
        pos.x += pos.vx;
        pos.y += pos.vy;
        pos.vx *= damping;
        pos.vy *= damping;
      });
    }

    setNodePositions(positions);
  }, [entities, edges]);

  // Pre-process edges to handle overlapping curves
  const renderEdges = useMemo(() => {
    const edgeGroups = {};
    edges.forEach((edge, idx) => {
      // Create a consistent key regardless of direction
      const key = [edge.a, edge.b].sort().join('-');
      if (!edgeGroups[key]) edgeGroups[key] = [];
      edgeGroups[key].push({ ...edge, originalIndex: idx });
    });

    const result = [];
    Object.values(edgeGroups).forEach(group => {
      const total = group.length;
      group.forEach((edge, i) => {
        let offsetIdx = 0;
        if (total > 1) {
          offsetIdx = i - (total - 1) / 2;
        }
        // If direction is reversed relative to sorted key, flip the curve
        const isReversed = edge.a > edge.b;
        const curveOffset = offsetIdx * 40 * (isReversed ? -1 : 1);
        result.push({ ...edge, curveOffset });
      });
    });
    return result;
  }, [edges]);

  // Click-isolation dimming:
  // Instead of hiding, clicking a node makes everything else dim (opacity: 0.12).
  const isSelectedActive = !!selectedId;
  const connectedNodeIds = new Set();
  
  if (isSelectedActive) {
    connectedNodeIds.add(selectedId);
    edges.forEach(e => {
      if (e.a === selectedId) connectedNodeIds.add(e.b);
      if (e.b === selectedId) connectedNodeIds.add(e.a);
    });
  }

  // Handle Dragging
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom(z => Math.min(z * 1.2, 3));
  const zoomOut = () => setZoom(z => Math.max(z / 1.2, 0.3));
  const resetZoom = () => {
    setPan({ x: -100, y: -80 });
    setZoom(0.8);
  };

  const gridLinePattern = 'none';

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden',
      cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none',
      backgroundColor: 'var(--surface-page)'
    }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '24px', display: 'flex', gap: '4px',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
        borderRadius: '6px', padding: '4px', zIndex: 5
      }}>
        <button onClick={zoomIn} style={ctrlBtnStyle}>+</button>
        <button onClick={zoomOut} style={ctrlBtnStyle}>-</button>
        <button onClick={resetZoom} style={{ ...ctrlBtnStyle, fontSize: '11px', padding: '0 8px' }}>Fit</button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--border-light)"
              strokeWidth="0.8"
              strokeDasharray={gridLinePattern}
            />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          <g>
            {renderEdges.map((edge, idx) => {
              const posA = nodePositions[edge.a];
              const posB = nodePositions[edge.b];
              if (!posA || !posB) return null;

              // Check if connection is relevant to active node selection
              const isRelevant = !isSelectedActive || edge.a === selectedId || edge.b === selectedId;
              const linkOpacity = isRelevant ? 0.8 : 0.08;

              let strokeColor = 'var(--border-dark)';
              let strokeWidth = '1';
              let isDashed = false;

              if (edge.kind === 'strong') {
                strokeColor = 'var(--text-primary)';
                strokeWidth = '1.5';
                isDashed = false;
              } else if (edge.kind === 'tension') {
                strokeColor = 'var(--text-secondary)';
                strokeWidth = '1.5';
                isDashed = true;
              } else if (edge.kind === 'quiet') {
                strokeColor = 'var(--border-default)';
              }

              // Translate developer edge key to B2B user-friendly text
              const displayLabel = FRIENDLY_EDGES[edge.label] || edge.label;

              // Calculate curve
              const dx = posB.x - posA.x;
              const dy = posB.y - posA.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = -dy / dist;
              const ny = dx / dist;

              const offset = edge.curveOffset || 0;
              
              // Control point for Q bezier (multiply by 2 so apex hits offset exactly)
              const cx = (posA.x + posB.x) / 2 + nx * offset * 2;
              const cy = (posA.y + posB.y) / 2 + ny * offset * 2;
              
              // Text position at apex of curve
              const textX = (posA.x + posB.x) / 2 + nx * offset;
              const textY = (posA.y + posB.y) / 2 + ny * offset - 4;

              const pathD = offset === 0 
                ? `M ${posA.x} ${posA.y} L ${posB.x} ${posB.y}`
                : `M ${posA.x} ${posA.y} Q ${cx} ${cy} ${posB.x} ${posB.y}`;

              return (
                <g key={`edge-${edge.originalIndex || idx}`}>
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isDashed ? '4,4' : 'none'}
                    animate={{ opacity: linkOpacity }}
                    transition={{ duration: 0.2 }}
                  />
                  {isRelevant && (
                    <motion.text
                      x={textX}
                      y={textY}
                      fill="var(--text-tertiary)"
                      fontSize="9px"
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                      animate={{ opacity: linkOpacity }}
                      style={{
                        paintOrder: 'stroke fill',
                        stroke: 'var(--surface-page)',
                        strokeWidth: '4px',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                      }}
                    >
                      {displayLabel}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {entities.map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedId === node.id;
              const isDimmed = isSelectedActive && !connectedNodeIds.has(node.id);
              
              // Spring values for sizes
              const size = node.id === 'shwezay' ? 24 : 16;
              const color = TYPE_COLORS[node.type] || 'var(--entity-concept)';
              const nodeOpacity = isDimmed ? 0.12 : 1;

              const displayBorder = 'none';

              return (
                <g
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer selection ring */}
                  {isSelected && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size + 6}
                      fill="none"
                      stroke="var(--text-primary)"
                      strokeWidth="1.5"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  )}

                  {/* Core node dot */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size}
                    fill={color}
                    stroke="var(--surface-card)"
                    strokeWidth="2"
                    strokeDasharray={displayBorder}
                    animate={{
                      scale: isSelected ? 1.12 : 1,
                      opacity: nodeOpacity
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />

                  {/* Node label */}
                  <motion.text
                    x={pos.x}
                    y={pos.y + size + 14}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize="11px"
                    fontWeight={isSelected ? 600 : 500}
                    fontFamily="var(--font-sans)"
                    animate={{ opacity: nodeOpacity }}
                    style={{
                      paintOrder: 'stroke fill',
                      stroke: 'var(--surface-page)',
                      strokeWidth: '4px',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round'
                    }}
                  >
                    {node.name}
                  </motion.text>

                  {/* User-friendly translated category tags */}
                  <motion.text
                    x={pos.x}
                    y={pos.y + size + 24}
                    textAnchor="middle"
                    fill="var(--text-tertiary)"
                    fontSize="8px"
                    fontFamily="var(--font-mono)"
                    animate={{ opacity: nodeOpacity }}
                    style={{
                      paintOrder: 'stroke fill',
                      stroke: 'var(--surface-page)',
                      strokeWidth: '3px',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round'
                    }}
                  >
                    {FRIENDLY_TYPES[node.type]?.toUpperCase() || node.type.toUpperCase()}
                  </motion.text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Floating Instructions */}
      <div style={{
        position: 'absolute', top: '24px', left: '24px', display: 'flex', flexDirection: 'column', gap: '4px',
        pointerEvents: 'none'
      }}>
        <div style={{
          background: 'rgba(252,252,250,0.9)', backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-default)', borderRadius: '4px', padding: '6px 12px',
          fontSize: '11px', color: 'var(--text-secondary)'
        }}>
          💡 Click a node to **focus relationships**. Unselected nodes will dim.
        </div>
      </div>
    </div>
  );
}

const ctrlBtnStyle = {
  width: '28px', height: '28px', border: 'none', background: 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
  cursor: 'pointer', borderRadius: '4px', color: 'var(--text-secondary)',
  transition: 'background 0.1s ease',
  outline: 'none'
};
