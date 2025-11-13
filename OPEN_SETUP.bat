@echo off
echo ============================================
echo Opening Voice Beyond Setup Wizard...
echo ============================================
echo.
echo Backend Status: RUNNING on port 5000
echo.
echo Next steps:
echo 1. Create Grandpa character
echo 2. Upload voice model (kamal_50e_1750s.pth)
echo 3. Go to chat!
echo.
echo ============================================

start "" "%~dp0setup_grandpa.html"

echo.
echo Setup wizard opened in your browser!
echo.
pause
