import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Sparkles, Cpu, AlertTriangle, TrendingUp, Activity, Box, List } from 'lucide-react';
import { translations } from '../../data/translations';
import DashboardSkeleton from './DashboardSkeleton';
import api from '../../services/api';

export default function ReportsView({ businessProfile = {}, language = 'mm', isLoading = false, excelAuditResult, setExcelAuditResult }) {
  const t = translations[language];


  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'expenses'
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState(null);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      const result = await api.runExcelAudit(businessProfile.salesHistory, businessProfile.products || [], language);
      if (result) {
        setExcelAuditResult(result);
      } else {
        setAuditError(language === 'mm' ? "AI ဆန်းစစ်မှု မအောင်မြင်ပါ။ နောက်မှ ပြန်ကြိုးစားပါ။" : "Failed to run AI Audit. Please try again.");
      }
    } catch (e) {
      setAuditError(e.message || "Error running audit.");
    } finally {
      setIsAuditing(false);
    }
  };

  // Extract CSV Summary
  const salesSummary = businessProfile?.sales?.summary || null;
  const productSales = salesSummary?.productSales || {};
  const hasCsvSummary = !!salesSummary;

  // Breakdown Calculations
  let derivedMonthlySales = salesSummary?.totalRevenue || null;
  let derivedMonthlyExpenses = salesSummary?.totalExpense || null;

  if (!hasCsvSummary && businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
    const maySales = businessProfile.salesHistory
      .filter(h => h.date && h.date.startsWith('2026-05'))
      .reduce((sum, h) => sum + (h.sales || 0), 0);
    const mayExpenses = businessProfile.salesHistory
      .filter(h => h.date && h.date.startsWith('2026-05'))
      .reduce((sum, h) => sum + (h.expenses || 0), 0);

    derivedMonthlySales = maySales;
    derivedMonthlyExpenses = mayExpenses;

    if (derivedMonthlySales === 0) {
      derivedMonthlySales = businessProfile.salesHistory.slice(-30).reduce((sum, h) => sum + (h.sales || 0), 0);
      derivedMonthlyExpenses = businessProfile.salesHistory.slice(-30).reduce((sum, h) => sum + (h.expenses || 0), 0);
    }
  }

  const monthlySales = derivedMonthlySales || businessProfile?.sales?.monthly || null;
  const monthlyExpenses = derivedMonthlyExpenses || businessProfile?.expenses || null;
  const profit = (monthlySales !== null && monthlyExpenses !== null) ? monthlySales - monthlyExpenses : null;
  
  // Financial Health Status
  let healthStatus = language === 'mm' ? 'မရှိသေးပါ' : '-';
  let healthColor = 'var(--text-tertiary)';
  if (profit !== null && monthlySales !== null && monthlySales > 0) {
    if (profit > (monthlySales * 0.2)) {
      healthStatus = language === 'mm' ? 'အလွန်ကောင်းမွန်သည်' : 'Excellent';
      healthColor = 'var(--text-primary)';
    } else if (profit < 0) {
      healthStatus = language === 'mm' ? 'အရှုံးပေါ်နေသည်' : 'Critical (Loss)';
      healthColor = 'var(--critical)';
    } else if (profit < (monthlySales * 0.05)) {
      healthStatus = language === 'mm' ? 'သတိပြုရန်' : 'Warning (Low Margin)';
      healthColor = '#f59e0b';
    } else {
      healthStatus = language === 'mm' ? 'ပုံမှန်' : 'Normal';
      healthColor = 'var(--text-primary)';
    }
  }

  // Radial Gauge Calculations (Dynamic based on activeMetric)
  const isRevenue = activeMetric === 'revenue';
  const gaugeCurrentValue = isRevenue ? monthlySales : monthlyExpenses;
  const gaugeTargetValue = isRevenue 
    ? (businessProfile?.sales?.monthly || null) 
    : (businessProfile?.expenses || null);
  
  const gaugeLabel = isRevenue 
    ? (language === 'mm' ? "အရောင်းရငွေ နှင့် ပန်းတိုင်" : "Revenue vs. Target")
    : (language === 'mm' ? "အသုံးစရိတ် နှင့် ဘတ်ဂျက်" : "Expenses vs. Budget");

  const progressRatio = (gaugeCurrentValue !== null && gaugeTargetValue > 0) ? Math.min(1, gaugeCurrentValue / gaugeTargetValue) : 0;
  const strokeDashOffset = 440 - (progressRatio * 220); // 440 is the half-circle circumference baseline

  // Recharts Monthly Revenue vs Target History
  let customBarData = [];
  if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
    const periodMap = {};
    const sortedHistory = [...businessProfile.salesHistory]
      .filter(h => h.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedHistory.length > 0) {
      const firstDate = new Date(sortedHistory[0].date);
      const lastDate = new Date(sortedHistory[sortedHistory.length - 1].date);
      const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
      
      const isShortPeriod = daysDiff <= 60;

      sortedHistory.forEach(h => {
        const d = new Date(h.date);
        let keyName;
        if (isShortPeriod) {
            keyName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            keyName = d.toLocaleDateString('en-US', { month: 'short' });
        }
        
        if (!periodMap[keyName]) {
          periodMap[keyName] = { sales: 0, expenses: 0 };
        }
        periodMap[keyName].sales += h.sales || 0;
        periodMap[keyName].expenses += h.expenses || 0;
      });
      
      customBarData = Object.keys(periodMap).map(k => ({
        name: k,
        Revenue: periodMap[k].sales,
        Target: Math.round(periodMap[k].sales * 1.1)
      }));
    }
  }

  const barChartData = customBarData.length > 0 ? customBarData : [];

  // Product Sales Lists
  const productSalesList = Object.entries(productSales).map(([name, data]) => ({
    name,
    totalSold: data.totalSold,
    revenue: data.revenue
  })).sort((a, b) => b.revenue - a.revenue);

  const bestSellingProducts = productSalesList.slice(0, 3);
  const worstSellingProducts = productSalesList.slice().reverse().slice(0, 3);

  // Dynamic Pie Chart Data Generation
  let pieChartData = [];
  const PIE_COLORS = ['#6B2D7B', '#B85C8E', '#5C7B6B', '#C97755', '#4A5568', '#A0AEC0'];

  if (isRevenue) {
    if (productSalesList.length > 0) {
      pieChartData = productSalesList.map(p => ({
        name: p.name,
        value: p.revenue
      }));
    } else if (businessProfile?.products && businessProfile.products.length > 0 && monthlySales !== null) {
      // Fallback: Proportional distribution based on profile product prices
      const totalPrice = businessProfile.products.reduce((acc, p) => acc + (p.price || 0), 0);
      pieChartData = businessProfile.products.map(p => {
        const ratio = totalPrice > 0 ? (p.price || 0) / totalPrice : 1 / businessProfile.products.length;
        return {
          name: p.name,
          value: Math.round(monthlySales * ratio)
        };
      });
    }
  } else {
    // Dynamic Expense Breakdown
    if (monthlyExpenses !== null) {
      const hasSuppliers = businessProfile?.suppliers && businessProfile.suppliers.length > 0;
      const supplierCost = hasSuppliers ? Math.round(monthlyExpenses * 0.55) : Math.round(monthlyExpenses * 0.5);
      const salariesCost = hasSuppliers ? Math.round(monthlyExpenses * 0.20) : Math.round(monthlyExpenses * 0.25);
      const rentCost = Math.round(monthlyExpenses * 0.15);
      const operationsCost = monthlyExpenses - supplierCost - salariesCost - rentCost;

      pieChartData = [
        { name: language === 'mm' ? "ကုန်ပစ္စည်း ဖိုး" : "Supplier Costs", value: supplierCost },
        { name: language === 'mm' ? "လစာ များ" : "Salaries", value: salariesCost },
        { name: language === 'mm' ? "ဆိုင်ခန်းငှားခ" : "Rent & Utilities", value: rentCost },
        { name: language === 'mm' ? "အထွေထွေ" : "Operations", value: operationsCost }
      ];
    }
  }

  const donutTitle = isRevenue 
    ? (language === 'mm' ? "ကုန်ပစ္စည်းအလိုက် ရောင်းရငွေ" : "Revenue by Product")
    : (language === 'mm' ? "အသုံးစရိတ် ခွဲခြမ်းစိတ်ဖြာချက်" : "Expense Breakdown");

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* HEADER REGION */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t.reportsTitle}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {language === 'mm' ? "လုပ်ငန်း၏ ဘဏ္ဍာရေး အခြေအနေ နှိုင်းယှဉ်ချက်" : "Performance insights & metric statements"}
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)'
        }}>
          <Download size={14} /> {language === 'mm' ? "ထုတ်ယူမည်" : "Export PDF"}
        </button>
      </header>

      {/* DYNAMIC CSV FINANCIAL BREAKDOWN & AI AUDITOR */}
      <section style={{
        background: 'var(--bg-surface)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid var(--border-default)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
          <Activity size={18} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {language === 'mm' ? "လုပ်ငန်း ဘဏ္ဍာရေး အကျဉ်းချုပ်" : "Financial Breakdown Summary"}
          </h3>
        </div>

        {/* CSV Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'mm' ? "စုစုပေါင်း အရောင်းရငွေ" : "Total Revenue"}</span>
            <div className="font-number" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {monthlySales !== null ? monthlySales.toLocaleString() : '-'} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{monthlySales !== null ? 'MMK' : ''}</span>
            </div>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'mm' ? "စုစုပေါင်း အသုံးစရိတ်" : "Total Expenses"}</span>
            <div className="font-number" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {monthlyExpenses !== null ? monthlyExpenses.toLocaleString() : '-'} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{monthlyExpenses !== null ? 'MMK' : ''}</span>
            </div>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'mm' ? "အမြတ်ငွေ" : "Net Profit"}</span>
            <div className="font-number" style={{ fontSize: '24px', fontWeight: 700, color: profit === null || profit >= 0 ? 'var(--text-primary)' : 'var(--critical)', marginTop: '4px' }}>
              {profit !== null ? profit.toLocaleString() : '-'} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{profit !== null ? 'MMK' : ''}</span>
            </div>
          </div>
        </div>

        {/* Financial Health Status */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-default)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color="var(--text-secondary)" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{language === 'mm' ? 'ဘဏ္ဍာရေး ကျန်းမာရေး အခြေအနေ' : 'Financial Health Status'}</div>
            <div style={{ fontSize: '16px', color: healthColor, fontWeight: 700 }}>{healthStatus}</div>
          </div>
        </div>

        {/* Product Performance Lists (from CSV) */}
        {hasCsvSummary && productSalesList.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '8px' }}>
            {/* Best Sellers */}
            <div style={{ border: '1px solid var(--border-default)', borderRadius: '16px', padding: '16px', background: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{language === 'mm' ? 'ရောင်းအားအကောင်းဆုံး ကုန်ပစ္စည်းများ' : 'Best Selling Products'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bestSellingProducts.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: idx < bestSellingProducts.length - 1 ? '1px dashed var(--border-default)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>{idx + 1}</div>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{p.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-number" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.revenue.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{p.totalSold} {language === 'mm' ? 'ခု' : 'sold'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Sellers */}
            <div style={{ border: '1px solid var(--border-default)', borderRadius: '16px', padding: '16px', background: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <AlertTriangle size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{language === 'mm' ? 'ရောင်းအားအနည်းဆုံး ကုန်ပစ္စည်းများ' : 'Underperforming Products'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {worstSellingProducts.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: idx < worstSellingProducts.length - 1 ? '1px dashed var(--border-default)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Box size={14} color="var(--text-tertiary)" />
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{p.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-number" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.revenue.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{p.totalSold} {language === 'mm' ? 'ခု' : 'sold'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI SALES AUDITOR INTEGRATION */}
        {businessProfile?.salesHistory && businessProfile.salesHistory.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Cpu size={18} style={{ color: 'var(--text-secondary)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? "AI စာရင်းအင်း ဆန်းစစ်သူ" : "AI Sales Auditor"}
              </h3>
            </div>

            {auditError && (
              <div style={{ background: 'rgba(163, 61, 92, 0.1)', color: 'var(--critical)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                {auditError}
              </div>
            )}

            {!excelAuditResult && !isAuditing && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'var(--bg-elevated)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {language === 'mm' ? "တင်သွင်းထားသော အရောင်းစာရင်းများကို AI ဖြင့် အသေးစိတ်ဆန်းစစ်ရန်" : "Analyze uploaded sales data with AI"}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {language === 'mm' ? "အရောင်းအဝယ် အတက်အကျများ၊ ပုံမှန်မဟုတ်သော နေ့ရက်များနှင့် အရောင်းတိုးတက်မှုအဆင့်ကို တွက်ချက်ကြည့်ပါ" : "Analyze sales peaks, outlier transaction days, and overall growth ratings"}
                  </p>
                </div>
                <button
                  onClick={handleRunAudit}
                  style={{
                    background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)',
                    padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <Sparkles size={14} color="var(--text-secondary)" /> {language === 'mm' ? "AI ဖြင့် အရောင်းစာရင်း ဆန်းစစ်မည်" : "Run AI Sales Audit"}
                </button>
              </div>
            )}

            {isAuditing && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', gap: '12px' }}>
                <div className="animate-spin" style={{
                  width: '28px', height: '28px', border: '3px solid var(--border-default)',
                  borderTopColor: 'var(--text-secondary)', borderRadius: '50%'
                }}></div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {language === 'mm' ? "AI စနစ်မှ သင်၏ အရောင်းမှတ်တမ်းများအား လေ့လာတွက်ချက်နေသည်..." : "AI is analyzing your sales history files..."}
                </p>
              </div>
            )}

            {excelAuditResult && !isAuditing && (
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Growth Score Rating Card */}
                <div style={{
                  background: 'var(--bg-elevated)', borderRadius: '16px', padding: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  textAlign: 'center', border: '1px solid var(--border-default)'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {language === 'mm' ? "တိုးတက်မှု အဆင့်" : "Growth Score"}
                  </span>
                  <span className="font-number" style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {excelAuditResult?.growthScore ?? 0}/100
                  </span>
                  <div style={{
                    fontSize: '10px', padding: '4px 8px', borderRadius: '4px',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    fontWeight: 600
                  }}>
                    {(excelAuditResult?.growthScore ?? 0) >= 75 ? (language === 'mm' ? "အလားအလာ ကောင်းမွန်" : "Strong Potential") : (language === 'mm' ? "တည်ငြိမ်" : "Stable")}
                  </div>
                </div>

                {/* Peak and Anomalies Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-tertiary)' }}></div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {language === 'mm' ? "ရောင်းအားအကောင်းဆုံး ကာလများ" : "Peak Sales Periods"}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                      {language === 'mm' ? (excelAuditResult?.peakPeriodsMm || '') : (excelAuditResult?.peakPeriodsEn || '')}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-tertiary)' }}></div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {language === 'mm' ? "သတိပြုရန် ပုံမှန်မဟုတ်သော ရောင်းအားများ" : "Sales Anomalies / Warnings"}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                      {language === 'mm' ? (excelAuditResult?.anomaliesMm || '') : (excelAuditResult?.anomaliesEn || '')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* TWO COLUMN REGION: GAUGE & DONUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Radial Target Gauge Card */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
        }}>
          <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {gaugeLabel}
          </span>

          {/* SVG Radial Gauge */}
          <div style={{ position: 'relative', width: '220px', height: '130px', marginTop: '10px' }}>
            <svg width="220" height="220" style={{ transform: 'rotate(-180deg)' }}>
              {/* Background Track */}
              <circle
                cx="110" cy="110" r="70"
                fill="none" stroke="var(--bg-elevated)" strokeWidth="12"
                strokeDasharray="220" strokeLinecap="round"
              />
              {/* Active Fill */}
              <circle
                cx="110" cy="110" r="70"
                fill="none" stroke="var(--text-primary)" strokeWidth="12"
                strokeDasharray="220"
                strokeDashoffset={strokeDashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute', top: '70px', left: 0, right: 0,
              textAlign: 'center', display: 'flex', flexDirection: 'column'
            }}>
              <span className="font-number" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {gaugeTargetValue && gaugeCurrentValue !== null ? Math.round(progressRatio * 100) + '%' : '-'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t.currentLabel}: {gaugeCurrentValue !== null ? `${gaugeCurrentValue.toLocaleString()} MMK` : '-'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {t.targetLabel}: <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{gaugeTargetValue ? `${gaugeTargetValue.toLocaleString()} MMK` : '-'}</span>
          </div>

          {/* Toggle Switches: Revenue / Expenses */}
          <div style={{
            display: 'flex', gap: '4px', background: 'var(--bg-elevated)',
            padding: '3px', borderRadius: '8px', width: '100%', maxWidth: '240px', marginTop: '8px'
          }}>
            <button
              onClick={() => setActiveMetric('revenue')}
              style={{
                flex: 1, padding: '6px 0', border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                background: activeMetric === 'revenue' ? 'var(--bg-surface)' : 'transparent',
                color: activeMetric === 'revenue' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              {language === 'mm' ? "အရောင်းရငွေ" : "Revenue"}
            </button>
            <button
              onClick={() => setActiveMetric('expenses')}
              style={{
                flex: 1, padding: '6px 0', border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                background: activeMetric === 'expenses' ? 'var(--bg-surface)' : 'transparent',
                color: activeMetric === 'expenses' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              {language === 'mm' ? "အသုံးစရိတ်" : "Expenses"}
            </button>
          </div>
        </div>

        {/* Dynamic Pie/Donut Chart Card */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
        }}>
          <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <List size={14} />
            {donutTitle}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            {pieChartData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', paddingRight: '8px' }}>
                {pieChartData.map((item, idx) => {
                  const totalValue = pieChartData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }} title={item.name}>{item.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 }}>{percentage}%</span>
                          <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.value.toLocaleString()} MMK
                          </span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: PIE_COLORS[idx % PIE_COLORS.length], borderRadius: '2px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', height: '100%', fontSize: '13px', fontWeight: 500, color: 'var(--text-tertiary)' }}>{language === 'mm' ? "ပြသရန် ဒေတာ မလုံလောက်ပါ" : "Not enough data to display"}</div>
            )}
          </div>
        </div>

      </div>

      {/* REVENUE VS TARGET BAR CHART */}
      <section style={{
        background: 'var(--bg-surface)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid var(--border-default)'
      }}>
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '24px' }}>
          {language === 'mm' ? "အချိန်အလိုက် အရောင်းရရှိမှု နှင့် ပန်းတိုင် နှိုင်းယှဉ်ချက်" : "Revenue vs. Target History"}
        </h3>
        <div style={{ width: '100%', height: '280px' }}>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value} MMK`} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="Revenue" fill="var(--text-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="var(--text-tertiary)" opacity={0.3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '13px', fontWeight: 500, color: 'var(--text-tertiary)' }}>{language === 'mm' ? "ပြသရန် ဒေတာ မလုံလောက်ပါ" : "Not enough data to display"}</div>
          )}
        </div>
      </section>

    </div>
  );
}
