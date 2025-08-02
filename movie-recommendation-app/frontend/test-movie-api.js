// Test movie API with production URL
const API_URL = 'https://movie-recommendation-api-6kmu.onrender.com/api/v1';

async function testMovieAPI() {
  console.log('🔍 Testing Movie API...');
  console.log(`📡 API URL: ${API_URL}`);
  console.log('');

  try {
    // Test base API
    console.log('1. Testing base API...');
    const baseResponse = await fetch(API_URL);
    if (baseResponse.ok) {
      const baseData = await baseResponse.json();
      console.log('✅ Base API working:', baseData.message);
    } else {
      console.log('❌ Base API failed:', baseResponse.status);
    }

    console.log('');

    // Test movies endpoint
    console.log('2. Testing movies endpoint...');
    const moviesResponse = await fetch(`${API_URL}/movies/?type=trending&page=1`);
    if (moviesResponse.ok) {
      const moviesData = await moviesResponse.json();
      console.log('✅ Movies API working!');
      console.log(`📊 Found ${moviesData.results?.length || 0} movies`);
      console.log(`📄 Total pages: ${moviesData.total_pages || 0}`);
    } else {
      console.log('❌ Movies API failed:', moviesResponse.status);
      const errorText = await moviesResponse.text();
      console.log('📝 Error details:', errorText);
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

testMovieAPI(); 