import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Pin, ArrowRight, AlertCircle, FileText, ShoppingBag, TrendingUp, HelpCircle, MessageSquare, Database, FileSpreadsheet } from 'lucide-react';
import { translations } from '../../data/translations';

export default function DashboardPage({ workspace = {}, businessProfile = {}, selectedNodeId, handleSelectNode, language = 'mm' }) {
  const navigate = useNavigate();
  const t = translations[language];

  // Current Date String in Mono Caps
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  }).toUpperCase().replace(',', ' ·');

  // Dynamic Metrics based on onboarding inputs
  const dailySales = businessProfile?.sales?.daily || 400;
  const weeklySales = businessProfile?.sales?.weekly || (dailySales * 7);
  const monthlySales = businessProfile?.sales?.monthly || (dailySales * 30) || 12000;
  const monthlyExpenses = businessProfile?.expenses || 8000;
  const netProfit = monthlySales - monthlyExpenses;

  // Recent activity list
  const recentFacts = [
    { source: 'telegram', descMm: "ဦးအောင်ကျော် ဆီ ၂ ပျား ဝယ်ယူသွားပြီး ကျပ် ၁၅,၀၀၀ ကျန်ရှိသည်", descEn: "U Aung Kyaw took 2 viss of oil, owes $15", amount: "15,000 MMK", time: "10 mins ago" },
    { source: 'voice', descMm: "ဆန် ၂၀ အိတ်ရောင်းရသည်။ စုစုပေါင်း ၁၂ သိန်းရရှိသည်", descEn: "Sold 20 bags of rice for 1.2M MMK", amount: "1,200,000 MMK", time: "1 hour ago" },
    { source: 'pdf', descMm: "လက်ကား ပံ့ပိုးသူ ဆီဆိုင်မှ ငွေတောင်းခံလွှာ လက်ခံရရှိသည်", descEn: "Invoice received from wholesale supplier", amount: "350,000 MMK", time: "4 hours ago" },
    { source: 'excel', descMm: "လက်ကျန်စာရင်း ဒေတာ ၂၄ ခုအား အလိုအလျောက် သွင်းယူပြီးသည်", descEn: "Spreadsheet import completed: 24 inventory items", amount: "24 items", time: "Yesterday" }
  ];

  // Needs Attention items
  const attentionItems = [
    { type: 'receivables', titleMm: "ဦးအောင်ကျော် - ပေးရန်ကျန်ငွေ ရက်လွန်နေသည်", titleEn: "U Aung Kyaw - Receivable outstanding", descMm: "၁၅ ရက်ကျော် ရက်လွန်နေသဖြင့် အကြောင်းကြားရန် လိုအပ်သည်", descEn: "Overdue by 15 days, send reminder", icon: AlertCircle, color: 'var(--caution)' },
    { type: 'inventory', titleMm: "ဆန်ကုန်စည်လက်ကျန် နည်းနေပါသည်", titleEn: "Rice bags inventory level low", descMm: "လက်ကျန် ၃ အိတ်သာရှိတော့သဖြင့် ထပ်မံမှာယူရန် အကြံပြုပါသည်", descEn: "Only 3 bags left, reorder threshold reached", icon: ShoppingBag, color: 'var(--critical)' },
    { type: 'competitor', titleMm: "ပြိုင်ဘက် ဆိုင်ကြီးမှ စျေးနှုန်း ၅% လျှော့ချလိုက်သည်", titleEn: "Rival Shop cut prices by 5%", descMm: "စက်ဆန်းရပ်ကွက်ရှိ ဆိုင်ကြီးမှ ဆန်စျေးနှုန်းများ စတင်လျှော့ချလာသည်", descEn: "Competitor price drop detected in neighboring ward", icon: TrendingUp, color: 'var(--accent)' }
  ];

  // Top products
  const topProducts = [
    { nameMm: "ဆန် (Rice Bags)", nameEn: "Rice Bags", value: "850,000 MMK", pct: 75 },
    { nameMm: "စားအုန်းဆီ (Cooking Oil)", nameEn: "Cooking Oil", value: "240,000 MMK", pct: 45 },
    { nameMm: "ပဲအမျိုးမျိုး (Pulses)", nameEn: "Pulses & Beans", value: "110,000 MMK", pct: 20 }
  ];

  // Source Icons helper
  const getSourceIcon = (source) => {
    switch (source) {
      case 'telegram': return <MessageSquare size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'excel': return <FileSpreadsheet size={16} />;
      case 'voice':
      default: return <Database size={16} />;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. HEADER REGION */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="mono font-semibold" style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.15em' }}>
            {formattedDate}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
            {t.greeting}, {businessProfile?.product ? (language === 'mm' ? "လုပ်ငန်းရှင်" : "Owner") : "Anya"}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {t.briefingSub} &middot; {t.updatedJustNow}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications Bell */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', cursor: 'pointer'
          }}>
            <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--accent)', position: 'absolute',
              top: '8px', right: '8px', border: '2px solid var(--bg-surface)'
            }} />
          </div>
          
          {/* Quick Profile Link */}
          <div 
            onClick={() => navigate('/workspace/profile')}
            style={{
              height: '36px', padding: '0 12px', borderRadius: '18px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={12} style={{ color: 'var(--accent)' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {businessProfile?.product || (language === 'mm' ? "လုပ်ငန်းစု" : "Strivo Profile")}
            </span>
          </div>
        </div>
      </header>

      {/* 2. HERO PINNED CARDS STRIP */}
      <section>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          
          {/* Card 1: Today's Sales */}
          <div 
            className="flex-1 min-w-[280px]"
            style={{
              background: 'var(--bg-gradient-1)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          >
            <Pin size={14} style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--accent)', opacity: 0.6 }} />
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.salesToday}
            </span>
            <div className="font-number" style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 700 }}>
              ${dailySales.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{language === 'mm' ? "ကျပ်" : "USD"}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {language === 'mm' ? "ပျမ်းမျှ နေ့စဉ်ရောင်းအားပေါ် အခြေခံထားသည်" : "Calculated from daily averages"}
            </div>
            {/* Sparkline track */}
            <div style={{ width: '100%', height: '4px', background: 'rgba(107, 45, 123, 0.1)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: 'var(--accent)' }} />
            </div>
          </div>

          {/* Card 2: Receivables */}
          <div 
            className="flex-1 min-w-[280px]"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              position: 'relative'
            }}
          >
            <Pin size={14} style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-tertiary)' }} />
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.outstandingReceivables}
            </span>
            <div className="font-number" style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 700 }}>
              $2,450 <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{language === 'mm' ? "ကျပ်" : "USD"}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              <span style={{ color: 'var(--caution)', fontWeight: 600 }}>{language === 'mm' ? "၂ ဆိုင် ကျန်ရှိနေသည်" : "2 invoices outstanding"}</span>
            </div>
            {/* Sparkline track */}
            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{ width: '40%', height: '100%', background: 'var(--caution)' }} />
            </div>
          </div>

          {/* Card 3: Weekly Profit */}
          <div 
            className="flex-1 min-w-[280px]"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              position: 'relative'
            }}
          >
            <Pin size={14} style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-tertiary)' }} />
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.weeklyProfit}
            </span>
            <div className="font-number" style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 700 }}>
              ${Math.round(netProfit / 4).toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{language === 'mm' ? "ကျပ်" : "USD"}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              <span style={{ color: 'var(--positive)', fontWeight: 600 }}>+8.2% {language === 'mm' ? "တိုးတက်လာသည်" : "increase this week"}</span>
            </div>
            {/* Sparkline track */}
            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: 'var(--positive)' }} />
            </div>
          </div>

        </div>
      </section>

      {/* 3. WEEK STRIP GRID */}
      <section style={{
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
        padding: '16px 24px',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div>
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.mtdRevenue}
            </span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              ${monthlySales.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.outstandingCash}
            </span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              $3,120
            </div>
          </div>
          <div>
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.itemsLow}
            </span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              3 {language === 'mm' ? "မျိုး" : "Items"}
            </div>
          </div>
        </div>
      </section>

      {/* 4. TWO-COLUMN LAYOUT: NEEDS ATTENTION + TOP PRODUCTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left Column: Needs Attention Queue */}
        <section className="space-y-4">
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.needsAttentionTitle}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attentionItems.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: item.color === 'var(--critical)' ? 'rgba(163, 61, 92, 0.1)' : item.color === 'var(--caution)' ? 'rgba(201, 119, 85, 0.1)' : 'rgba(107, 45, 123, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color, flexShrink: 0
                }}>
                  <item.icon size={18} />
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
            ))}
          </div>
        </section>

        {/* Right Column: Top Products list */}
        <section className="space-y-4">
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.topProductsTitle}
          </h3>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {topProducts.map((prod, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {idx + 1}. {language === 'mm' ? prod.nameMm : prod.nameEn}
                  </span>
                  <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{prod.value}</span>
                </div>
                {/* Custom Gradient progress bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${prod.pct}%`, height: '100%',
                    background: 'linear-gradient(90deg, var(--accent) 0%, rgba(184, 92, 142, 0.7) 100%)',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* 5. RECENT ACTIVITY (INGESTED ACTIVITY FEED) */}
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {t.recentActivityTitle}
        </h3>
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          padding: '8px 20px',
          border: '1px solid var(--border-default)'
        }}>
          {recentFacts.map((fact, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: idx === recentFacts.length - 1 ? 'none' : '1px solid var(--border-default)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--bg-icon-neutral)', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {getSourceIcon(fact.source)}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {language === 'mm' ? fact.descMm : fact.descEn}
                  </p>
                  <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                    {t.sourceBadge}: {fact.source.toUpperCase()} &middot; {fact.time}
                  </span>
                </div>
              </div>
              <div className="font-number" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                {fact.amount}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
