const https = require('https');

const data = JSON.stringify({
  businessProfile: {
    businessName: null,
    product: null,
    hasPOS: null,
    sales: { daily: null, weekly: null, monthly: null, yearly: null },
    expenses: null,
    rivals: [],
    customers: [],
    suppliers: [],
    products: [],
    salesHistory: [],
    targetScenario: null,
    expectedResult: null,
    thresholds: { inventoryLow: null }
  },
  isUpdate: false
});

const options = {
  hostname: 'hlqqsdineoprjxrzzdpi.supabase.co',
  path: '/functions/v1/api/workspace',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'sb_publishable_QXo9bh7HJD1nVJZInluqYg_zWp80Y85',
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
