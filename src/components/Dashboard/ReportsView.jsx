import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowDownRight, ArrowUpRight, DollarSign, Download, Calendar } from 'lucide-react';
import { translations } from '../../data/translations';
import DashboardSkeleton from './DashboardSkeleton';

export default function ReportsView({ workspace = {}, businessProfile = {}, language = 'mm', isLoading = false }) {
  const t = translations[language];



  const [period, setPeriod] = useState('monthly'); // 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'expenses'

  // Calculations based on profile and salesHistory
  let derivedMonthlySales = 0;
  let derivedMonthlyExpenses = 0;

  if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
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

  const monthlySales = derivedMonthlySales || businessProfile?.sales?.monthly || 12000;
  const monthlyExpenses = derivedMonthlyExpenses || businessProfile?.expenses || 8000;
  
  // Set default target to 125% of monthly sales if not specified
  const salesTarget = businessProfile?.targetValue || Math.round(monthlySales * 1.25); 

  // Radial Gauge Calculations
  const progressRatio = Math.min(1, monthlySales / salesTarget);
  const strokeDashOffset = 440 - (progressRatio * 220); // 440 is the half-circle circumference baseline

  // Recharts Monthly Revenue vs Target History
  let customBarData = [];
  if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
    const months = {};
    businessProfile.salesHistory.forEach(h => {
      if (h.date) {
        // format e.g. "May"
        const mName = new Date(h.date).toLocaleDateString('en-US', { month: 'short' });
        if (!months[mName]) {
          months[mName] = { sales: 0, expenses: 0 };
        }
        months[mName].sales += h.sales || 0;
        months[mName].expenses += h.expenses || 0;
      }
    });
    
    customBarData = Object.keys(months).map(m => ({
      name: m,
      Revenue: months[m].sales,
      Target: Math.round(months[m].sales * 1.1)
    }));
  }

  const barChartData = customBarData.length > 0 ? customBarData : [
    { name: 'Dec', Revenue: 10500, Target: 11000 },
    { name: 'Jan', Revenue: 11000, Target: 12000 },
    { name: 'Feb', Revenue: 9800, Target: 12000 },
    { name: 'Mar', Revenue: 13000, Target: 12000 },
    { name: 'Apr', Revenue: 11500, Target: 15000 },
    { name: 'May', Revenue: monthlySales, Target: salesTarget }
  ];

  // Dynamic Expense allocation Pie Chart
  const hasSuppliers = businessProfile?.suppliers && businessProfile.suppliers.length > 0;
  const supplierCost = hasSuppliers ? Math.round(monthlyExpenses * 0.55) : Math.round(monthlyExpenses * 0.5);
  const salariesCost = hasSuppliers ? Math.round(monthlyExpenses * 0.20) : Math.round(monthlyExpenses * 0.25);
  const rentCost = Math.round(monthlyExpenses * 0.15);
  const operationsCost = monthlyExpenses - supplierCost - salariesCost - rentCost;

  const pieChartData = [
    { name: language === 'mm' ? "ကုန်ပစ္စည်း ဖိုး" : "Supplier Costs", value: supplierCost },
    { name: language === 'mm' ? "လစာ များ" : "Salaries", value: salariesCost },
    { name: language === 'mm' ? "ဆိုင်ခန်းငှားခ" : "Rent & Utilities", value: rentCost },
    { name: language === 'mm' ? "အထွေထွေ" : "Operations", value: operationsCost }
  ];

  const PIE_COLORS = ['#6B2D7B', '#B85C8E', '#5C7B6B', '#C97755'];

  // Transactions list
  const transactions = [
    { type: 'income', descMm: "လက်လီ အရောင်းရငွေ", descEn: "Retail customer checkout", amount: "+340 MMK", time: "1 hour ago" },
    { type: 'expense', descMm: "ကုန်ပစ္စည်း သယ်ယူခ", descEn: "Supplier cargo transport fee", amount: "-120 MMK", time: "3 hours ago" },
    { type: 'income', descMm: "လက်ကား ရောင်းရငွေ", descEn: "Wholesale order payment", amount: "+1,200 MMK", time: "5 hours ago" },
    { type: 'expense', descMm: "စတိုးဆိုင် လျှပ်စစ်မီတာခ", descEn: "Shop electric utility bill", amount: "-250 MMK", time: "Yesterday" }
  ];

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
            {t.revenueVsTarget}
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
                fill="none" stroke="var(--accent)" strokeWidth="12"
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
                {Math.round(progressRatio * 100)}%
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t.currentLabel}: {monthlySales.toLocaleString()} MMK
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {t.targetLabel}: <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{salesTarget.toLocaleString()} MMK</span>
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
                color: activeMetric === 'revenue' ? 'var(--accent)' : 'var(--text-secondary)'
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
                color: activeMetric === 'expenses' ? 'var(--accent)' : 'var(--text-secondary)'
              }}
            >
              {language === 'mm' ? "အသုံးစရိတ်" : "Expenses"}
            </button>
          </div>
        </div>

        {/* Expenses Donut Chart Card */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
        }}>
          <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '16px' }}>
            {t.expenseBreakdown}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '160px', height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} MMK`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Donut Legend */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}>
              {pieChartData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[idx] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.value.toLocaleString()} MMK
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* PERIOD TOGGLE PANEL */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '8px' }}>
          {[
            { id: 'weekly', label: t.periodWeekly },
            { id: 'monthly', label: t.periodMonthly },
            { id: 'quarterly', label: t.periodQuarterly },
            { id: 'yearly', label: t.periodYearly }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                border: 'none', background: period === p.id ? 'var(--bg-surface)' : 'transparent',
                color: period === p.id ? 'var(--accent)' : 'var(--text-secondary)',
                padding: '6px 16px', borderRadius: '6px', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          <Calendar size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> MTD PERIODS ACTIVE
        </div>
      </section>

      {/* REVENUE VS TARGET BAR CHART */}
      <section style={{
        background: 'var(--bg-surface)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid var(--border-default)'
      }}>
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '24px' }}>
          {language === 'mm' ? "လအလိုက် အရောင်းရရှိမှု နှင့် ပန်းတိုင် နှိုင်းယှဉ်ချက်" : "Revenue vs. Target History"}
        </h3>
        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value} MMK`} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Bar dataKey="Revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Target" fill="var(--text-tertiary)" opacity={0.3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* RECENT TRANSACTIONS LEDGER */}
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {t.recentTransactions}
        </h3>
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          padding: '8px 24px',
          border: '1px solid var(--border-default)'
        }}>
          {transactions.map((tx, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: idx === transactions.length - 1 ? 'none' : '1px solid var(--border-default)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: tx.type === 'income' ? 'rgba(92, 123, 107, 0.1)' : 'rgba(201, 119, 85, 0.1)',
                  color: tx.type === 'income' ? 'var(--positive)' : 'var(--caution)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {language === 'mm' ? tx.descMm : tx.descEn}
                  </p>
                  <span className="mono" style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                    {tx.time}
                  </span>
                </div>
              </div>
              <div className="font-number" style={{
                fontWeight: 700, fontSize: '14px',
                color: tx.type === 'income' ? 'var(--positive)' : 'var(--caution)'
              }}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
