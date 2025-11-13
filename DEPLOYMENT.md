# Voice Beyond - Complete Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Python 3.8+** installed
- **Git** installed
- **Modern web browser** (Chrome, Firefox, Edge, Safari)
- **Internet connection** (for AI API)

### One-Command Setup

```powershell
# Clone and setup
git clone https://github.com/pattieyme-cell/Voice-Beyond.git
cd Voice-Beyond
pip install -r requirements.txt
python app.py
```

Then open **index.html** in your browser!

---

## 📋 Detailed Setup Instructions

### Step 1: Install Dependencies

```powershell
# Navigate to project directory
cd "C:\voice beyond"

# Install Python packages
pip install -r requirements.txt
```

**Requirements installed:**
- Flask (Web framework)
- Flask-CORS (Cross-origin requests)
- Flask-SQLAlchemy (Database)
- PyJWT (Authentication)
- pymongo (Optional - for chat history)
- requests (API calls)
- python-dotenv (Environment variables)

### Step 2: Configure Environment

The `.env` file is already configured with:
- **Gemini AI** as the default provider (FREE with API key included)
- **SQLite** database (no setup required)
- **MongoDB** optional (app works without it)

**Your `.env` configuration:**
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyC8aD9wUWEYlIfhJb5ts0jyPbN0p-HKxzM
```

### Step 3: Start the Backend

```powershell
# Option 1: Direct Python
python app.py

# Option 2: Use provided script
.\start_app.bat
```

**Expected output:**
```
✅ MongoDB connected successfully
 * Running on http://0.0.0.0:5000
 * Running on http://127.0.0.1:5000
```

Note: If MongoDB warning appears, that's OK! The app works without it.

### Step 4: Open the Frontend

**Option 1: Direct File**
```powershell
# Double-click in File Explorer
start index.html
```

**Option 2: Local Server (Recommended)**
```powershell
# Using Python's built-in server
python -m http.server 8080

# Or using npx (if Node.js installed)
npx http-server -p 8080
```

Then visit: **http://localhost:8080**

---

## 🎯 Using the Application

### 1. Create an Account

1. Open **index.html** or visit http://localhost:8080
2. Click **"Sign In"** → **"Register"**
3. Enter username, email, and password
4. Click **"Create Account"**

### 2. Create Your First AI Companion

1. Go to **"Create"** page
2. Fill in the character details:
   - **Name**: e.g., "Grandma", "Mom", "Best Friend"
   - **Relationship**: e.g., "Grandmother", "Mother"
   - **Personality**: e.g., "warm and caring", "funny and supportive"
   - **Age**: e.g., "75"
   - **Favorite Topics**: e.g., "cooking, gardening, family stories"
   - **Special Memories**: Share a special memory with them
3. Optionally upload a voice sample (for future voice cloning)
4. Click **"Create Character"**

### 3. Start Chatting

1. Go to **"Chat"** page
2. Select your AI companion from the sidebar
3. Type your message and press Enter
4. The AI will respond based on the personality you configured!

**Example conversation:**
```
You: Hi Grandma, I've been missing you lately.
AI Grandma: Oh sweetie, I miss you too! Tell me what's been going on in your life. You know I'm always here to listen.
```

---

## 🔧 Configuration Options

### Switching AI Providers

Edit `.env` file:

#### Option 1: Gemini (Default - FREE)
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyC8aD9wUWEYlIfhJb5ts0jyPbN0p-HKxzM
```

#### Option 2: OpenAI (Requires API key)
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
```

#### Option 3: Ollama (FREE Local AI)
```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
```

**To use Ollama:**
1. Install Ollama from https://ollama.ai
2. Run: `ollama pull phi3:mini`
3. Start Ollama: `ollama serve`
4. Restart the Flask backend

### Database Configuration

**SQLite (Default)**: 
- No setup required
- Database auto-created at `instance/voice_beyond.db`
- Perfect for local development

**MongoDB (Optional)**:
```env
MONGODB_URI=mongodb://localhost:27017
MONGO_DB_NAME=voice_beyond_db
```

MongoDB stores chat history. If not available, chat history is not persisted but the app still works!

---

## 📊 Project Structure

```
Voice-Beyond/
├── app.py                  # Main Flask backend
├── requirements.txt        # Python dependencies
├── .env                   # Environment configuration
├── instance/              # Auto-created
│   └── voice_beyond.db   # SQLite database
├── uploads/              # User voice samples
├── index.html            # Landing page
├── login.html            # Login/Register
├── create.html           # Create character
├── dashboard.html        # User dashboard
├── chat.html             # Chat interface
├── about.html            # About page
├── style.css             # Complete styling
├── script.js             # Frontend logic
└── backend/              # Voice cloning (optional)
    ├── app.py            # RVC voice backend
    ├── models/           # Voice models (.pth)
    └── uploads/          # Voice samples
```

---

## 🎨 Features Included

✅ **Complete Web Interface**
- Beautiful lavender-themed responsive design
- Landing page with hero section
- About page explaining the mission
- Login/Register with JWT authentication
- Character creation form
- Dashboard with character management
- WhatsApp-style chat interface

✅ **Backend API**
- User authentication (register, login)
- Character CRUD operations
- AI chat integration (Gemini/OpenAI/Ollama)
- Voice sample upload
- Chat history (with MongoDB)
- ElevenLabs voice integration (optional)

✅ **AI Integration**
- Personality-based responses
- Character metadata in prompts
- Multiple AI provider support
- Graceful fallbacks

✅ **Database**
- SQLite for users and characters
- MongoDB for chat history (optional)
- Automatic schema creation

---

## 🔍 Testing the Application

### Test 1: Backend Health Check
```powershell
curl http://localhost:5000/api/health
```

**Expected:** `{"status":"ok","ai_provider":"gemini"}`

### Test 2: Register User
```powershell
curl -X POST http://localhost:5000/api/register `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

**Expected:** Returns JWT token

### Test 3: Create Character
```powershell
# Save your token from registration
$token = "your-jwt-token-here"

curl -X POST http://localhost:5000/api/characters `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"name":"Test Character","metadata":{"personality":"friendly"}}'
```

### Test 4: Send Chat Message
```powershell
curl -X POST http://localhost:5000/api/chat `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"character_id":1,"message":"Hello!"}'
```

**Expected:** Returns AI response

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Solution 1: Check Python version**
```powershell
python --version  # Should be 3.8 or higher
```

**Solution 2: Reinstall dependencies**
```powershell
pip install --upgrade -r requirements.txt
```

**Solution 3: Check port availability**
```powershell
netstat -ano | findstr :5000
# If port in use, kill the process or change PORT in .env
```

### Issue: AI not responding

**For Gemini:**
- Check GEMINI_API_KEY in .env
- Verify internet connection
- Check backend console for errors

**For Ollama:**
```powershell
# Check if Ollama is running
curl http://localhost:11434/api/generate -d '{"model":"phi3:mini","prompt":"test"}'
```

**For OpenAI:**
- Verify OPENAI_API_KEY is valid
- Check API quota/billing

### Issue: Database errors

```powershell
# Reset database
Remove-Item -Path "instance\voice_beyond.db" -ErrorAction SilentlyContinue
python app.py  # Recreates database
```

### Issue: CORS errors

- Make sure backend is running on port 5000
- Check browser console for specific errors
- Verify API_BASE_URL in script.js matches backend

### Issue: Characters not loading

1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify localStorage: `localStorage.getItem('voiceBeyondCharacters')`

---

## 🌐 Deployment to Production

### Option 1: Heroku

```powershell
# Install Heroku CLI, then:
heroku create voice-beyond-app
git push heroku master
heroku config:set GEMINI_API_KEY=your-key-here
```

### Option 2: Railway

1. Visit https://railway.app
2. Connect GitHub repo
3. Add environment variables
4. Deploy automatically

### Option 3: DigitalOcean/AWS/Azure

1. Setup Ubuntu server
2. Install Python 3.8+
3. Clone repository
4. Install dependencies
5. Setup gunicorn:
```bash
gunicorn --bind 0.0.0.0:5000 app:app
```
6. Setup Nginx as reverse proxy
7. Configure domain and SSL

### Option 4: Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

```powershell
docker build -t voice-beyond .
docker run -p 5000:5000 voice-beyond
```

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | gemini | AI provider: gemini, openai, ollama |
| `GEMINI_API_KEY` | Yes* | - | Google Gemini API key |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |
| `OLLAMA_URL` | No | http://localhost:11434 | Ollama server URL |
| `ELEVENLABS_API_KEY` | No | - | ElevenLabs voice API key |
| `MONGODB_URI` | No | mongodb://localhost:27017 | MongoDB connection |
| `JWT_SECRET` | No | super-secret-key | JWT signing key |
| `PORT` | No | 5000 | Server port |

*One AI provider key is required

---

## 🎓 Usage Tips

### For Best AI Responses

1. **Be specific about personality**: "Warm and caring grandmother who loves cooking" is better than "nice person"
2. **Add favorite topics**: Helps AI generate relevant conversations
3. **Include special memories**: Makes responses more personal
4. **Use age and relationship**: Affects how AI responds

### Chat Tips

- Share your real feelings honestly
- Talk about specific memories
- Ask for the support you need
- Take breaks when needed
- Remember: This is a healing tool, not a replacement for therapy

---

## 🔐 Security Notes

### For Development (Current Setup)
- JWT secret is basic - OK for local testing
- CORS allows all origins - OK for local testing
- No HTTPS - OK for local testing

### For Production
1. **Change JWT_SECRET** to a random 32+ character string
2. **Restrict CORS** to your domain only
3. **Enable HTTPS** (Let's Encrypt is free)
4. **Use environment variables** (never commit secrets)
5. **Setup proper database backup**
6. **Add rate limiting** to prevent abuse
7. **Validate all user inputs**

---

## 📞 Support & Resources

### Documentation
- `README.md` - Project overview
- `WARP.md` - Development guide
- `DEPLOYMENT.md` - This file

### Getting Help
- Check troubleshooting section above
- Review backend console logs
- Check browser DevTools console
- Review Network tab for API errors

### Useful Commands

```powershell
# Check if backend running
curl http://localhost:5000/api/health

# View backend logs (watch for errors)
python app.py

# Clear all data and start fresh
Remove-Item -Path "instance\voice_beyond.db"
python app.py

# Test AI provider
curl -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d "{\"message\":\"test\"}"
```

---

## ✨ What's Working Now

✅ Complete responsive web interface
✅ User registration and authentication
✅ Character creation with personality
✅ AI chat with Gemini (FREE)
✅ Alternative AI providers (OpenAI, Ollama)
✅ Character management
✅ Chat history (with MongoDB)
✅ Voice sample upload
✅ Dashboard with statistics
✅ Mobile-responsive design
✅ Beautiful lavender theme
✅ WhatsApp-style chat interface

---

## 🚧 Future Enhancements (Roadmap)

### Coming in v2.0
- [ ] Real-time voice responses (TTS integration)
- [ ] RVC voice cloning in chat
- [ ] Multi-language support
- [ ] Cloud deployment guides
- [ ] OAuth (Google, Facebook)
- [ ] Advanced analytics

### Coming in v3.0+
- [ ] Mobile apps (iOS/Android)
- [ ] Video avatars
- [ ] Group conversations
- [ ] Professional therapist integration
- [ ] AI model fine-tuning

---

## 💜 You're All Set!

Your Voice Beyond application is ready to help people heal through AI companionship!

**Quick Start Reminder:**
```powershell
python app.py          # Start backend
start index.html       # Open frontend
```

**Need help?** Review the troubleshooting section or check the documentation files.

---

*Made with love and empathy by Pattiee & Team* 💜
*"Where memories find a voice again."* 🎙️
