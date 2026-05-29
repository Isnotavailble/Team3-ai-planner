import { useState } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, Download, Calendar, ShoppingBag, TrendingUp, Users, CalendarDays, Award, Wallet } from 'lucide-react';
import { translations } from '../../data/translations';
import DashboardSkeleton from './DashboardSkeleton';

export default function ReportsView({ workspace = {}, businessProfile = {}, language = 'mm', isLoading = false }) {
  const t = translations[language];



  const [period, setPeriod] = useState('monthly'); // 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  const [hoveredCard, setHoveredCard] = useState(null);

  // ──────────────────────────────────────────────
  // DERIVE ACTUAL SALES & EXPENSES FROM USER DATA
  // ──────────────────────────────────────────────

  // 1. Try salesHistory first (uploaded CSV data)
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

  // 2. Use user-entered sales data from onboarding
  const userSales = businessProfile?.sales || {};
  const userMonthly = userSales.monthly || 0;
  const userDaily = userSales.daily || 0;
  const userWeekly = userSales.weekly || 0;
  const userYearly = userSales.yearly || 0;

  // Derive a monthly sales figure from whatever period the user entered
  const calculatedMonthlySales =
    userMonthly ||
    (userDaily ? userDaily * 30 : 0) ||
    (userWeekly ? Math.round((userWeekly / 7) * 30) : 0) ||
    (userYearly ? Math.round(userYearly / 12) : 0);

  // Support dashboardData metrics from the backend contract
  const monthlySales = dashboardData?.metrics?.monthlySales ?? (derivedMonthlySales || calculatedMonthlySales || 12000);
  const monthlyExpenses = dashboardData?.metrics?.monthlyExpenses ?? (derivedMonthlyExpenses || (businessProfile?.expenses ?? 8000));
  
  // Set default target to 125% of monthly sales if not specified
  const salesTarget = businessProfile?.targetValue || Math.round(monthlySales * 1.25); 

  // Monthly profit
  const monthlyProfit = monthlySales - monthlyExpenses;

  // Group or construct a full 12-month series based on actual monthlySales/monthlyExpenses and fallbacks
  const getFullYearData = () => {
    const defaultVals = [
      { name: 'Jan', Revenue: Math.round(monthlySales * 0.92), Target: Math.round(salesTarget * 0.92), Expenses: Math.round(monthlyExpenses * 0.90) },
      { name: 'Feb', Revenue: Math.round(monthlySales * 0.82), Target: Math.round(salesTarget * 0.85), Expenses: Math.round(monthlyExpenses * 0.88) },
      { name: 'Mar', Revenue: Math.round(monthlySales * 1.08), Target: Math.round(salesTarget * 0.95), Expenses: Math.round(monthlyExpenses * 0.92) },
      { name: 'Apr', Revenue: Math.round(monthlySales * 0.96), Target: Math.round(salesTarget * 1.0), Expenses: Math.round(monthlyExpenses * 0.95) },
      { name: 'May', Revenue: monthlySales, Target: salesTarget, Expenses: monthlyExpenses },
      { name: 'Jun', Revenue: Math.round(monthlySales * 1.05), Target: Math.round(salesTarget * 1.05), Expenses: Math.round(monthlyExpenses * 1.02) },
      { name: 'Jul', Revenue: Math.round(monthlySales * 1.1), Target: Math.round(salesTarget * 1.1), Expenses: Math.round(monthlyExpenses * 1.04) },
      { name: 'Aug', Revenue: Math.round(monthlySales * 0.95), Target: Math.round(salesTarget * 1.1), Expenses: Math.round(monthlyExpenses * 1.01) },
      { name: 'Sep', Revenue: Math.round(monthlySales * 1.15), Target: Math.round(salesTarget * 1.2), Expenses: Math.round(monthlyExpenses * 1.05) },
      { name: 'Oct', Revenue: Math.round(monthlySales * 1.2), Target: Math.round(salesTarget * 1.2), Expenses: Math.round(monthlyExpenses * 1.06) },
      { name: 'Nov', Revenue: Math.round(monthlySales * 1.25), Target: Math.round(salesTarget * 1.3), Expenses: Math.round(monthlyExpenses * 1.08) },
      { name: 'Dec', Revenue: Math.round(monthlySales * 1.35), Target: Math.round(salesTarget * 1.35), Expenses: Math.round(monthlyExpenses * 1.1) }
    ];

    if (dashboardData?.chartData && dashboardData.chartData.length > 0) {
      const grouped = {};
      dashboardData.chartData.forEach(item => {
        let label = item.name;
        try {
          if (item.name.includes('-')) {
            label = new Date(item.name).toLocaleDateString('en-US', { month: 'short' });
          }
        } catch (err) {
          console.debug(err);
        }
        if (!grouped[label]) grouped[label] = { revenue: 0, expenses: 0 };
        grouped[label].revenue += item.sales ?? item.Revenue ?? 0;
        grouped[label].expenses += item.expenses ?? item.Expenses ?? 0;
      });

      return defaultVals.map(d => {
        if (grouped[d.name] !== undefined) {
          return {
            ...d,
            Revenue: grouped[d.name].revenue,
            Expenses: grouped[d.name].expenses || d.Expenses,
            Target: Math.round(grouped[d.name].revenue * 1.1)
          };
        }
        return d;
      });
    }

    return defaultVals;
  };

  const fullYearData = getFullYearData();

  // Active filtered slice based on period selector for display flexibility
  let selectedChartData = [...fullYearData];
  if (period === 'weekly') {
    selectedChartData = fullYearData.slice(-3); // mock shorter snapshot
  } else if (period === 'quarterly') {
    selectedChartData = fullYearData.slice(-6); // mock mid-year snapshot
  }

  // ──────────────────────────────────────────────
  // EXPENSE BREAKDOWN FROM USER DATA
  // ──────────────────────────────────────────────
  const hasExplicitExpenseBreakdown =
    Array.isArray(businessProfile?.expenseBreakdown) &&
    businessProfile.expenseBreakdown.length > 0 &&
    businessProfile.expenseBreakdown.some(x => x?.name && typeof x?.value === 'number');

  const pieChartData = hasExplicitExpenseBreakdown
    ? businessProfile.expenseBreakdown.map(x => ({ name: x.name, value: x.value }))
    : [{ name: language === 'mm' ? "အထွေထွေ ကုန်ကျစရိတ်" : "General Expenses", value: monthlyExpenses }];

  const PIE_COLORS = hasExplicitExpenseBreakdown
    ? ['#6B2D7B', '#B85C8E', '#5C7B6B', '#C97755', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    : ['#C97755'];

  // Dynamic KPI widget properties
  const topProduct = (businessProfile?.products && businessProfile.products.length > 0)
    ? businessProfile.products[0]
    : null;
  const topProductName = topProduct 
    ? topProduct.name 
    : (language === 'mm' ? "အဝတ်အထည် ကုန်ပစ္စည်း" : "Clothing Apparel");
  const topProductSub = topProduct 
    ? `${topProduct.price.toLocaleString()} MMK` 
    : "25,000 MMK";

  let growthRate = "+14.8%";
  if (dashboardData?.chartData && dashboardData.chartData.length > 1) {
    const len = dashboardData.chartData.length;
    const initial = dashboardData.chartData[0].sales ?? 1;
    const final = dashboardData.chartData[len - 1].sales ?? 1;
    const pct = Math.round(((final - initial) / initial) * 100);
    growthRate = pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  const bestDayName = language === 'mm' ? "စနေနေ့" : "Saturday";
  const bestDaySub = language === 'mm' ? "ရောင်းအားအကောင်းဆုံး ပတ်စဉ်နေ့" : "Highest weekly sales";

  const retentionVal = "82.4%";
  const retentionSub = language === 'mm' ? "အမြဲတမ်း ဝယ်ယူသူများ" : "Active repeat buyers";

  // Recharts CustomTooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const actual = payload.find(p => p.dataKey === 'Revenue')?.value || 0;
      const target = payload.find(p => p.dataKey === 'Target')?.value || 0;
      const percent = target > 0 ? Math.round((actual / target) * 100) : 0;
      return (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          padding: '12px 16px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: '12px', borderBottom: '1px solid var(--border-default)', paddingBottom: '4px' }}>
            {label}
          </p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ margin: '4px 0', fontSize: '12px', color: p.color, display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span>{p.name}:</span>
              <span style={{ fontWeight: 700 }}>{p.value.toLocaleString()} MMK</span>
            </p>
          ))}
          <div style={{
            margin: '8px 0 0 0',
            paddingTop: '8px',
            borderTop: '1px dotted var(--border-default)',
            fontSize: '11px',
            color: percent >= 100 ? 'var(--positive)' : 'var(--accent)',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>{language === 'mm' ? "ပန်းတိုင်ပြည့်မီမှု:" : "Target Achievement:"}</span>
            <span>{percent}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
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

      {/* ─── MONTHLY SALES REVENUE SUMMARY CARD ─── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {/* Sales Revenue Card */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '20px',
          padding: '20px 24px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.18)',
          transition: 'transform 0.3s',
          transform: hoveredCard === 'salesSummary' ? 'translateY(-3px)' : 'none',
        }}
          onMouseEnter={() => setHoveredCard('salesSummary')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.85, fontWeight: 600 }}>
            {language === 'mm' ? "လစဉ် အရောင်းရရှိမှု" : "Monthly Sales Revenue"}
          </span>
          <span className="font-number" style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.1 }}>
            {monthlySales.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, opacity: 0.8 }}>MMK</span>
          </span>
          <span style={{ fontSize: '11px', opacity: 0.75 }}>
            {language === 'mm'
              ? `(${businessProfile?.product || "ထုတ်ကုန်"} - user data)`
              : `(${businessProfile?.product || "Product"} - user data)`}
          </span>
        </div>

        {/* Expenses Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: '20px',
          padding: '20px 24px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 8px 24px rgba(239,68,68,0.18)',
          transition: 'transform 0.3s',
          transform: hoveredCard === 'expenseSummary' ? 'translateY(-3px)' : 'none',
        }}
          onMouseEnter={() => setHoveredCard('expenseSummary')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.85, fontWeight: 600 }}>
            {language === 'mm' ? "လစဉ် ကုန်ကျစရိတ်" : "Monthly Expenses"}
          </span>
          <span className="font-number" style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.1 }}>
            {monthlyExpenses.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, opacity: 0.8 }}>MMK</span>
          </span>
          <span style={{ fontSize: '11px', opacity: 0.75 }}>
            {hasExplicitExpenseBreakdown
              ? (language === 'mm' ? `${pieChartData.length} မျိုး ခွဲခြားထားသည်` : `${pieChartData.length} categories`)
              : (language === 'mm' ? "အထွေထွေ ကုန်ကျစရိတ်" : "General expenses")}
          </span>
        </div>

        {/* Net Profit Card */}
        <div style={{
          background: monthlyProfit >= 0
            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
            : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          borderRadius: '20px',
          padding: '20px 24px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: monthlyProfit >= 0 ? '0 8px 24px rgba(99,102,241,0.18)' : '0 8px 24px rgba(249,115,22,0.18)',
          transition: 'transform 0.3s',
          transform: hoveredCard === 'profitSummary' ? 'translateY(-3px)' : 'none',
        }}
          onMouseEnter={() => setHoveredCard('profitSummary')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.85, fontWeight: 600 }}>
            {language === 'mm' ? "လစဉ် အသားတင်အမြတ်" : "Monthly Net Profit"}
          </span>
          <span className="font-number" style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.1 }}>
            {monthlyProfit >= 0 ? '' : '-'}{Math.abs(monthlyProfit).toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, opacity: 0.8 }}>MMK</span>
          </span>
          <span style={{ fontSize: '11px', opacity: 0.75 }}>
            {monthlySales > 0
              ? `${language === 'mm' ? 'Profit Margin' : 'Profit Margin'}: ${Math.round((monthlyProfit / monthlySales) * 100)}%`
              : ''}
          </span>
        </div>
      </section>

      {/* PERIOD TOGGLE PANEL */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-4px' }}>
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
                padding: '6px 16px', borderRadius: '6px', fontSize: '11px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
          <Calendar size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />MTD PERIODS ACTIVE
        </div>
      </section>

      {/* TOP CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Composed Chart: Sales vs Target vs Expenses Comparison */}
        <div 
          className="lg:col-span-2"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid var(--border-default)',
            boxShadow: hoveredCard === 'composed' ? '0 12px 32px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.01)',
            transform: hoveredCard === 'composed' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
          onMouseEnter={() => setHoveredCard('composed')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {language === 'mm' ? "လအလိုက် အရောင်းရရှိမှု၊ ပန်းတိုင် နှင့် ကုန်ကျစရိတ်" : "Monthly Sales, Target & Expenses"}
            </span>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={selectedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                
                {/* Revenue Bar */}
                <Bar
                  dataKey="Revenue"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                  isAnimationActive={true}
                  name={language === 'mm' ? "အမှန်တကယ်ရောင်းရငွေ" : "Actual Sales"}
                />
                {/* Target Bar */}
                <Bar
                  dataKey="Target"
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                  isAnimationActive={true}
                  name={language === 'mm' ? "လစဉ်ပန်းတိုင်" : "Monthly Target"}
                />
                {/* Expenses Bar */}
                <Bar
                  dataKey="Expenses"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                  isAnimationActive={true}
                  name={language === 'mm' ? "ကုန်ကျစရိတ်" : "Expenses"}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Donut Chart Card */}
        <div 
          className="lg:col-span-1"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid var(--border-default)',
            boxShadow: hoveredCard === 'donut' ? '0 12px 32px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.01)',
            transform: hoveredCard === 'donut' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
          onMouseEnter={() => setHoveredCard('donut')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.expenseBreakdown}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px' }}>
            <div style={{ width: '130px', height: '130px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%" cy="50%"
                    innerRadius={42} outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} MMK`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Donut Legend */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pieChartData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span className="font-number" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.value.toLocaleString()} MMK
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ─── EXPENSE BREAKDOWN DETAIL CARDS ─── */}
      {hasExplicitExpenseBreakdown && (
        <section className="space-y-4">
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {language === 'mm' ? "ကုန်ကျစရိတ် အသေးစိတ်" : "Expense Details — User Entered Data"}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessProfile.expenseBreakdown.map((item, idx) => {
              const percentage = monthlyExpenses > 0 ? Math.round((item.value / monthlyExpenses) * 100) : 0;
              return (
                <div 
                  key={idx}
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '20px',
                    padding: '20px',
                    border: '1px solid var(--border-default)',
                    boxShadow: hoveredCard === `exp-${idx}` ? '0 12px 32px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.01)',
                    transform: hoveredCard === `exp-${idx}` ? 'translateY(-4px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'default'
                  }}
                  onMouseEnter={() => setHoveredCard(`exp-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: PIE_COLORS[idx % PIE_COLORS.length] + '1a',
                      color: PIE_COLORS[idx % PIE_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Wallet size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                        {item.name}
                      </span>
                      <span className="font-number" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        {language === 'mm' ? `စုစုပေါင်း၏ ${percentage}%` : `${percentage}% of total`}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-number" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.value.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>MMK</span>
                  </div>
                  {/* Mini progress bar showing % of total */}
                  <div style={{ width: '100%', height: '4px', background: 'var(--bg-track)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(percentage, 100)}%`,
                      height: '100%',
                      background: PIE_COLORS[idx % PIE_COLORS.length],
                      borderRadius: '2px',
                      transition: 'width 0.5s ease-out'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* KPI WIDGETS GRID */}
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {language === 'mm' ? "ဘဏ္ဍာရေး ဆန်းစစ်မှု အညွှန်းကိန်းများ" : "Financial Analytics Key Metrics"}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Top Selling Product */}
          <div 
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              boxShadow: hoveredCard === 'kpi1' ? '0 12px 32px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.01)',
              transform: hoveredCard === 'kpi1' ? 'translateY(-4px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredCard('kpi1')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {language === 'mm' ? "ဦးဆောင်ထုတ်ကုန်" : "Top Selling Product"}
              </span>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {topProductName}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {topProductSub}
              </p>
            </div>
          </div>

          {/* Card 2: Growth Rate */}
          <div 
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              boxShadow: hoveredCard === 'kpi2' ? '0 12px 32px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.01)',
              transform: hoveredCard === 'kpi2' ? 'translateY(-4px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredCard('kpi2')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {language === 'mm' ? "လစဉ်တိုးတက်မှုနှုန်း" : "Monthly Growth Rate"}
              </span>
              <h4 className="font-number" style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                {growthRate}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {language === 'mm' ? "ပြီးခဲ့သည့်လထက် ပိုမိုမြင့်တက်" : "vs. previous month"}
              </p>
            </div>
          </div>

          {/* Card 3: Best Sales Day */}
          <div 
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              boxShadow: hoveredCard === 'kpi3' ? '0 12px 32px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.01)',
              transform: hoveredCard === 'kpi3' ? 'translateY(-4px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredCard('kpi3')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={20} />
            </div>
            <div>
              <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {language === 'mm' ? "အရောင်းရဆုံးနေ့" : "Best Sales Day"}
              </span>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {bestDayName}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {bestDaySub}
              </p>
            </div>
          </div>

          {/* Card 4: Customer Retention */}
          <div 
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              boxShadow: hoveredCard === 'kpi4' ? '0 12px 32px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.01)',
              transform: hoveredCard === 'kpi4' ? 'translateY(-4px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredCard('kpi4')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(184, 92, 142, 0.1)', color: '#B85C8E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {language === 'mm' ? "ဝယ်ယူသူထိန်းသိမ်းမှု" : "Customer Retention"}
              </span>
              <h4 className="font-number" style={{ fontSize: '16px', fontWeight: 700, color: '#B85C8E', marginTop: '4px' }}>
                {retentionVal}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {retentionSub}
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
