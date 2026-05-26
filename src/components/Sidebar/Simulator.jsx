import React, { useState } from 'react';
import { X, Play, Cpu } from 'lucide-react';
import api from '../../services/api';

export default function Simulator({
  onClose,
  onStartInterrogation
}) {
  const [stage, setStage] = useState('setup'); // 'setup' | 'running' | 'results'
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [ratios, setRatios] = useState({
    competitors: 50,
    customers: 70,
    distributors: 40
  });
  const [verdictData, setVerdictData] = useState(null);

  const runSimulation = async () => {
    setStage('running');
    setLogs([]);
    setProgress(0);

    const totalRounds = 8;
    const mockLogs = [
      'Round 1: Initializing merchant swarm agents (40 agents)...',
      'Round 2: Competitors assessing retail order volumes...',
      'Round 3: Shopkeepers requesting digital credit limit terms...',
      'Round 4: Competitor launching matching credit programs...',
      'Round 5: Coalition forming: 3 competitor partners matching term limits...',
      'Round 6: Retailer agents showing high migration to credit programs...',
      'Round 7: Wholesale suppliers adjusting credit lines...',
      'Round 8: Completing scenario analysis and compiling B2B verdict report...'
    ];

    for (let i = 0; i < totalRounds; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setLogs(prev => [...prev, mockLogs[i]]);
      setProgress(((i + 1) / totalRounds) * 100);
    }

    const result = await api.runSimulation('main', ratios);
    setVerdictData(result);
    setStage('results');
  };

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
        <div className="flex items-center gap-2">
          <Cpu size={16} color="var(--text-secondary)" />
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Predict Possibility
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

      {/* Body */}
      <div className="scrollable" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {stage === 'setup' && (
          <div className="flex flex-col gap-5">
            {/* Parameter Sliders */}
            <div className="flex flex-col gap-6">
              <div style={{ marginBottom: '-2px' }}>
                <h3 className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                  MARKET CONDITIONS (WHAT-IF)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Adjust the percentages below to set the environment for this prediction.
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                  <span>COMPETITOR AGGRESSIVENESS</span>
                  <span className="mono" style={{ color: 'var(--text-secondary)' }}>{ratios.competitors}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={ratios.competitors}
                  onChange={(e) => setRatios({ ...ratios, competitors: parseInt(e.target.value) })}
                  style={{ accentColor: 'var(--text-primary)' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4, marginTop: '4px' }}>
                  Higher % simulates competitors launching aggressive campaigns.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                  <span>RETAILER SHOP ENGAGEMENT</span>
                  <span className="mono" style={{ color: 'var(--text-secondary)' }}>{ratios.customers}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={ratios.customers}
                  onChange={(e) => setRatios({ ...ratios, customers: parseInt(e.target.value) })}
                  style={{ accentColor: 'var(--text-primary)' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4, marginTop: '4px' }}>
                  Higher % simulates a booming market where shops are actively buying.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between" style={{ fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                  <span>WHOLESALE SUPPLY CAPACITY</span>
                  <span className="mono" style={{ color: 'var(--text-secondary)' }}>{ratios.distributors}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={ratios.distributors}
                  onChange={(e) => setRatios({ ...ratios, distributors: parseInt(e.target.value) })}
                  style={{ accentColor: 'var(--text-primary)' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4, marginTop: '4px' }}>
                  Lower % simulates supply chain shortages from major distributors.
                </p>
              </div>
            </div>

            <button
              onClick={runSimulation}
              style={{
                background: 'var(--text-primary)', color: 'var(--text-inverse)',
                border: 'none', borderRadius: '6px', height: '38px', fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginTop: '12px'
              }}
            >
              <Play size={14} fill="currentColor" /> Predict Possibility
            </button>
          </div>
        )}

        {stage === 'running' && (
          <div className="flex flex-col gap-4" style={{ height: '100%' }}>
            <div style={{
              background: 'var(--surface-panel)', border: '1px solid var(--border-light)',
              borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                ROUND STEPS IN PROGRESS
              </div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Calculating merchant responses...
              </div>
              <div style={{
                width: '100%', height: '4px', background: 'var(--surface-active)',
                borderRadius: '2px', overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`, height: '100%', background: 'var(--text-primary)',
                  transition: 'width 0.2s ease-out'
                }} />
              </div>
            </div>

            <div className="mono scrollable" style={{
              background: 'var(--surface-panel)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', borderRadius: '6px',
              padding: '16px', height: '220px', fontSize: '11px', display: 'flex',
              flexDirection: 'column', gap: '8px', lineHeight: 1.5
            }}>
              {logs.map((log, idx) => (
                <div key={idx} className="animate-fade-in">&gt; {log}</div>
              ))}
            </div>
          </div>
        )}

        {stage === 'results' && verdictData && (
          <div className="flex flex-col gap-5">
            <div style={{
              borderLeft: '3px solid var(--accent)', paddingLeft: '12px',
              margin: '4px 0'
            }}>
              <div className="mono" style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: 600 }}>
                SIMULATION VERDICT ({Math.round(verdictData.confidence * 100)}% CONFIDENCE)
              </div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '8px', lineHeight: 1.6 }}>
                {verdictData.verdict}
              </p>
            </div>

            <div>
              <h3 className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                SCENARIOS EVALUATED
              </h3>
              <div className="flex flex-col gap-4">
                {verdictData.scenarios.map((sc, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: sc.strong ? '1px solid var(--accent-border)' : '1px solid var(--border-light)',
                      borderRadius: '4px', padding: '16px',
                      background: sc.strong ? 'var(--accent-soft)' : 'var(--surface-card)'
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ fontWeight: 600, fontSize: '12px' }}>
                      <span style={{ color: sc.strong ? 'var(--accent)' : 'var(--text-primary)' }}>{sc.title}</span>
                      <span className="mono">{sc.prob}%</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
                      {sc.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                KEY DYNAMICS OBSERVED
              </h3>
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {verdictData.dynamics.map((d, idx) => (
                  <li key={idx} style={{ lineHeight: 1.45 }}>{d}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onStartInterrogation(verdictData.criticalAgents)}
              style={{
                background: 'var(--text-primary)', color: 'var(--text-inverse)',
                border: 'none', borderRadius: '6px', height: '40px', fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginTop: '8px'
              }}
            >
              Interrogate Agents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
