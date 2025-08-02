// Debug environment variable loading
// This will help us understand if the .env.local file is being read

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging environment variables...');
console.log('');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists');
  const content = fs.readFileSync(envLocalPath, 'utf8');
  console.log('📄 Content:', content);
} else {
  console.log('❌ .env.local file does not exist');
}

console.log('');
console.log('🔧 Current working directory:', process.cwd());
console.log('📁 Files in current directory:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    if (file.startsWith('.env')) {
      console.log(`  📄 ${file}`);
    }
  });
} catch (error) {
  console.log('❌ Error reading directory:', error.message);
}

console.log('');
console.log('💡 Next steps:');
console.log('1. Make sure .env.local contains: NEXT_PUBLIC_API_URL=https://movie-recommendation-api-6kmu.onrender.com/api/v1');
console.log('2. Restart the Next.js development server');
console.log('3. Check browser console for API calls'); 