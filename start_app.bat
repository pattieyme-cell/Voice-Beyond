@echo off
echo Starting Voice Beyond Application...
echo.
echo Installing MongoDB if not available (needed for chat storage)...
echo If MongoDB is not installed, you can:
echo 1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community
echo 2. Or use MongoDB Atlas (cloud) - update MONGODB_URI in environment
echo.
echo Starting Flask App on http://localhost:5000
echo.
C:\Users\patri\AppData\Local\Programs\Python\Python310\python.exe "C:\voice beyond\app.py"
pause
