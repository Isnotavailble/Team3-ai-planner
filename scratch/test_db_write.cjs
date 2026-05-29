const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = 'https://hlqqsdineoprjxrzzdpi.supabase.co';
const supabaseAnonKey = 'sb_publishable_QXo9bh7HJD1nVJZInluqYg_zWp80Y85';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    console.log('Signing in anonymously or creating test user...');
    
    // Sign up a test user
    const email = `test_user_${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) {
      throw authError;
    }
    
    const session = authData.session;
    if (!session) {
      throw new Error('No session returned after sign up.');
    }
    
    console.log('Authentication successful. JWT retrieved.');
    const jwt = session.access_token;
    
    const requestData = {
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
    };
    
    console.log('Sending update request to workspace edge function...');
    const response = await axios.post(`${supabaseUrl}/functions/v1/api/workspace`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      }
    });
    
    console.log('Status Code:', response.status);
    console.log('Response body:', response.data);
    
  } catch (error) {
    console.error('Test Failed!');
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Response body:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

run();
