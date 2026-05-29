import React, { useState, useMemo } from 'react';
import { ArrowLeft, Play, Cpu, Crosshair, Sparkles, TrendingUp, Lightbulb, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import SimulationSkeleton from './SimulationSkeleton';

export default function AIReportPage({ onStartInterrogation, businessProfile = {} }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState('setup'); // 'setup' | 'running' | 'results'
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [ratios, setRatios] = useState({
    competitors: 50,
    customers: 70,
    distributors: 40
  });
  const [verdictData, setVerdictData] = useState(null);
  const [simulationData, setSimulationData] = useState([]);
  
  // Toggles for the 5 projection lines
  const [visibleLines, setVisibleLines] = useState({
    profit: true,
    marketShare: true,
    revenue: false,
    expenses: false,
    customers: false
  });

  const hasRivals = businessProfile?.rivals && businessProfile.rivals.length > 0;

  const runSimulation = async () => {
    setStage('running');
    setLogs([]);
    setProgress(0);
    setError(null);

    const totalRounds = 8;
    const mockLogs = [
      'Round 1: Initializing merchant swarm agents (40 agents)...',
      'Round 2: Competitors assessing retail order volumes...',
      'Round 3: Shopkeepers requesting credit terms...',
      'Round 4: Competitor launching matching pricing campaigns...',
      'Round 5: Coalition forming: 3 competitor partners matching inventory...',
      'Round 6: Retailer agents showing high migration to credit programs...',
      'Round 7: Wholesale suppliers adjusting operational costs...',
      'Round 8: Completing scenario analysis and compiling profit verdict report...'
    ];

    for (let i = 0; i < totalRounds; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setLogs(prev => [...prev, mockLogs[i]]);
      setProgress(((i + 1) / totalRounds) * 100);
    }

    try {
      const result = await api.runSimulation('main', ratios);
      
      // Calculate profit and market share projections mathematically
      const monthlySales = businessProfile?.sales?.monthly || 
                           (businessProfile?.sales?.daily ? businessProfile.sales.daily * 30 : 0) || 
                           (businessProfile?.sales?.weekly ? (businessProfile.sales.weekly / 7) * 30 : 0) || 
                           (businessProfile?.sales?.yearly ? businessProfile.sales.yearly / 12 : 0) || 
                           12000;
      const monthlyExpenses = businessProfile?.expenses ?? 8000;

      const compRatio = hasRivals ? (ratios.competitors / 100) : 0.7; // default to 70% baseline risk if no rivals specified
      const custRatio = ratios.customers / 100;
      const distRatio = ratios.distributors / 100;

      const points = [];
      const scenario = businessProfile?.targetScenario || 'Competitor Price Cut';

      for (let step = 1; step <= 6; step++) {
        let revenue = monthlySales;
        let expenses = monthlyExpenses;
        let marketShare = 65;
        let customers = 180;

        if (scenario.includes('Price') || scenario.includes('Cut')) {
          marketShare -= step * (compRatio * 5);
          revenue -= step * (compRatio * (monthlySales * 0.04));
          customers -= step * (compRatio * 10);
        } else if (scenario.includes('Credit') || scenario.includes('Demand')) {
          revenue += step * (custRatio * (monthlySales * 0.02));
          expenses += step * (custRatio * (monthlyExpenses * 0.05));
          marketShare += step * (custRatio * 1.5);
        } else if (scenario.includes('Chain') || scenario.includes('Inflation') || scenario.includes('Shortage')) {
          expenses += step * ((1 - distRatio) * (monthlyExpenses * 0.08));
          marketShare -= step * 0.8;
        } else {
          revenue += step * (custRatio * (monthlySales * 0.015)) - step * (compRatio * (monthlySales * 0.01));
        }

        const profit = revenue - expenses;

        points.push({
          name: `Month ${step}`,
          profit: Math.round(profit),
          marketShare: Math.round(Math.max(0, Math.min(100, marketShare))),
          revenue: Math.round(revenue),
          expenses: Math.round(expenses),
          customers: Math.round(Math.max(0, customers))
        });
      }

      setSimulationData(points);
      
      // Customize verdict based on user scenario
      const customVerdict = {
        ...result,
        verdict: `Based on your average sales of $${monthlySales.toLocaleString()} and outcomes of $${monthlyExpenses.toLocaleString()}, simulating "${scenario}" reveals a ${result.confidence > 0.8 ? 'strong' : 'moderate'} financial trend. Profit projection will decrease to $${points[5].profit.toLocaleString()} by Month 6, leading to ${businessProfile.expectedResult || 'Less Profit'} matching your expectations.`,
        aiInsights: [
          {
            id: 'income',
            title: 'ဝင်ငွေနှင့် ခန့်မှန်းချက်',
            subtitle: 'Income and Prediction',
            icon: TrendingUp,
            blocks: [
              "ရက် ၇ နှင့် ၇ ရက် ခန့်မှန်းချက် (7 days and 7 days prediction)",
              "Next week's revenue is expected to drop by 4% due to competitor pricing.",
              "Consider offering a short-term discount to maintain volume."
            ]
          },
          {
            id: 'swot',
            title: 'SWOT သုံးသပ်ချက်',
            subtitle: 'SWOT Analysis',
            icon: Lightbulb,
            blocks: [
              "အားသာ 3 • အားနည်း 3 • အခွင့်အလမ်း 3 • ခြိမ်းခြောက် 3",
              "Strength: Core customer loyalty remains high.",
              "Threat: Immediate risk from new supply chain disruptions."
            ]
          },
          {
            id: 'segments',
            title: 'ဖောက်သည် အုပ်စုများ',
            subtitle: 'Customer Segments',
            icon: Users,
            blocks: [
              "အုပ်စု 1 ခု (1 segment)",
              "Focus specifically on wholesale buyers who are price-sensitive.",
              "Avoid broad marketing; target direct SMS campaigns."
            ]
          },
          {
            id: 'suggestions',
            title: 'AI အကြံပြုချက်များ',
            subtitle: 'AI Suggestions',
            icon: Sparkles,
            blocks: [
              "ပရိုမိုးရှင်း • ကုန်ပစ္စည်း • ဈေးနှုန်း • ကြီးထွားရေး",
              "Product Strategy: bundle slow-moving items with high-demand goods.",
              "Pricing Strategy: match competitor prices but reduce payment terms."
            ]
          }
        ]
      };
      
      setVerdictData(customVerdict);
      setStage('results');
    } catch (err) {
      console.error(err);
      setError("Failed to run the predictive simulation. Please verify your connection or parameters and try again.");
      setStage('setup');
    }
  };

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

      {/* Error Message Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0 animate-pulse" />
          {error}
        </div>
      )}

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
              
              {/* Competitor Aggressiveness (only show if rivals exist) */}
              {hasRivals ? (
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
              ) : (
                <div className="bg-surface-panel/40 border border-border-light rounded-lg p-3 text-[11px] text-txt-secondary">
                  <strong>No competitors defined</strong>. The simulation will run with a default baseline competitor risk of 70%.
                </div>
              )}

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
              <div className="mt-8 space-y-4 animate-pulse">
                <div className="text-xs font-semibold text-txt-secondary text-center">
                  Swarm Intelligence calculating...
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

          {/* Logs Container */}
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
        <div className="flex-1 min-w-0 overflow-hidden">
          {stage === 'setup' && (
            <div className="w-full h-[500px] bg-surface-card rounded-xl border border-border border-dashed flex flex-col items-center justify-center text-txt-tertiary shadow-sm transition-all duration-300">
              <Cpu size={36} className="mb-6 text-txt-secondary opacity-40" />
              <p className="text-sm font-medium text-txt-secondary">
                Configure parameters to run simulation
              </p>
              <p className="text-xs mt-2 max-w-sm text-center text-txt-tertiary px-4 leading-relaxed">
                The AI will generate probabilistic scenarios and uncover profit projections.
              </p>
            </div>
          )}

          {stage === 'running' && (
            <SimulationSkeleton />
          )}

          {stage === 'results' && verdictData && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Verdict Summary */}
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
                  
                  <button
                    onClick={() => onStartInterrogation(verdictData.criticalAgents)}
                    className="shrink-0 self-start sm:self-auto bg-txt-primary hover:bg-txt-primary/95 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none flex items-center gap-1.5 duration-200"
                  >
                    <Sparkles size={12} className="opacity-90" />
                    Consult Agents
                  </button>
                </div>
              </div>

              {/* Multi-Line Projection Chart */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-surface-card p-6 rounded-xl border border-border shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <Crosshair size={18} className="text-txt-primary opacity-80" />
                    <h3 className="text-sm font-semibold text-txt-primary">Market Gain & Profit Projections</h3>
                  </div>
                  
                  {/* Projection Chart Container */}
                  <div className="w-full h-[320px] min-h-[320px] mt-2">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={simulationData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            fontSize: '12px', 
                            backgroundColor: 'var(--surface-card)', 
                            border: '1px solid var(--border-default)', 
                            color: 'var(--text-primary)' 
                          }} 
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        
                        {visibleLines.profit && <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#10b981" name="Net Profit ($)" strokeWidth={2.5} dot={{ r: 4 }} />}
                        {visibleLines.marketShare && <Line yAxisId="right" type="monotone" dataKey="marketShare" stroke="#3b82f6" name="Market Share (%)" strokeWidth={2.5} dot={{ r: 4 }} />}
                        {visibleLines.revenue && <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#0284c7" name="Total Revenue ($)" strokeWidth={1.5} dot={{ r: 3 }} />}
                        {visibleLines.expenses && <Line yAxisId="left" type="monotone" dataKey="expenses" stroke="#ef4444" name="Operating Expenses ($)" strokeWidth={1.5} dot={{ r: 3 }} />}
                        {visibleLines.customers && <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#8b5cf6" name="Customer Count" strokeWidth={1.5} dot={{ r: 3 }} />}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 5 Toggle Lines Checkboxes */}
                  <div className="flex flex-wrap gap-4 justify-center py-4 border-t border-border-light bg-surface-panel/30 rounded-b-xl mt-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-txt-primary">
                      <input
                        type="checkbox"
                        checked={visibleLines.profit}
                        onChange={() => setVisibleLines(prev => ({ ...prev, profit: !prev.profit }))}
                        className="accent-emerald-600 rounded cursor-pointer"
                      />
                      Net Profit ($)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-txt-primary">
                      <input
                        type="checkbox"
                        checked={visibleLines.marketShare}
                        onChange={() => setVisibleLines(prev => ({ ...prev, marketShare: !prev.marketShare }))}
                        className="accent-blue-600 rounded cursor-pointer"
                      />
                      Market Share (%)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-txt-primary">
                      <input
                        type="checkbox"
                        checked={visibleLines.revenue}
                        onChange={() => setVisibleLines(prev => ({ ...prev, revenue: !prev.revenue }))}
                        className="accent-sky-600 rounded cursor-pointer"
                      />
                      Total Revenue ($)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-txt-primary">
                      <input
                        type="checkbox"
                        checked={visibleLines.expenses}
                        onChange={() => setVisibleLines(prev => ({ ...prev, expenses: !prev.expenses }))}
                        className="accent-red-600 rounded cursor-pointer"
                      />
                      Operating Expenses ($)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-txt-primary">
                      <input
                        type="checkbox"
                        checked={visibleLines.customers}
                        onChange={() => setVisibleLines(prev => ({ ...prev, customers: !prev.customers }))}
                        className="accent-violet-600 rounded cursor-pointer"
                      />
                      Customer Count
                    </label>
                  </div>
                </div>
              </div>

              {/* 4 Major AI Suggestion Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verdictData.aiInsights?.map((insight) => {
                  const IconComponent = insight.icon;
                  return (
                    <div key={insight.id} className="bg-surface-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <IconComponent size={20} className="text-txt-primary opacity-80" />
                        <div>
                          <h3 className="text-sm font-semibold text-txt-primary">{insight.title}</h3>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {insight.blocks.map((block, idx) => (
                          <div key={idx} className="bg-surface-panel/50 p-3 rounded-lg border border-border-light">
                            <p className="text-xs text-txt-secondary leading-relaxed">{block}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
