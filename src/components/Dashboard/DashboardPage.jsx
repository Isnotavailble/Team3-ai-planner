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
  let derivedDaily = 0;
  if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
    const total = businessProfile.salesHistory.reduce((sum, h) => sum + (h.sales || 0), 0);
    derivedDaily = Math.round(total / businessProfile.salesHistory.length);
  }

  const dailySales = derivedDaily || businessProfile?.sales?.daily || 400;
  const weeklySales = businessProfile?.sales?.weekly || (dailySales * 7);
  const monthlySales = businessProfile?.sales?.monthly || (dailySales * 30) || 12000;
  const monthlyExpenses = businessProfile?.expenses || 8000;
  const netProfit = monthlySales - monthlyExpenses;

  // Recent activity list - dynamically built using customer, products and suppliers lists
  const recentFacts = [];
  
  if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
    recentFacts.push({
      source: 'excel',
      descMm: `အရောင်းမှတ်တမ်းဖိုင် (ဒေတာ ${businessProfile.salesHistory.length} ရက်စာ) တင်သွင်းပြီးပါပြီ`,
      descEn: `Sales history imported: ${businessProfile.salesHistory.length} days of data loaded`,
      amount: `${businessProfile.salesHistory.length} days`,
      time: "Just now"
    });
  }

  if (businessProfile?.customers && businessProfile.customers.length > 0) {
    const cust = businessProfile.customers[0];
    const prodNameMm = businessProfile.products && businessProfile.products.length > 0 ? businessProfile.products[0].name : "ဆန်";
    const prodNameEn = businessProfile.products && businessProfile.products.length > 0 ? businessProfile.products[0].name : "Rice Bags";
    
    recentFacts.push({
      source: 'telegram',
      descMm: `${cust.name} မှ ${prodNameMm} ဝယ်ယူသွားပြီး ကျပ် ၁၅,၀၀၀ ကျန်ရှိသည်`,
      descEn: `${cust.name} took ${prodNameEn}, owes 15,000 MMK`,
      amount: "15,000 MMK",
      time: "10 mins ago"
    });
  }

  if (businessProfile?.products && businessProfile.products.length > 0) {
    const prod = businessProfile.products[0];
    const qty = 20;
    const totalVal = prod.price * qty;
    recentFacts.push({
      source: 'voice',
      descMm: `${prod.name} ${qty} ခု ရောင်းရသည်။ စုစုပေါင်း ကျပ် ${totalVal.toLocaleString()} ရရှိသည်`,
      descEn: `Sold ${qty} units of ${prod.name} for ${totalVal.toLocaleString()} MMK`,
      amount: `${totalVal.toLocaleString()} MMK`,
      time: "1 hour ago"
    });
  }

  if (businessProfile?.suppliers && businessProfile.suppliers.length > 0) {
    const supp = businessProfile.suppliers[0];
    recentFacts.push({
      source: 'pdf',
      descMm: `လက်ကား ပံ့ပိုးသူ ${supp.name} မှ ကုန်ပစ္စည်းပေးပို့လွှာ လက်ခံရရှိသည်`,
      descEn: `Invoice received from wholesale supplier ${supp.name}`,
      amount: "350,000 MMK",
      time: "4 hours ago"
    });
  }

  // Fallbacks if list is too short
  if (recentFacts.length < 4) {
    const fallbacks = [
      { source: 'telegram', descMm: "ဦးအောင်ကျော် ဆီ ၂ ပျား ဝယ်ယူသွားပြီး ကျပ် ၁၅,၀၀၀ ကျန်ရှိသည်", descEn: "U Aung Kyaw took 2 viss of oil, owes 15,000 MMK", amount: "15,000 MMK", time: "10 mins ago" },
      { source: 'voice', descMm: "ဆန် ၂၀ အိတ်ရောင်းရသည်။ စုစုပေါင်း ၁၂ သိန်းရရှိသည်", descEn: "Sold 20 bags of rice for 1.2M MMK", amount: "1,200,000 MMK", time: "1 hour ago" },
      { source: 'pdf', descMm: "လက်ကား ပံ့ပိုးသူ ဆီဆိုင်မှ ငွေတောင်းခံလွှာ လက်ခံရရှိသည်", descEn: "Invoice received from wholesale supplier", amount: "350,000 MMK", time: "4 hours ago" },
      { source: 'excel', descMm: "လက်ကျန်စာရင်း ဒေတာ ၂၄ ခုအား အလိုအလျောက် သွင်းယူပြီးသည်", descEn: "Spreadsheet import completed: 24 inventory items", amount: "24 items", time: "Yesterday" }
    ];
    
    fallbacks.forEach(fb => {
      if (recentFacts.length < 4 && !recentFacts.some(f => f.source === fb.source)) {
        recentFacts.push(fb);
      }
    });
  }

  // Needs Attention items - dynamically customized using custom input directories
  const overdueCust = businessProfile?.customers && businessProfile.customers.length > 0 ? businessProfile.customers[0].name : "ဦးအောင်ကျော်";
  
  const lowStockProdMm = businessProfile?.products && businessProfile.products.length > 0 ? `${businessProfile.products[0].name} ကုန်စည်လက်ကျန် နည်းနေပါသည်` : "ဆန်ကုန်စည်လက်ကျန် နည်းနေပါသည်";
  const lowStockProdEn = businessProfile?.products && businessProfile.products.length > 0 ? `${businessProfile.products[0].name} inventory level low` : "Rice bags inventory level low";
  const lowStockDescMm = businessProfile?.products && businessProfile.products.length > 0 ? `လက်ကျန် ၃ ခုသာရှိတော့သဖြင့် သတ်မှတ်ချက် ${businessProfile.thresholds?.inventoryLow || 10} အတိုင်း ပြန်လည်မှာယူရန် အကြံပြုပါသည်` : "လက်ကျန် ၃ အိတ်သာရှိတော့သဖြင့် ထပ်မံမှာယူရန် အကြံပြုပါသည်";
  const lowStockDescEn = businessProfile?.products && businessProfile.products.length > 0 ? `Only 3 units left, reorder threshold of ${businessProfile.thresholds?.inventoryLow || 10} reached` : "Only 3 bags left, reorder threshold reached";

  const mainRival = businessProfile?.rivals && businessProfile.rivals.length > 0 ? businessProfile.rivals[0].name : "ပြိုင်ဘက် ဆိုင်ကြီး";
  const mainRivalEn = businessProfile?.rivals && businessProfile.rivals.length > 0 ? businessProfile.rivals[0].name : "Rival Shop";
  const rivalStrategyMm = businessProfile?.rivals && businessProfile.rivals.length > 0 ? `မဟာဗျူဟာ: ${businessProfile.rivals[0].pricing}` : "စက်ဆန်းရပ်ကွက်ရှိ ဆိုင်ကြီးမှ ဆန်စျေးနှုန်းများ စတင်လျှော့ချလာသည်";
  const rivalStrategyEn = businessProfile?.rivals && businessProfile.rivals.length > 0 ? `Pricing Strategy: ${businessProfile.rivals[0].pricing}` : "Competitor price drop detected in neighboring ward";

  const attentionItems = [
    { type: 'receivables', titleMm: `${overdueCust} - ပေးရန်ကျန်ငွေ ရက်လွန်နေသည်`, titleEn: `${overdueCust} - Receivable outstanding`, descMm: "၁၅ ရက်ကျော် ရက်လွန်နေသဖြင့် အကြောင်းကြားရန် လိုအပ်သည်", descEn: "Overdue by 15 days, send reminder", icon: AlertCircle, color: 'var(--caution)' },
    { type: 'inventory', titleMm: lowStockProdMm, titleEn: lowStockProdEn, descMm: lowStockDescMm, descEn: lowStockDescEn, icon: ShoppingBag, color: 'var(--critical)' },
    { type: 'competitor', titleMm: `${mainRival} မှ စျေးနှုန်း ၅% လျှော့ချလိုက်သည်`, titleEn: `${mainRivalEn} cut prices by 5%`, descMm: rivalStrategyMm, descEn: rivalStrategyEn, icon: TrendingUp, color: 'var(--accent)' }
  ];

  // Top products
  const topProducts = [];
  if (businessProfile?.products && businessProfile.products.length > 0) {
    businessProfile.products.forEach((prod, idx) => {
      if (idx < 3) {
        topProducts.push({
          nameMm: prod.name,
          nameEn: prod.name,
          value: `${(prod.price * 10).toLocaleString()} MMK`,
          pct: 85 - (idx * 25)
        });
      }
    });
  }

  if (topProducts.length < 3) {
    const fallbacks = [
      { nameMm: "ဆန် (Rice Bags)", nameEn: "Rice Bags", value: "850,000 MMK", pct: 75 },
      { nameMm: "စားအုန်းဆီ (Cooking Oil)", nameEn: "Cooking Oil", value: "240,000 MMK", pct: 45 },
      { nameMm: "ပဲအမျိုးမျိုး (Pulses)", nameEn: "Pulses & Beans", value: "110,000 MMK", pct: 20 }
    ];
    fallbacks.forEach(fb => {
      if (topProducts.length < 3 && !topProducts.some(p => p.nameEn === fb.nameEn)) {
        topProducts.push(fb);
      }
    });
  }

  const itemsLowCount = businessProfile?.products && businessProfile.products.length > 0 ? Math.round(businessProfile.products.length / 3) || 1 : 3;

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

      </header>

      {/* 2. HERO PINNED CARDS STRIP */}
      <section>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
          
          {/* Card 1: Today's Sales */}
          <div 
            className="flex-1 min-w-[280px]"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}
          >
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.salesToday}
            </span>
            <div className="font-number" style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 700 }}>
              {dailySales.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>MMK</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {language === 'mm' ? "ပျမ်းမျှ နေ့စဉ်ရောင်းအားပေါ် အခြေခံထားသည်" : "Calculated from daily averages"}
            </div>
          </div>

          {/* Card 2: Receivables */}
          <div 
            className="flex-1 min-w-[280px]"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}
          >
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.outstandingReceivables}
            </span>
            <div className="font-number" style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 700 }}>
              2,450 <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>MMK</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              <span style={{ color: 'var(--caution)', fontWeight: 600 }}>{language === 'mm' ? "၂ ဆိုင် ကျန်ရှိနေသည်" : "2 invoices outstanding"}</span>
            </div>
          </div>

          {/* Card 3: Weekly Profit */}
          <div 
            className="flex-1 min-w-[280px]"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--border-default)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}
          >
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.weeklyProfit}
            </span>
            <div className="font-number" style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 700 }}>
              {Math.round(netProfit / 4).toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>MMK</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              <span style={{ color: 'var(--positive)', fontWeight: 600 }}>+8.2% {language === 'mm' ? "တိုးတက်လာသည်" : "increase this week"}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. WEEK STRIP GRID */}
      <section style={{ padding: '8px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div>
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.mtdRevenue}
            </span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {monthlySales.toLocaleString()} MMK
            </div>
          </div>
          <div>
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.outstandingCash}
            </span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              3,120 MMK
            </div>
          </div>
          <div>
            <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.itemsLow}
            </span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {itemsLowCount} {language === 'mm' ? "မျိုး" : "Items"}
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
                {/* Solid progress bar */}
                <div style={{ width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${prod.pct}%`,
                    height: '100%',
                    background: 'var(--accent)'
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
