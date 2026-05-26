// Simplified B2B Market Mock Data

const TODAY = new Date().toISOString();

export const RAW_ENTITIES = [
  // Subject Company (YOU)
  { id: 'our-app', name: 'Our Platform', type: 'you', x: 720, y: 470, summary: 'Our business. A digital ordering app for local retail shops.' },
  
  // Competitors
  { id: 'competitor-a', name: 'Competitor Platform A', type: 'company', x: 480, y: 348, summary: 'Main competitor. They offer credit to shops.' },
  { id: 'competitor-b', name: 'Competitor POS B', type: 'company', x: 940, y: 380, summary: 'Local POS app competitor.' },
  
  // B2B Policies & Association Entities (Replaced key figures)
  { id: 'comp-a-credit-policy', name: 'Credit Term Policy', type: 'policy', x: 388, y: 248, summary: 'Competitors extended credit limits and 30-day term policies.' },
  { id: 'retail-association-board', name: 'Retail Association Board', type: 'organization', x: 520, y: 236, summary: 'Governing committee representing local retail grocery accounts.' },
  
  // Customer Segments
  { id: 'yangon-shops', name: 'Yangon Retail Shops', type: 'segment', x: 668, y: 218, summary: 'Primary target segment. Small neighborhood grocery stores.' },
  { id: 'mandalay-distrib', name: 'Mandalay Wholesalers', type: 'segment', x: 824, y: 168, summary: 'Large wholesale bulk distributors.' },
  { id: 'bago-shops', name: 'Bago Retail Shops', type: 'segment', x: 680, y: 600, summary: 'Secondary target segment.' },
  
  // Individual Accounts (Duka Shops) - "Huge Data" Expansion
  { id: 'shop-1', name: 'Latha Market', type: 'organization', x: 568, y: 130, summary: 'Shop evaluating our app.' },
  { id: 'shop-2', name: 'Hlaing Mart', type: 'organization', x: 1050, y: 296, summary: 'Active buyer on Competitor Platform A.' },
  { id: 'shop-3', name: 'Sanchaung Grocery', type: 'organization', x: 600, y: 280, summary: 'Uses cash only.' },
  { id: 'shop-4', name: 'Insein Retail', type: 'organization', x: 500, y: 200, summary: 'Looking for a new app.' },
  { id: 'shop-5', name: 'Bahan Mart', type: 'organization', x: 650, y: 150, summary: 'High volume buyer.' },
  { id: 'shop-6', name: 'Yankin Store', type: 'organization', x: 750, y: 120, summary: 'Loyal to traditional wholesalers.' },
  { id: 'shop-7', name: 'Tamwe Shop', type: 'organization', x: 800, y: 250, summary: 'Interested in digital ordering.' },
  { id: 'shop-8', name: 'Pazundaung Mart', type: 'organization', x: 900, y: 180, summary: 'Needs credit.' },
  { id: 'shop-9', name: 'Dagon Seikkan Grocery', type: 'organization', x: 400, y: 400, summary: 'Remote shop.' },
  { id: 'shop-10', name: 'Thaketa Retail', type: 'organization', x: 450, y: 450, summary: 'Growing rapidly.' },
  { id: 'shop-11', name: 'Dawbon Mart', type: 'organization', x: 550, y: 550, summary: 'Needs delivery.' },
  { id: 'shop-12', name: 'Mingalar Taung Nyunt Store', type: 'organization', x: 600, y: 650, summary: 'Wholesale buyer.' },
  { id: 'shop-13', name: 'Kamayut Grocery', type: 'organization', x: 700, y: 700, summary: 'Student area shop.' },
  { id: 'shop-14', name: 'Mayangone Mart', type: 'organization', x: 800, y: 750, summary: 'Premium goods.' },
  { id: 'shop-15', name: 'North Dagon Retail', type: 'organization', x: 900, y: 650, summary: 'Suburban shop.' },

  // Macro Trends
  { id: 'credit-reliance', name: 'Need for Credit', type: 'concept', x: 660, y: 380, summary: 'Shops need credit terms to buy inventory.' },
  { id: 'fast-delivery', name: 'Need Fast Delivery', type: 'concept', x: 480, y: 92, summary: 'Shops want same-day delivery.' },

  // Internal Platform
  { id: 'sz-ledger', name: 'Ordering Platform Catalog', type: 'product', x: 832, y: 530, summary: 'Our main ordering platform catalog features.' }
];

export const RAW_EDGES = [
  // B2B Market links
  { a: 'competitor-a', b: 'yangon-shops', kind: 'active', label: 'selling_to' },
  { a: 'our-app', b: 'yangon-shops', kind: 'active', label: 'selling_to' },
  { a: 'our-app', b: 'bago-shops', kind: 'quiet', label: 'selling_to' },
  { a: 'competitor-a', b: 'our-app', kind: 'tension', label: 'competing_for_shops' },
  { a: 'competitor-b', b: 'our-app', kind: 'tension', label: 'competing_for_shops' },
  { a: 'comp-a-credit-policy', b: 'competitor-a', kind: 'strong', label: 'feature_of' },
  { a: 'retail-association-board', b: 'yangon-shops', kind: 'strong', label: 'partners_with' },
  
  // Shops
  { a: 'shop-1', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-2', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-3', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-4', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-5', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-6', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-7', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-8', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-9', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-10', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-11', b: 'bago-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-12', b: 'bago-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-13', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-14', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },
  { a: 'shop-15', b: 'yangon-shops', kind: 'quiet', label: 'retailer' },

  { a: 'shop-2', b: 'competitor-a', kind: 'strong', label: 'buys_from' },
  { a: 'shop-4', b: 'competitor-a', kind: 'active', label: 'buys_from' },
  { a: 'shop-8', b: 'competitor-a', kind: 'active', label: 'buys_from' },
  { a: 'shop-1', b: 'our-app', kind: 'strong', label: 'orders_on' },
  { a: 'shop-5', b: 'our-app', kind: 'active', label: 'orders_on' },
  { a: 'shop-7', b: 'our-app', kind: 'active', label: 'orders_on' },
  { a: 'shop-10', b: 'our-app', kind: 'active', label: 'orders_on' },
  
  // Needs
  { a: 'shop-1', b: 'credit-reliance', kind: 'active', label: 'addresses_need' },
  { a: 'shop-8', b: 'credit-reliance', kind: 'strong', label: 'addresses_need' },
  { a: 'shop-11', b: 'fast-delivery', kind: 'strong', label: 'addresses_need' },
  { a: 'shop-15', b: 'fast-delivery', kind: 'active', label: 'addresses_need' },
  
  // Supplier links
  { a: 'our-app', b: 'mandalay-distrib', kind: 'active', label: 'partners_with' },
  { a: 'competitor-a', b: 'mandalay-distrib', kind: 'active', label: 'partners_with' },
  { a: 'our-app', b: 'sz-ledger', kind: 'strong', label: 'offers_product' }
];

export const RAW_MATERIALS = [
  {
    id: 'm-zaycho-credit',
    title: 'Competitor introduces Merchant Credit Program',
    type: 'News Leak',
    source: 'Local Retail Digest',
    summary: 'Press announcement detailing Competitors new credit terms for shops.',
    body: 'Competitor Platform A today introduced merchant credit options for registered retailers in Yangon.',
    extracted: ['competitor-a', 'yangon-shops', 'comp-a-credit-policy', 'credit-reliance']
  },
  {
    id: 'm-association-newsletter',
    title: 'Yangon Retailers Association Monthly Bulletin',
    type: 'Newsletter',
    source: 'YRA Office',
    summary: 'Newsletter showing store preferences for credit and digital ordering.',
    body: 'The monthly survey shows 72% of shop owners prefer apps that offer credit.',
    extracted: ['yangon-shops', 'our-app', 'competitor-a', 'credit-reliance']
  }
];

export const RAW_SIM_RESULTS = {
  'main': {
    verdict: 'Suggested Decision: Partner with Mandalay Wholesalers to offer a credit limit to shops. Without credit, you will lose 40% of shops to Competitor Platform A.',
    confidence: 0.85,
    scenarios: [
      { title: 'Aggressive Market Capture', prob: 0, desc: 'Heavy investment leads to massive market share capture.', strong: true },
      { title: 'Targeted Segment Growth', prob: 0, desc: 'Solid growth in specific key verticals.', strong: true },
      { title: 'Status Quo', prob: 0, desc: 'Market remains stable with no major changes.', strong: false },
      { title: 'Slight Contraction', prob: 0, desc: 'Minor loss of accounts due to pricing pressure.', strong: false },
      { title: 'Price War Attrition', prob: 0, desc: 'Heavy discounting leads to margin squeeze.', strong: false },
      { title: 'Competitor Monopolization', prob: 0, desc: 'Major loss of market share to aggressive competitors.', strong: false },
      { title: 'Total Market Retreat', prob: 0, desc: 'Critical loss of accounts forcing market exit.', strong: false }
    ],
    dynamics: [
      'Shops need credit to buy inventory.',
      'Shops will choose the app that offers the best credit terms.',
      'Fast delivery is important, but credit is essential.'
    ],
    criticalAgents: [
      { id: 'ag-zc-policy', name: 'Credit Term Policy', role: 'Competitor Term System', entityId: 'comp-a-credit-policy', initials: 'CP' },
      { id: 'ag-latha', name: 'Latha Owner', role: 'Retailer', entityId: 'shop-1', initials: 'LM' }
    ]
  }
};
