import React from 'react';

export default function DebugEnv() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Environment Variables Debug</h1>
      
      <h2>Client-side Environment Variables:</h2>
      <pre>
        NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}
      </pre>
      
      <h2>API Base URL:</h2>
      <pre>
        {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}
      </pre>
      
      <h2>Test API Call:</h2>
      <button 
        onClick={async () => {
          const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
          console.log('Testing API call to:', url);
          try {
            const response = await fetch(url);
            const data = await response.json();
            console.log('✅ API Response:', data);
            alert('API call successful! Check console for details.');
          } catch (error) {
            console.error('❌ API Error:', error);
            alert('API call failed! Check console for details.');
          }
        }}
      >
        Test API Call
      </button>
      
      <h2>Instructions:</h2>
      <ul>
        <li>Check the console for API_BASE_URL logs</li>
        <li>Click the test button to verify API connectivity</li>
        <li>If it shows localhost:8000, the environment variable isn't loaded</li>
        <li>If it shows onrender.com, the environment variable is working</li>
      </ul>
    </div>
  );
} 