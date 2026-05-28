import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Play, Cpu, Sparkles, TrendingUp, Users, ShieldAlert, FileText, Activity } from 'lucide-react';
import { translations } from '../../data/translations';
import api from '../../services/api';
import SimulationSkeleton from '../AIReportPage/SimulationSkeleton';

export default function AnalyticsView({ workspace = {}, businessProfile = {}, onStartInterrogation, language = 'mm' }) {
  const t = translations[language];
  const [stage, setStage] = useState('setup'); // 'setup' | 'running' | 'results'
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const [ratios, setRatios] = useState({
    competitors: 70,
    customers: 80,
    distributors: 60
  });

  // Dynamic simulation inputs (moved from onboarding)
  const [targetScenario, setTargetScenario] = useState('Competitor Price Cut');
  const [expectedResult, setExpectedResult] = useState('Less Profit');

  const [simulationData, setSimulationData] = useState([]);
  const [verdictData, setVerdictData] = useState(null);

  // Toggles for the 5 projection lines
  const [visibleLines, setVisibleLines] = useState({
    profit: true,
    marketShare: true,
    revenue: false,
    expenses: false,
    customers: false
  });

  const hasRivals = businessProfile?.rivals && businessProfile.rivals.length > 0;

  // Mock static charts data
  const acquisitionData = [
    { name: 'Viber', value: 45 },
    { name: 'Telegram', value: 30 },
    { name: 'Walk-in', value: 20 },
    { name: 'Referral', value: 5 }
  ];

  const segmentData = [
    { name: 'Regulars', value: 60 },
    { name: 'Occasional', value: 25 },
    { name: 'One-timers', value: 15 }
  ];

  const runSimulation = async () => {
    setStage('running');
    setLogs([]);
    setProgress(0);
    setError(null);

    const totalRounds = 8;
    const mockLogs = [
      language === 'mm' ? 'အဆင့် ၁ - လက်လီဖောက်သည် ကိုယ်စားလှယ်များ ဆန်းစစ်နေသည် (အချက် ၄၀)...' : 'Round 1: Initializing merchant swarm agents (40 agents)...',
      language === 'mm' ? 'အဆင့် ၂ - ပြိုင်ဘက်များ၏ အရောင်းပမာဏကို တွက်ချက်နေသည်...' : 'Round 2: Competitors assessing retail order volumes...',
      language === 'mm' ? 'အဆင့် ၃ - ဖောက်သည်များ၏ ကြွေးမြီတောင်းဆိုမှုများအား တွက်ချက်နေသည်...' : 'Round 3: Shopkeepers requesting credit terms...',
      language === 'mm' ? 'အဆင့် ၄ - ပြိုင်ဘက်ဆိုင်များ၏ ဈေးနှုန်းအားပြိုင်မှုကို ဆန်းစစ်နေသည်...' : 'Round 4: Competitor launching matching pricing campaigns...',
      language === 'mm' ? 'အဆင့် ၅ - ကုန်ပစ္စည်းလက်ကျန် အခြေအနေများအား တိုက်ဆိုင်စစ်ဆေးနေသည်...' : 'Round 5: Coalition forming: 3 competitor partners matching inventory...',
      language === 'mm' ? 'အဆင့် ၆ - ဖောက်သည်ပြောင်းလဲမှု အလားအလာများအား ဆန်းစစ်နေသည်...' : 'Round 6: Retailer agents showing high migration to credit programs...',
      language === 'mm' ? 'အဆင့် ၇ - ကုန်ပစ္စည်းရရှိနိုင်မှု လမ်းကြောင်းများကို ဆန်းစစ်နေသည်...' : 'Round 7: Wholesale suppliers adjusting operational costs...',
      language === 'mm' ? 'အဆင့် ၈ - ခန့်မှန်းချက်ရလဒ်များကို စုစည်းတွက်ချက်ပြီးစီးပါပြီ...' : 'Round 8: Completing scenario analysis and compiling profit verdict report...'
    ];

    for (let i = 0; i < totalRounds; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLogs(prev => [...prev, mockLogs[i]]);
      setProgress(((i + 1) / totalRounds) * 100);
    }

    try {
      const result = await api.runSimulation('main', ratios);

      // Generate projection curves based on profile
      const monthlySales = businessProfile?.sales?.monthly || 12000;
      const monthlyExpenses = businessProfile?.expenses || 8000;
      const compRatio = hasRivals ? (ratios.competitors / 100) : 0.7;
      const custRatio = ratios.customers / 100;
      const distRatio = ratios.distributors / 100;

      const points = [];
      for (let step = 1; step <= 6; step++) {
        let revenue = monthlySales;
        let expenses = monthlyExpenses;
        let marketShare = 65;
        let customers = 180;

        if (targetScenario.includes('Price') || targetScenario.includes('Cut')) {
          marketShare -= step * (compRatio * 5);
          revenue -= step * (compRatio * (monthlySales * 0.04));
          customers -= step * (compRatio * 10);
        } else if (targetScenario.includes('Credit') || targetScenario.includes('Demand')) {
          revenue += step * (custRatio * (monthlySales * 0.02));
          expenses += step * (custRatio * (monthlyExpenses * 0.05));
          marketShare += step * (custRatio * 1.5);
        } else if (targetScenario.includes('Chain') || targetScenario.includes('Inflation')) {
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

      // Dynamic AI suggestions matching selection
      let recommendationText = "";
      if (targetScenario.includes('Price') || targetScenario.includes('Cut')) {
        recommendationText = language === 'mm'
          ? `ပြိုင်ဘက်များ၏ ဈေးနှုန်းအားပြိုင်မှု (${ratios.competitors}%) ကြောင့် နောက် ၆ လအတွင်း အသားတင်အမြတ် ကျဆင်းသွားနိုင်ပါသည်။ စျေးနှုန်းလျှော့ချပြီး တိုက်ရိုက်ယှဉ်ပြိုင်မည့်အစား Viber/Telegram မှတဆင့် ဖောက်သည်ဟောင်းများအား အထူးသစ္စာရှိမှုအစီအစဉ် (Loyalty Program) များ ဖန်တီးပေးခြင်းဖြင့် ဈေးကွက်ဝေစုကို ထိန်းသိမ်းရန် အကြံပြုအပ်ပါသည်။ ၎င်းသည် သင်ခန့်မှန်းထားသော "${expectedResult}" ရလဒ်ထက် ပိုမိုကောင်းမွန်စေပါမည်။`
          : `High competitive pressure (${ratios.competitors}%) from rivals will likely erode net profit within 6 months. Rather than engaging in direct price wars, we recommend launching exclusive loyalty programs via Viber and Telegram channels to protect margins, helping mitigate the expected "${expectedResult}" outcome.`;
      } else if (targetScenario.includes('Credit') || targetScenario.includes('Demand')) {
        recommendationText = language === 'mm'
          ? `ဖောက်သည်များ၏ အကြွေးဝယ်ယူလိုအား တိုးတက်လာသဖြင့် ကုန်ကျစရိတ် မြင့်တက်လာနိုင်ပါသည်။ အကြွေးကို စနစ်တကျစီမံရန်အတွက် အမှာစာအသစ်များ၏ ၂၀% အား လက်ငင်းငွေချေစနစ်ဖြင့် ပေးချေစေခြင်း သို့မဟုတ် အရောင်းပမာဏများပြားသော ဖောက်သည်အချို့ကိုသာ ကန့်သတ်ခွင့်ပြုရန် အကြံပြုပါသည်။ ၎င်းသည် "${expectedResult}" ဖြစ်ပေါ်မှုမှ ကာကွယ်ပေးပါမည်။`
          : `High credit demands are projected to inflate operating overheads. To manage outstanding cash safely, implement a policy requiring at least 20% down-payment on new cargo orders, protecting the store from the expected "${expectedResult}" scenario.`;
      } else {
        recommendationText = language === 'mm'
          ? `ထောက်ပံ့ပို့ဆောင်ရေးကုန်ကျစရိတ်များ မြင့်တက်မှုနှင့် စျေးကွက်အပြောင်းအလဲများ ရှိနေသော်လည်း အရောင်းရငွေအား တည်ငြိမ်အောင် ထိန်းထားနိုင်ပါသည်။ ကုန်ပစ္စည်းပြတ်လပ်မှုအန္တရာယ်မှ ကာကွယ်ရန် ကုန်ပစ္စည်းသိုလှောင်မှု ပမာဏကို ၁၅% ခန့် တိုးမြှင့်စုဆောင်းထားရန် အကြံပြုအပ်ပါသည်။ ၎င်းသည် "${expectedResult}" ကို လျှော့ချပေးပါမည်။`
          : `Supply chain bottlenecks are driving operational expenses upward. To prevent stockouts on key high-margin goods, consider diversifying suppliers and building a 15% safety stock buffer for core inventory products, directly addressing "${expectedResult}".`;
      }

      setVerdictData({
        confidence: result.confidence || 0.85,
        verdict: recommendationText,
        criticalAgents: result.criticalAgents || []
      });

      setStage('results');
    } catch (err) {
      console.error(err);
      setError("Failed to run prediction swarm.");
      setStage('setup');
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

      {/* 1. STRATEGIC KPI GRID (2x2) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: t.activeCustomers, val: "184", icon: Users },
          { label: t.totalConnections, val: "34", icon: Activity },
          { label: t.competitiveSignals, val: "8", icon: ShieldAlert },
          { label: t.intelligenceSources, val: "12", icon: FileText }
        ].map((item, idx) => (
          <div 
            key={idx}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {item.label}
              </span>
              <div className="font-number" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {item.val}
              </div>
            </div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <item.icon size={16} />
            </div>
          </div>
        ))}
      </section>

      {/* 2. MAIN PREDICTIVE SIMULATION PANEL */}
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

            {/* Scenario Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {language === 'mm' ? "ဆန်းစစ်လိုသော စျေးကွက်အခြေအနေ" : "Simulation Scenario Target"}
              </label>
              <select
                value={targetScenario}
                onChange={e => setTargetScenario(e.target.value)}
                disabled={stage === 'running'}
                style={{
                  height: '36px', padding: '0 8px', borderRadius: '8px',
                  border: '1px solid var(--border-default)', background: '#fff',
                  fontSize: '12px', outline: 'none'
                }}
              >
                <option value="Competitor Price Cut">Competitor Price Cut</option>
                <option value="Customer Credit Demands">Customer Credit Demands</option>
                <option value="Supply Chain Cost Inflation">Supply Chain Cost Inflation</option>
              </select>
            </div>

            {/* Expected Result Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {language === 'mm' ? "မျှော်မှန်းထားသည့် ရလဒ်" : "Expected Strategic Result"}
              </label>
              <select
                value={expectedResult}
                onChange={e => setExpectedResult(e.target.value)}
                disabled={stage === 'running'}
                style={{
                  height: '36px', padding: '0 8px', borderRadius: '8px',
                  border: '1px solid var(--border-default)', background: '#fff',
                  fontSize: '12px', outline: 'none'
                }}
              >
                <option value="Sales Drop / Fewer Customers">Sales Drop / Fewer Customers</option>
                <option value="Less Profit">Less Profit</option>
                <option value="Supplier Cost Increase">Supplier Cost Increase</option>
              </select>
            </div>

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
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContext: 'center',
                textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)'
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
              <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SimulationSkeleton />
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
                        {t.aiSuggestionTitle} &middot; {Math.round(verdictData.confidence * 100)}% Confidence
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onStartInterrogation(verdictData.criticalAgents)}
                      style={{
                        background: 'var(--accent)', color: '#fff', border: 'none',
                        padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
                        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Sparkles size={10} /> {t.consultAgentsBtn}
                    </button>
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
                        
                        {visibleLines.profit && <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Net Profit ($)" dot={{ r: 3 }} />}
                        {visibleLines.marketShare && <Line type="monotone" dataKey="marketShare" stroke="#3b82f6" strokeWidth={2} name="Market Share (%)" dot={{ r: 3 }} />}
                        {visibleLines.revenue && <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={1.5} name="Revenue ($)" dot={{ r: 2 }} />}
                        {visibleLines.expenses && <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={1.5} name="Expenses ($)" dot={{ r: 2 }} />}
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
                      { key: 'marketShare', label: language === 'mm' ? "ဈေးကွက်ဝေစု (%)" : "Market Share (%)", color: '#3b82f6' },
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

      </section>

      {/* 3. TWO COLUMN REGION: CHANNELS & SEGMENTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Customer Acquisition Channels */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '20px',
          padding: '24px', border: '1px solid var(--border-default)'
        }}>
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '16px' }}>
            {t.channelsTitle}
          </h3>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={acquisitionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments Alignment */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '20px',
          padding: '24px', border: '1px solid var(--border-default)'
        }}>
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '16px' }}>
            {t.segmentsTitle}
          </h3>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" fill="var(--entity-company)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
