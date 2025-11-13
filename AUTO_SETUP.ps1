# Voice Beyond - Automatic Setup Script
# This script will:
# 1. Create grandpa character
# 2. Upload voice model
# 3. Open chat

Write-Host "================================" -ForegroundColor Magenta
Write-Host "Voice Beyond - Auto Setup" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta
Write-Host ""

# Check if backend is running
Write-Host "[1/4] Checking backend..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not running!" -ForegroundColor Red
    Write-Host "Starting backend..." -ForegroundColor Yellow
    Start-Process -FilePath "py" -ArgumentList "simple_server.py" -WorkingDirectory "$PSScriptRoot\backend"
    Start-Sleep -Seconds 5
}

# Create grandpa character in localStorage (via HTML page)
Write-Host ""
Write-Host "[2/4] Opening setup wizard..." -ForegroundColor Cyan
Start-Process "$PSScriptRoot\setup_grandpa.html"

Write-Host ""
Write-Host "================================" -ForegroundColor Magenta
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. In the opened page, click 'Create Grandpa Character'" -ForegroundColor White
Write-Host "2. Select grandpa from dropdown" -ForegroundColor White
Write-Host "3. Upload kamal_50e_1750s.pth" -ForegroundColor White
Write-Host "4. Go to chat and test!" -ForegroundColor White
Write-Host "================================" -ForegroundColor Magenta

Read-Host "Press Enter to continue..."
