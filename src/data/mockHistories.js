export const mockHistories = [
  {
    id: 'current',
    name: 'Clothing Retail Strategy — Today',
    profile: {
      product: 'Clothing Apparel',
      hasPOS: true,
      sales: {
        daily: 500,
        weekly: 3000,
        monthly: 12000,
        yearly: 140000
      },
      expenses: 8000,
      rivals: [
        { name: 'Fashion Corner', pricing: 'Discount Leader (10% cheaper)', audience: 'Online Consumers' },
        { name: 'Metro Style', pricing: 'Premium Brand (15% more expensive)', audience: 'SMB Retailers' }
      ],
      targetScenario: 'Competitor Price Cut',
      expectedResult: 'Less Profit'
    }
  },
  {
    id: 'history1',
    name: 'Grocery Mart Review — Yesterday',
    profile: {
      product: 'Grocery Staples',
      hasPOS: true,
      sales: {
        daily: 1200,
        weekly: 8000,
        monthly: 32000,
        yearly: 380000
      },
      expenses: 22000,
      rivals: [
        { name: 'Super Mart', pricing: 'Discount Leader (10% cheaper)', audience: 'Online Consumers' }
      ],
      targetScenario: 'Supply Chain Cost Inflation',
      expectedResult: 'Supplier Cost Increase'
    }
  },
  {
    id: 'history2',
    name: 'Artisan Boutique Plan — Oct 12',
    profile: {
      product: 'Handicraft Ornaments',
      hasPOS: false,
      sales: {
        daily: 150,
        weekly: 1000,
        monthly: 4000,
        yearly: 48000
      },
      expenses: 2500,
      rivals: [],
      targetScenario: 'Customer Credit Demands',
      expectedResult: 'Sales Drop / Fewer Customers'
    }
  }
];
