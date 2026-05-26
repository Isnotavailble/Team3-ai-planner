import React, { useState, useMemo } from 'react';
import { ArrowLeft, Play, Cpu, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
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
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-900 transition-colors shadow-sm bg-transparent cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <Cpu size={20} className="text-blue-600" />
              AI Predictive Simulation
            </h1>
            <p className="text-xs mt-1 text-gray-500">
              Run What-If scenarios using Swarm Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Setup & Logs */}
        <div className="w-full lg:w-[350px] space-y-6 shrink-0">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Market Conditions
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700">Competitor Aggressiveness</span>
                  <span className="text-blue-600">{ratios.competitors}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={ratios.competitors}
                  onChange={(e) => setRatios({ ...ratios, competitors: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                  disabled={stage !== 'setup'}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700">Retailer Engagement</span>
                  <span className="text-blue-600">{ratios.customers}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={ratios.customers}
                  onChange={(e) => setRatios({ ...ratios, customers: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                  disabled={stage !== 'setup'}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700">Supply Chain Capacity</span>
                  <span className="text-blue-600">{ratios.distributors}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={ratios.distributors}
                  onChange={(e) => setRatios({ ...ratios, distributors: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                  disabled={stage !== 'setup'}
                />
              </div>
            </div>

            {stage === 'setup' && (
              <button
                onClick={runSimulation}
                className="w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-colors shadow-sm cursor-pointer border-none"
              >
                <Play size={14} fill="currentColor" /> Initialize Simulation
              </button>
            )}

            {stage === 'running' && (
              <div className="mt-8 space-y-4">
                <div className="flex justify-between text-xs font-medium text-gray-900">
                  <span>Calculating probabilities...</span>
                  <span className="text-blue-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            
            {stage === 'results' && (
              <button
                onClick={() => setStage('setup')}
                className="w-full mt-8 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
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
            <div className="w-full h-[500px] bg-white rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-gray-400 shadow-sm">
              <div className={`w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 ${stage === 'running' ? 'animate-pulse' : ''}`}>
                <Cpu size={32} className={stage === 'running' ? 'text-blue-500' : 'text-gray-300'} />
              </div>
              <p className="text-sm font-medium text-gray-600">
                {stage === 'setup' ? 'Configure parameters to run simulation' : 'Running swarm intelligence agents...'}
              </p>
              <p className="text-xs mt-2 max-w-sm text-center">
                The AI will generate probabilistic scenarios and uncover hidden market dynamics.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              
              {/* Verdict Summary */}
              <div className="bg-white p-6 lg:p-8 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <div className="flex-1">
                  <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                    Simulation Verdict • {Math.round(verdictData.confidence * 100)}% Confidence
                  </h2>
                  <p className="text-base text-gray-900 font-medium leading-relaxed">
                    {verdictData.verdict}
                  </p>
                </div>
                
                {/* RESTORED: Interrogate Agents Button */}
                <div className="shrink-0">
                  <button
                    onClick={() => onStartInterrogation(verdictData.criticalAgents)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200 cursor-pointer border-none flex items-center gap-2"
                  >
                    Interrogate Agents
                  </button>
                </div>
              </div>

              {/* Charts & Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Probability Graph (Fixed Layout) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <Crosshair size={18} className="text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Scenario Probabilities</h3>
                  </div>
                  
                  {/* Note: Adjusted left margin to 140 to prevent long text clipping */}
                  <div className="flex-1 h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={probabilityData} margin={{ top: 0, right: 30, left: 140, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `${value}%`} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="Probability" radius={[0, 4, 4, 0]} barSize={24}>
                          {probabilityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.strong ? '#3b82f6' : '#94a3b8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scenarios Breakdown (Text format) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Evaluated Pathways</h3>
                  {verdictData.scenarios.map((sc, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${sc.strong ? 'border-blue-100 bg-blue-50/50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-semibold ${sc.strong ? 'text-blue-800' : 'text-gray-700'}`}>{sc.title}</span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${sc.strong ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                          {sc.prob}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{sc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Dynamics */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Market Dynamics Observed</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verdictData.dynamics.map((d, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-sm text-gray-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
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
