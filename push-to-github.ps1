# Push to GitHub Helper Script
# This script will help you push the project to GitHub with proper authentication

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HR System - Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Ensure Git PATH is available
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Navigate to project directory
cd "c:\Users\compa\OneDrive\School\jomi\hr2"

Write-Host "`n✓ Repository configured:" -ForegroundColor Green
git config --list | Select-String "user\|remote"

Write-Host "`n📋 Commits ready:" -ForegroundColor Cyan
git log --oneline -1

Write-Host "`n🔐 To push to GitHub, you have two options:" -ForegroundColor Yellow

Write-Host "`nOPTION 1: Use Personal Access Token (Recommended)" -ForegroundColor White
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "2. Click 'Generate new token' → 'Generate new token (classic)'" -ForegroundColor Gray
Write-Host "3. Name it 'hr-system-push'" -ForegroundColor Gray
Write-Host "4. Select scopes: repo + workflow" -ForegroundColor Gray
Write-Host "5. Copy the token (save it somewhere)" -ForegroundColor Gray
Write-Host "6. Run this command:" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host "   Username: joymayers" -ForegroundColor Cyan
Write-Host "   Password: [paste your token]" -ForegroundColor Cyan

Write-Host "`nOPTION 2: Store Credentials in Git" -ForegroundColor White
Write-Host "Run these commands:" -ForegroundColor Gray
Write-Host "   git config --global credential.helper wincred" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host "   (Enter credentials when prompted)" -ForegroundColor Cyan

Write-Host "`n" -ForegroundColor Gray
Write-Host "Ready to push? You can now run:" -ForegroundColor Green
Write-Host "  git push -u origin main" -ForegroundColor Cyan
