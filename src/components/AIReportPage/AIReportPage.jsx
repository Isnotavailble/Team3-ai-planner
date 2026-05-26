import React, { useState, useMemo } from 'react';
import { ArrowLeft, Play, Cpu, Crosshair, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

export default function AIReportPage({ onStartInterrogation }) {
  const navigate = useNavigate();
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

  const probabilityData = useMemo(() => {
    if (!verdictData || !verdictData.scenarios) return [];
    return verdictData.scenarios.map(sc => ({
      name: sc.title.split(' (')[0],
      Probability: sc.prob,
      strong: sc.strong
    }));
  }, [verdictData]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/workspace')}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-txt-tertiary hover:bg-surface-hover hover:text-txt-primary transition-colors shadow-sm bg-transparent cursor-pointer animate-fade-in"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-txt-primary flex items-center gap-2">
              <Cpu size={20} className="text-txt-primary" />
              AI Predictive Simulation
            </h1>
            <p className="text-xs mt-1 text-txt-tertiary">
              Run What-If scenarios using Swarm Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Setup & Logs */}
        <div className="w-full lg:w-[350px] space-y-6 shrink-0 animate-fade-in">
          <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-txt-primary" />
              Market Conditions
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-txt-secondary text-xs">Competitor Aggressiveness</span>
                  <span className="text-txt-primary font-semibold">{ratios.competitors}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={ratios.competitors}
                  onChange={(e) => setRatios({ ...ratios, competitors: parseInt(e.target.value) })}
                  className="w-full accent-txt-primary cursor-pointer"
                  disabled={stage !== 'setup'}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-txt-secondary text-xs">Retailer Engagement</span>
                  <span className="text-txt-primary font-semibold">{ratios.customers}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={ratios.customers}
                  onChange={(e) => setRatios({ ...ratios, customers: parseInt(e.target.value) })}
                  className="w-full accent-txt-primary cursor-pointer"
                  disabled={stage !== 'setup'}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-txt-secondary text-xs">Supply Chain Capacity</span>
                  <span className="text-txt-primary font-semibold">{ratios.distributors}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={ratios.distributors}
                  onChange={(e) => setRatios({ ...ratios, distributors: parseInt(e.target.value) })}
                  className="w-full accent-txt-primary cursor-pointer"
                  disabled={stage !== 'setup'}
                />
              </div>
            </div>

            {stage === 'setup' && (
              <button
                onClick={runSimulation}
                className="w-full mt-8 bg-txt-primary hover:bg-txt-primary/95 text-white py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm cursor-pointer border-none"
              >
                <Play size={14} fill="currentColor" /> Initialize Simulation
              </button>
            )}

            {stage === 'running' && (
              <div className="mt-8 space-y-4 animate-fade-in">
                <div className="flex justify-between text-xs font-medium text-txt-primary">
                  <span>Calculating probabilities...</span>
                  <span className="text-txt-primary font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-panel rounded-full overflow-hidden">
                  <div className="h-full bg-txt-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            
            {stage === 'results' && (
              <button
                onClick={() => setStage('setup')}
                className="w-full mt-8 bg-surface-card border border-border hover:bg-surface-hover text-txt-secondary py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                Reset Conditions
              </button>
            )}
          </div>

          {/* Logs Container (Premium style) */}
          {(stage === 'running' || stage === 'results') && (
            <div className="bg-slate-900 rounded-xl p-5 shadow-lg border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">System Logs</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-2 font-mono text-[11px] text-emerald-400 h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log, i) => (
                  <div key={i} className="animate-fade-in opacity-90 leading-relaxed">&gt; {log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Output */}
        <div className="flex-1 min-w-0">
          {stage === 'setup' || stage === 'running' ? (
            <div className="w-full h-[500px] bg-surface-card rounded-xl border border-border border-dashed flex flex-col items-center justify-center text-txt-tertiary shadow-sm transition-all duration-300">
              <Cpu size={36} className={`mb-6 text-txt-secondary transition-all duration-500 ${stage === 'running' ? 'animate-pulse opacity-80' : 'opacity-40'}`} />
              <p className="text-sm font-medium text-txt-secondary">
                {stage === 'setup' ? 'Configure parameters to run simulation' : 'Running swarm intelligence agents...'}
              </p>
              <p className="text-xs mt-2 max-w-sm text-center text-txt-tertiary px-4 leading-relaxed">
                The AI will generate probabilistic scenarios and uncover hidden market dynamics.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              
              {/* Verdict Summary (Compact Layout & Top-Right Button) */}
              <div className="bg-surface-card p-5 rounded-xl border border-border-light shadow-sm relative transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <Sparkles size={16} className="text-txt-primary mt-0.5 shrink-0 opacity-70 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-txt-secondary">
                          Simulation Verdict &middot; {Math.round(verdictData.confidence * 100)}% Confidence
                        </span>
                      </div>
                      <p className="text-[13px] text-txt-primary font-medium leading-relaxed pr-2">
                        {verdictData.verdict}
                      </p>
                    </div>
                  </div>
                  
                  {/* RESTORED: Consult Agents Button */}
                  <button
                    onClick={() => onStartInterrogation(verdictData.criticalAgents)}
                    className="shrink-0 self-start sm:self-auto bg-txt-primary hover:bg-txt-primary/95 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none flex items-center gap-1.5 duration-200"
                  >
                    <Sparkles size={12} className="opacity-90" />
                    Consult Agents
                  </button>
                </div>
              </div>

              {/* Charts & Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Probability Graph (Area Curve Layout) */}
                <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm flex flex-col lg:col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                    <Crosshair size={18} className="text-txt-primary opacity-80" />
                    <h3 className="text-sm font-semibold text-txt-primary">Scenario Probabilities Curve</h3>
                  </div>
                  
                  <div className="w-full h-[320px] min-h-[320px] mt-2">
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={probabilityData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 500 }} axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickMargin={10} />
                        <RechartsTooltip 
                          cursor={{ stroke: 'var(--border-default)', strokeWidth: 1, strokeDasharray: '4 4' }} 
                          formatter={(value) => `${value}%`} 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            fontSize: '12px', 
                            backgroundColor: 'var(--surface-card)', 
                            border: '1px solid var(--border-default)', 
                            color: 'var(--text-primary)', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' 
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Probability" 
                          stroke="var(--accent)" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorProb)" 
                          activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--surface-card)', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scenarios Breakdown (Text format) */}
                <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm lg:col-span-2">
                  <h3 className="text-sm font-semibold text-txt-primary mb-4">Evaluated Pathways</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {verdictData.scenarios.map((sc, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border transition-all flex flex-col ${sc.strong ? 'border-border bg-surface-active/40 shadow-sm' : 'border-border-light bg-surface-panel/60'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-txt-primary">{sc.title}</span>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${sc.strong ? 'bg-surface-active text-txt-primary border border-border' : 'bg-surface-panel text-txt-secondary border border-border-light'}`}>
                            {sc.prob}%
                          </span>
                        </div>
                        <p className="text-xs text-txt-secondary leading-relaxed flex-1">{sc.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Dynamics */}
              <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-sm font-semibold text-txt-primary mb-4">Key Market Dynamics Observed</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verdictData.dynamics.map((d, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-sm text-txt-secondary bg-surface-panel p-4 rounded-lg border border-border-light transition-all hover:bg-surface-hover/55">
                      <span className="w-1.5 h-1.5 rounded-full bg-txt-secondary/60 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}


