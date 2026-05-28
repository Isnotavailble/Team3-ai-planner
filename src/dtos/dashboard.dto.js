export const mapToDashboardDTO = (businessProfile, language = 'mm') => {
  // Dynamic Metrics
  let derivedDaily = 0;
  if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
    const total = businessProfile.salesHistory.reduce((sum, h) => sum + (h.sales || 0), 0);
    derivedDaily = Math.round(total / businessProfile.salesHistory.length);
  }

  const dailySales = derivedDaily || businessProfile?.sales?.daily || null;
  const weeklySales = businessProfile?.sales?.weekly || null;
  const monthlySales = businessProfile?.sales?.monthly || null;
  const yearlySales = businessProfile?.sales?.yearly || null;
  const monthlyExpenses = businessProfile?.expenses || null;
  const netProfit = (monthlySales !== null && monthlyExpenses !== null) ? monthlySales - monthlyExpenses : null;

  const availablePeriods = [];
  if (dailySales !== null) availablePeriods.push('daily');
  if (weeklySales !== null) availablePeriods.push('weekly');
  if (monthlySales !== null) availablePeriods.push('monthly');
  if (yearlySales !== null) availablePeriods.push('yearly');

  let chartData = [];
  if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
    chartData = businessProfile.salesHistory.map(h => ({
      name: h.date,
      sales: h.sales
    })).reverse();
  }

  // Business Network
  const networkItems = [];
  if (businessProfile?.suppliers && businessProfile.suppliers.length > 0) {
    businessProfile.suppliers.forEach(s => {
      networkItems.push({ 
        type: 'supplier', 
        name: s.name, 
        detail: s.products?.join(', ') || (language === 'mm' ? 'ကုန်ပစ္စည်းသွင်းသူ' : 'Supplier'), 
        contact: s.contactMasked 
      });
    });
  }
  if (businessProfile?.customers && businessProfile.customers.length > 0) {
    businessProfile.customers.forEach(c => {
      networkItems.push({ 
        type: 'customer', 
        name: c.name, 
        detail: language === 'mm' ? 'ဖောက်သည်' : 'Customer', 
        contact: c.contact 
      });
    });
  }

  // Needs Attention items (Mocked AI Responses)
  const attentionItems = [
    { 
      type: 'receivables', 
      titleMm: "ဦးအောင်ကျော် - ပေးရန်ကျန်ငွေ ရက်လွန်နေသည်", 
      titleEn: "U Aung Kyaw - Receivable outstanding", 
      descMm: "၁၅ ရက်ကျော် ရက်လွန်နေသဖြင့် အကြောင်းကြားရန် လိုအပ်သည်", 
      descEn: "Overdue by 15 days, send reminder", 
      icon: 'AlertCircle', 
      color: 'var(--caution)' 
    },
    { 
      type: 'inventory', 
      titleMm: "ဆန်ကုန်စည်လက်ကျန် နည်းနေပါသည်", 
      titleEn: "Rice bags inventory level low", 
      descMm: "လက်ကျန် ၃ အိတ်သာရှိတော့သဖြင့် ထပ်မံမှာယူရန် အကြံပြုပါသည်", 
      descEn: "Only 3 bags left, reorder threshold reached", 
      icon: 'ShoppingBag', 
      color: 'var(--critical)' 
    },
    { 
      type: 'competitor', 
      titleMm: "ပြိုင်ဘက် ဆိုင်ကြီး မှ စျေးနှုန်း ၅% လျှော့ချလိုက်သည်", 
      titleEn: "Rival Shop cut prices by 5%", 
      descMm: "စက်ဆန်းရပ်ကွက်ရှိ ဆိုင်ကြီးမှ ဆန်စျေးနှုန်းများ စတင်လျှော့ချလာသည်", 
      descEn: "Competitor price drop detected in neighboring ward", 
      icon: 'TrendingUp', 
      color: 'var(--accent)' 
    }
  ];

  // Top products
  const topProducts = [];
  if (businessProfile?.products && businessProfile.products.length > 0) {
    businessProfile.products.forEach((prod, idx) => {
      if (idx < 3) {
        topProducts.push({
          nameMm: prod.name,
          nameEn: prod.name,
          value: `${prod.price.toLocaleString()} MMK`
        });
      }
    });
  }

  const itemsLowCount = businessProfile?.products && businessProfile.products.length > 0 ? Math.round(businessProfile.products.length / 3) : null;

  return {
    metrics: {
      dailySales,
      weeklySales,
      monthlySales,
      yearlySales,
      monthlyExpenses,
      netProfit,
      itemsLowCount
    },
    availablePeriods,
    chartData,
    networkItems,
    attentionItems,
    topProducts
  };
};
