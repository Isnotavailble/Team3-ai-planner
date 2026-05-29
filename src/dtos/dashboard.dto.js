export const mapToDashboardDTO = (businessProfile, language = 'mm') => {
  // Dynamic Metrics
  // NOTE: salesHistory can be either:
  // - daily aggregates: { date, sales, expenses }
  // - transaction list: { date, customer|counterparty, sales|amount, expenses }
  // We normalize it here.
  const normalizedSalesHistory = Array.isArray(businessProfile?.salesHistory)
    ? businessProfile.salesHistory
    : [];

  // Aggregate per day for chart
  const dailyTotalsMap = new Map(); // date -> { sales, expenses }
  for (const row of normalizedSalesHistory) {
    const date =
      row?.date ||
      (row?.occurredAt ? String(row.occurredAt).split('T')[0] : null);
    if (!date) continue;

    const salesVal = row?.sales ?? row?.amount ?? 0;
    const expenseVal = row?.expenses ?? 0;

    const prev = dailyTotalsMap.get(date) || { sales: 0, expenses: 0 };
    dailyTotalsMap.set(date, {
      sales: prev.sales + (Number(salesVal) || 0),
      expenses: prev.expenses + (Number(expenseVal) || 0)
    });
  }

  const dailyTotals = Array.from(dailyTotalsMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  // Derived daily sales average from available salesHistory
  let derivedDaily = null;
  if (dailyTotals.length > 0) {
    const total = dailyTotals.reduce((sum, h) => sum + (h.sales || 0), 0);
    derivedDaily = Math.round(total / dailyTotals.length);
  }

  const dailySales = derivedDaily ?? businessProfile?.sales?.daily ?? null;
  const weeklySales = businessProfile?.sales?.weekly || null;
  const monthlySales = businessProfile?.sales?.monthly || null;
  const yearlySales = businessProfile?.sales?.yearly || null;
  const monthlyExpenses = businessProfile?.expenses ?? null;
  const netProfit = (monthlySales !== null && monthlyExpenses !== null) ? monthlySales - monthlyExpenses : null;

  const availablePeriods = [];
  if (dailySales !== null) availablePeriods.push('daily');
  if (weeklySales !== null) availablePeriods.push('weekly');
  if (monthlySales !== null) availablePeriods.push('monthly');
  if (yearlySales !== null) availablePeriods.push('yearly');

  let chartData = [];
  if (dailyTotals.length > 0) {
    chartData = dailyTotals.map(h => ({
      name: h.date,
      sales: h.sales
    }));
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

  // Top customers (based on salesHistory transaction/customer fields)
  let topCustomers = [];
  if (normalizedSalesHistory.length > 0) {
    const totals = new Map(); // customer -> total sales
    for (const row of normalizedSalesHistory) {
      const customer = row?.customer || row?.counterparty;
      if (!customer) continue;
      const salesVal = row?.sales ?? row?.amount ?? 0;
      totals.set(customer, (totals.get(customer) || 0) + (Number(salesVal) || 0));
    }
    topCustomers = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }

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
    topCustomers,
    topProducts
  };
};
