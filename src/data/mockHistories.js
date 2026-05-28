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
      expectedResult: 'Less Profit',
      customers: [],
      products: [],
      suppliers: [],
      salesHistory: [],
      thresholds: { inventoryLow: 10 }
    }
  }
];
