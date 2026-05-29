const https = require('https');

const data = JSON.stringify({
  businessProfile: {
    businessName: "Test Tea Shop",
    product: "Tea Shop",
    hasPOS: true,
    sales: { daily: 1000, weekly: 7000, monthly: 30000, yearly: 360000 },
    expenses: 12000,
    rivals: [{ id: 1, name: "Rival Tea Shop", pricing: "Same price as our product" }],
    customers: [{ id: 1, name: "Customer A", contact: "091234567" }],
    suppliers: [{ id: 1, name: "Supplier A", products: ["Tea"], contactMasked: "***-***-4567" }],
    products: [{ id: 1, name: "Laphet Ye", price: 1500 }],
    salesHistory: [],
    targetScenario: null,
    expectedResult: null,
    thresholds: { inventoryLow: 10 }
  },
  isUpdate: true
});

const options = {
  hostname: 'hlqqsdineoprjxrzzdpi.supabase.co',
  path: '/functions/v1/api/workspace',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sb_publishable_QXo9bh7HJD1nVJZInluqYg_zWp80Y85',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response body:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.write(data);
req.end();
