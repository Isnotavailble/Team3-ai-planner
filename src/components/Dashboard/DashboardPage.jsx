import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, AlertCircle, ShoppingBag, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { translations } from '../../data/translations';
import DashboardSkeleton from './DashboardSkeleton';
import api from '../../services/api';

// Simple module-level cache to prevent refetching when switching tabs
let dashboardCache = null;
let lastProfileString = null;
let lastLanguage = null;

const iconMap = {
  AlertCircle: AlertCircle,
  ShoppingBag: ShoppingBag,
  TrendingUp: TrendingUp,
  User: User
};

export default function DashboardPage({ businessProfile = {}, language = 'mm', isLoading = false }) {
  const navigate = useNavigate();
  const t = translations[language] || translations['en'];

  const [dashboardData, setDashboardData] = useState(() => {
    // If language changed, invalidate initial state cache
    if (lastLanguage !== language) return null;
    return dashboardCache;
  });
  const [isFetching, setIsFetching] = useState(!dashboardData);

  useEffect(() => {
    if (isLoading) return; // Wait until global profile finishes loading
    
    const currentProfileString = JSON.stringify(businessProfile);
    
    // Check cache
    if (dashboardCache && lastProfileString === currentProfileString && lastLanguage === language) {
      return;
    }

    async function loadData() {
      setIsFetching(true);
      const data = await api.getDashboardData(businessProfile, language);
      dashboardCache = data;
      lastProfileString = currentProfileString;
      lastLanguage = language;
      setDashboardData(data);
      setIsFetching(false);
    }
    
    loadData();
  }, [businessProfile, language, isLoading, dashboardData]);

  if (isLoading || isFetching || !dashboardData) {
    return <DashboardSkeleton />;
  }

  const {
    metrics,
    networkItems,
    attentionItems,
    topProducts
  } = dashboardData;

  const { weeklySales, monthlySales, monthlyExpenses, netProfit } = metrics;

  let clientChartData = [];
  if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
    clientChartData = businessProfile.salesHistory.map(h => ({
      name: h.date,
      sales: h.sales
    })).reverse();
  }

  // 2. Build dynamic KPI cards (Restricted to exactly 4 for the premium layout)
  const kpiCards = [];
  if (weeklySales !== null) {
    kpiCards.push({
      key: 'weeklySales',
      label: language === 'mm' ? "အပတ်စဉ် အရောင်း" : "Weekly Revenue",
      value: weeklySales,
      unit: 'MMK'
    });
  }
  if (monthlySales !== null) {
    kpiCards.push({
      key: 'monthlySales',
      label: language === 'mm' ? "လစဉ် အရောင်း" : "Monthly Revenue",
      value: monthlySales,
      unit: 'MMK'
    });
  }
  if (netProfit !== null) {
    kpiCards.push({
      key: 'netProfit',
      label: language === 'mm' ? "အမြတ်" : "Profit",
      value: netProfit,
      unit: 'MMK'
    });
  }
  if (monthlyExpenses !== null) {
    kpiCards.push({
      key: 'monthlyExpenses',
      label: language === 'mm' ? "လစဉ် အသုံးစရိတ်" : "Monthly Expenses",
      value: monthlyExpenses,
      unit: 'MMK'
    });
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. HEADER REGION (No Date) */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t.greeting || "မင်္ဂလာပါ"}{businessProfile?.ownerName ? `, ${businessProfile.ownerName}` : ''}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {t.briefingSub || "Here is your business overview"} &middot; {t.updatedJustNow || "Updated just now"}
          </p>
        </div>
      </header>

      {/* 2. UNIFIED KPI CARDS GRID */}
      <section>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px'
        }}>
          {kpiCards.length > 0 ? (
            kpiCards.map(card => (
              <div 
                key={card.key} 
                className="group"
                style={{ 
                  background: 'var(--bg-surface)', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = 'var(--accent-soft)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {card.label}
                  </span>
                </div>
                <div className="font-number" style={{ fontSize: '32px', color: 'var(--text-primary)', marginTop: '12px', fontWeight: 700 }}>
                  {card.value.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-tertiary)' }}>{card.unit}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-default)', borderRadius: '12px' }}>
              {language === 'mm' ? "ပြသရန် ဒေတာ မလုံလောက်ပါ" : "No active metrics to display. Add sales information to start."}
            </div>
          )}
        </div>
      </section>

      {/* 4. LOWER DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Left Column: Sales Chart */}
          <section className="space-y-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '28px' }}>
              <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {language === 'mm' ? "အရောင်း မှတ်တမ်း" : "Sales History"}
              </h3>
            </div>
            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-default)', height: '280px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
              {clientChartData && clientChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clientChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} 
                      dy={12} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(value) => `${value} MMK`}
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} 
                      dx={-10}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} MMK`, language === 'mm' ? "အရောင်း (Sales)" : "Sales"]}
                      contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                      itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      cursor={{ stroke: 'var(--border-default)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-surface)', stroke: 'var(--accent)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--bg-surface)', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  {language === 'mm' ? "ပြသရန် ဒေတာ မလုံလောက်ပါ" : "Data is not enough"}
                </div>
              )}
            </div>
          </section>

          {/* Left Column: Needs Attention Queue (Raw Icons) */}
        <section className="space-y-4">
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.needsAttentionTitle || "အထူးဂရုပြုရန်"}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attentionItems && attentionItems.length > 0 ? attentionItems.map((item, idx) => {
              const ItemIcon = iconMap[item.icon] || AlertCircle;
              return (
                <div 
                  key={idx}
                  onClick={() => {
                    if (item.titleEn === 'Not enough data' || item.descEn?.includes('Profile')) {
                      navigate('/workspace/profile');
                    }
                  }}
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {/* Raw inline icon without background circle */}
                  <div style={{ color: item.color, flexShrink: 0, marginTop: '2px' }}>
                    <ItemIcon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {language === 'mm' ? item.titleMm : item.titleEn}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {language === 'mm' ? item.descMm : item.descEn}
                    </p>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-tertiary)', alignSelf: 'center' }} />
                </div>
              );
            }) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px', border: '1px dashed var(--border-default)', borderRadius: '12px' }}>
                {language === 'mm' ? "အထူးဂရုပြုရန် မရှိပါ" : "All good! Nothing needs attention right now."}
              </div>
            )}
          </div>
        </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Right Column: Top Products list */}
        <section className="space-y-4">
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.topProductsTitle || "အရောင်းရဆုံး ပစ္စည်းများ"}
          </h3>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            height: '240px',
            overflowY: 'auto'
          }}>
            {topProducts && topProducts.length > 0 ? topProducts.map((prod, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 0', 
                  borderBottom: idx === topProducts.length - 1 ? 'none' : '1px solid var(--border-default)'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {language === 'mm' ? prod.nameMm : prod.nameEn}
                </span>
                <span className="font-number" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {prod.value}
                </span>
              </div>
            )) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                {language === 'mm' ? "ပြသရန် ဒေတာ မလုံလောက်ပါ" : "Not enough data to show"}
              </div>
            )}
          </div>
        </section>

          {/* Right Column: Business Network (Replacing Recent Activity) */}
        <section className="space-y-4">
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {language === 'mm' ? "လုပ်ငန်းကွန်ရက်" : "Business Network"}
          </h3>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '8px 20px',
            border: '1px solid var(--border-default)'
          }}>
            {networkItems && networkItems.length > 0 ? networkItems.map((net, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: idx === networkItems.length - 1 ? 'none' : '1px solid var(--border-default)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <User size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {net.name}
                    </p>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      {net.detail}
                    </span>
                  </div>
                </div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {net.contact}
                </div>
              </div>
            )) : (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                {language === 'mm' ? "ပြသရန် ဒေတာ မလုံလောက်ပါ" : "Not enough data to show"}
              </div>
            )}
          </div>
        </section>
        </div>
      </div>

    </div>
  );
}
