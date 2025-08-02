// Simple API connectivity test
// Run this with: node test-api.js

const API_URL = 'https://movie-recommendation-api-6kmu.onrender.com/api/v1';

async function testAPI() {
  console.log('🔍 Testing API connectivity...');
  console.log(`📡 API URL: ${API_URL}`);
  console.log('');

  try {
    const response = await fetch(API_URL);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is working!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API returned error status:', response.status);
      console.log('📝 Response:', await response.text());
    }
  } catch (error) {
    console.log('❌ API connection failed:');
    console.log('🔍 Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('1. Check if the backend is deployed and running');
    console.log('2. Verify the API URL is correct');
    console.log('3. Check CORS settings in backend');
    console.log('4. Ensure environment variables are set correctly');
  }
}

testAPI(); 