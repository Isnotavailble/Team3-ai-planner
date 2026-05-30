import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Cpu, Sparkles, Lightbulb } from 'lucide-react';
import { translations } from '../../data/translations';
import api from '../../services/api';
import SimulationSkeleton from '../AIReportPage/SimulationSkeleton';
import AnalyticsSkeleton from './AnalyticsSkeleton';

export default function AnalyticsView({ 
  businessProfile = {}, 
  language = 'mm',
  isLoading = false
}) {
  const t = translations[language];


  const [stage, setStage] = useState('setup'); // 'setup' | 'running' | 'results'
  const [error, setError] = useState(null);
  
  const [ratios, setRatios] = useState({
    competitors: 70,
    customers: 80,
    distributors: 60
  });

  const [simulationData, setSimulationData] = useState([]);
  const [verdictData, setVerdictData] = useState(null);
  const [swot, setSwot] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Toggles for the 5 projection lines
  const [visibleLines, setVisibleLines] = useState({
    profit: true,
    marketShare: true,
    revenue: false,
    expenses: false,
    customers: false
  });



  const runSimulation = async () => {
    setStage('running');
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const result = await api.runSimulation('main', ratios, businessProfile);

      const points = (result?.projections || []).map(p => ({
        name: `Month ${p?.month || 0}`,
        profit: p?.profit || 0,
        revenue: p?.revenue || 0,
        expenses: p?.expenses || 0,
        marketShare: p?.marketShare || 0,
        customers: p?.customers || 0
      }));

      setSimulationData(points);

      const aiVerdict = language === 'mm'
        ? (result?.verdictMm || result?.verdict || '')
        : (result?.verdictEn || result?.verdict || '');

      setVerdictData({
        confidence: result?.confidence || 85,
        verdict: aiVerdict,
        criticalAgents: result?.criticalAgents || []
      });

      const isMm = language === 'mm';
      setSwot((result?.swot || []).map(item => ({
        type: item?.type || 'strength',
        title: isMm ? (item?.titleMm || item?.title || '') : (item?.titleEn || item?.title || ''),
        desc: isMm ? (item?.descMm || item?.desc || '') : (item?.descEn || item?.desc || '')
      })));

      setRecommendations((result?.recommendations || []).map(rec => ({
        id: rec?.id || `rec-${Math.random()}`,
        title: isMm ? (rec?.titleMm || rec?.title || '') : (rec?.titleEn || rec?.title || ''),
        desc: isMm ? (rec?.descMm || rec?.desc || '') : (rec?.descEn || rec?.desc || '')
      })));

      setStage('results');
    } catch (err) {
      console.error(err);
      setError("Failed to run prediction swarm.");
    }
  };

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  const getSwotStyles = (type) => {
    switch (type.toLowerCase()) {
      case 'strength':
        return {
          bg: 'rgba(16, 185, 129, 0.03)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          label: language === 'mm' ? 'အားသာချက် (Strength)' : 'Strength'
        };
      case 'weakness':
        return {
          bg: 'rgba(239, 68, 68, 0.03)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          label: language === 'mm' ? 'အားနည်းချက် (Weakness)' : 'Weakness'
        };
      case 'opportunity':
        return {
          bg: 'rgba(2, 132, 199, 0.03)',
          border: '1px solid rgba(2, 132, 199, 0.15)',
          color: '#0284c7',
          label: language === 'mm' ? 'အခွင့်လမ်း (Opportunity)' : 'Opportunity'
        };
      case 'threat':
        return {
          bg: 'rgba(245, 158, 11, 0.03)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          label: language === 'mm' ? 'ခြိမ်းခြောက်မှု (Threat)' : 'Threat'
        };
      default:
        return {
          bg: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
          label: type
        };
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* HEADER */}
      <header>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {t.analyticsTitle}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {language === 'mm' ? "စက်မှုဥာဏ်ရည်သုံး စျေးကွက်ခန့်မှန်းချက်များနှင့် မဟာဗျူဟာအကြံပြုချက်များ" : "Swarm intelligence simulation & business projections"}
        </p>
      </header>

      {/* 3. MAIN PREDICTIVE SIMULATION PANEL */}
          <section style={{
            background: 'var(--bg-surface)', borderRadius: '24px',
            border: '1px solid var(--border-default)', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
              <Cpu size={20} style={{ color: 'var(--accent)' }} />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {language === 'mm' ? "AI စျေးကွက်အသွင်တူဆန်းစစ်ချက် မော်ဒယ်" : "AI Swarm Predictive Simulation"}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {language === 'mm' ? "စျေးကွက်အခြေအနေများပြောင်းလဲပြီး ၆ လပတ် အရောင်းရလဒ်များကို ခန့်မှန်းကြည့်ပါ" : "Simulate forecast models based on market parameters"}
                </p>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(163, 61, 92, 0.1)', color: 'var(--critical)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>
              
              {/* Setup Configuration Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                  {t.marketConditions}
                </h4>

                {/* Slider 1: Competitors */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.competitorAggressive}</span>
                    <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ratios.competitors}%</span>
                  </div>
                  <input
                    type="range" min="10" max="100" value={ratios.competitors}
                    onChange={e => setRatios({ ...ratios, competitors: parseInt(e.target.value) })}
                    disabled={stage === 'running'}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>

                {/* Slider 2: Retailer Engagement */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.retailerEngagement}</span>
                    <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ratios.customers}%</span>
                  </div>
                  <input
                    type="range" min="10" max="100" value={ratios.customers}
                    onChange={e => setRatios({ ...ratios, customers: parseInt(e.target.value) })}
                    disabled={stage === 'running'}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>

                {/* Slider 3: Supply capacity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.supplyCapacity}</span>
                    <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ratios.distributors}%</span>
                  </div>
                  <input
                    type="range" min="10" max="100" value={ratios.distributors}
                    onChange={e => setRatios({ ...ratios, distributors: parseInt(e.target.value) })}
                    disabled={stage === 'running'}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>

                {stage !== 'running' && (
                  <button
                    onClick={runSimulation}
                    style={{
                      background: 'var(--accent)', color: '#fff', border: 'none',
                      padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Play size={12} fill="currentColor" /> {t.runSimulationBtn}
                  </button>
                )}

                {stage === 'running' && (
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', padding: '10px' }}>
                    {language === 'mm' ? "စနစ်တွက်ချက်မှုများ ပြုလုပ်နေသည်..." : "Simulating swarm model..."}
                  </div>
                )}
              </div>

              {/* Chart & Suggestion Output Column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {stage === 'setup' && (
                  <div style={{
                    height: '420px', border: '1.5px dashed var(--border-default)', borderRadius: '16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center',
                    textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', justifyContent: 'center'
                  }}>
                    <Cpu size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "ခန့်မှန်းတွက်ချက်ရန် အချက်အလက်များ အသင့်ရှိပါသည်" : "Simulation Model Ready"}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', maxWidth: '300px', marginTop: '6px' }}>
                      {language === 'mm' ? "သတ်မှတ်ချက်များကို ချိန်ညှိပြီး 'ခန့်မှန်းချက် တွက်ချက်မည်' ကို နှိပ်ပါ" : "Adjust conditions on the left pane and initialize simulation graph."}
                    </p>
                  </div>
                )}

                {stage === 'running' && (
                  <div style={{ width: '100%', overflow: 'hidden' }}>
                    <SimulationSkeleton showCards={false} />
                  </div>
                )}

                {stage === 'results' && (
                  <div className="space-y-6 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* 1. DYNAMIC AI SUGGESTION TEXT BLOCK */}
                    <div style={{
                      background: 'var(--bg-gradient-1)', border: '1px solid var(--border-default)',
                      borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                          <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {language === 'mm' ? 'AI ခွဲခြမ်းစိတ်ဖြာချက် အကျဉ်းချုပ်' : 'Overview of AI Graph Analysis'}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                        {verdictData.verdict}
                      </p>
                    </div>

                    {/* 2. 5-LINE PROJECTION CHART */}
                    <div style={{ border: '1px solid var(--border-default)', borderRadius: '16px', padding: '20px', background: 'var(--bg-surface)' }}>
                      <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={simulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            
                            {visibleLines.profit && <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Net Profit (MMK)" dot={{ r: 3 }} />}
                            {visibleLines.revenue && <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={1.5} name="Revenue (MMK)" dot={{ r: 2 }} />}
                            {visibleLines.expenses && <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={1.5} name="Expenses (MMK)" dot={{ r: 2 }} />}
                            {visibleLines.customers && <Line type="monotone" dataKey="customers" stroke="#8b5cf6" strokeWidth={1.5} name="Customers" dot={{ r: 2 }} />}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* 5-Line Checkboxes */}
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center',
                        paddingTop: '14px', borderTop: '1px solid var(--border-default)', marginTop: '12px'
                      }}>
                        {[
                          { key: 'profit', label: language === 'mm' ? "အသားတင်အမြတ်" : "Net Profit", color: '#10b981' },
                          { key: 'revenue', label: language === 'mm' ? "စုစုပေါင်းဝင်ငွေ" : "Revenue", color: '#0284c7' },
                          { key: 'expenses', label: language === 'mm' ? "ကုန်ကျစရိတ်" : "Expenses", color: '#ef4444' },
                          { key: 'customers', label: language === 'mm' ? "ဖောက်သည်ဦးရေ" : "Customers", color: '#8b5cf6' }
                        ].map(item => (
                          <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={visibleLines[item.key]}
                              onChange={() => setVisibleLines(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                              style={{ accentColor: item.color, cursor: 'pointer' }}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* SWOT & AI Recommendations block integrated inside simulation panel */}
            {(stage === 'results' || stage === 'setup' || stage === 'running') && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px',
                borderTop: '1px solid var(--border-default)',
                paddingTop: '24px',
                marginTop: '12px'
              }}>
                {/* SWOT Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>
                    <Lightbulb size={18} style={{ color: 'var(--text-primary)' }} />
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {language === 'mm' ? 'SWOT သုံးသပ်ချက်' : 'SWOT Analysis'}
                    </h3>
                  </div>
                  
                  {stage === 'running' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                          background: 'transparent',
                          border: '1px solid var(--border-default)',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="shimmer" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                            <div className="shimmer" style={{ width: '60px', height: '10px', borderRadius: '3px', background: 'rgba(0,0,0,0.05)' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div className="shimmer" style={{ width: '80%', height: '12px', borderRadius: '3px', background: 'rgba(0,0,0,0.05)' }} />
                            <div className="shimmer" style={{ width: '100%', height: '10px', borderRadius: '3px', background: 'rgba(0,0,0,0.05)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stage === 'results' && swot.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {swot.map((item, idx) => {
                        const styles = getSwotStyles(item.type);
                        return (
                          <div key={idx} style={{
                            background: 'transparent',
                            border: '1px solid var(--border-default)',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-tertiary)' }}></div>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {styles.label}
                              </span>
                            </div>
                            <div>
                              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                {item.title}
                              </h4>
                              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      height: '140px',
                      border: '1px dashed var(--border-default)',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-tertiary)',
                      fontSize: '12px',
                      padding: '24px',
                      textAlign: 'center'
                    }}>
                      {language === 'mm' ? "SWOT သုံးသပ်ချက် ရရှိရန် စျေးကွက်ခန့်မှန်းချက်ကို အရင်တွက်ချက်ပါ" : "Run simulation to generate SWOT analysis"}
                    </div>
                  )}
                </div>

                {/* Recommendations Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>
                    <Sparkles size={18} style={{ color: 'var(--text-primary)' }} />
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {language === 'mm' ? 'AI အကြံပြုချက်များ' : 'AI Recommendations'}
                    </h3>
                  </div>
                  
                  {stage === 'running' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                          background: 'transparent',
                          border: '1px solid var(--border-default)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'start'
                        }}>
                          <div className="shimmer" style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,0,0,0.05)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                            <div className="shimmer" style={{ width: '60%', height: '12px', borderRadius: '3px', background: 'rgba(0,0,0,0.05)' }} />
                            <div className="shimmer" style={{ width: '90%', height: '10px', borderRadius: '3px', background: 'rgba(0,0,0,0.05)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stage === 'results' && recommendations.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {recommendations.map((rec, idx) => (
                        <div key={rec.id} style={{
                          background: 'transparent',
                          border: '1px solid var(--border-default)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'start'
                        }}>
                          <div style={{
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-default)',
                            borderRadius: '8px',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '12px',
                            flexShrink: 0
                          }}>
                            {idx + 1}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {rec.title}
                            </h4>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              {rec.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      height: '140px',
                      border: '1px dashed var(--border-default)',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-tertiary)',
                      fontSize: '12px',
                      padding: '24px',
                      textAlign: 'center'
                    }}>
                      {language === 'mm' ? "AI အကြံပြုချက်များ ရရှိရန် စျေးကွက်ခန့်မှန်းချက်ကို အရင်တွက်ချက်ပါ" : "Run simulation to receive AI recommendations"}
                    </div>
                  )}
                </div>
              </div>
            )}

          </section>


    </div>
  );
}
