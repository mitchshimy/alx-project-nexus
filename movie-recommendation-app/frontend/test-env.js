// Test environment variable loading
// Run this to verify .env.local is working

console.log('🔍 Testing environment variables...');
console.log('');

// Simulate Next.js environment variable loading
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

console.log('📡 API URL from environment:', API_URL);
console.log('');

if (API_URL.includes('onrender.com')) {
  console.log('✅ Environment variable is set correctly!');
  console.log('🎯 Frontend will use production API');
} else {
  console.log('❌ Environment variable not set correctly');
  console.log('💡 Make sure .env.local exists with:');
  console.log('   NEXT_PUBLIC_API_URL=https://movie-recommendation-api-6kmu.onrender.com/api/v1');
}

console.log('');
console.log('📋 Next steps:');
console.log('1. Visit http://localhost:3000');
console.log('2. Open browser console');
console.log('3. Check for API connectivity messages');
console.log('4. Test user registration/login');
console.log('5. Test movie browsing and search'); 