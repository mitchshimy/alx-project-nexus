# PowerShell script to set up environment variables for frontend
# Run this script to create .env.local file

$envContent = @"
# Frontend Environment Variables
# Point to your deployed backend API
NEXT_PUBLIC_API_URL=https://movie-recommendation-api-6kmu.onrender.com/api/v1

# Development settings
NODE_ENV=development
"@

# Create .env.local file
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Environment file created successfully!" -ForegroundColor Green
Write-Host "📁 File: .env.local" -ForegroundColor Cyan
Write-Host "🔗 API URL: https://movie-recommendation-api-6kmu.onrender.com/api/v1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Restart your development server" -ForegroundColor White
Write-Host "2. Test API connectivity" -ForegroundColor White
Write-Host "3. Check browser console for any errors" -ForegroundColor White 