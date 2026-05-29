export const mockHistories = [
  {
    id: 'current',
    name: 'Clothing Retail Strategy — Today',
    profile: {
      product: 'Clothing Apparel',
      hasPOS: true,
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
